import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RecycleBinService, PostgresAdapter } from '@crty/recycle-bin-core';

dotenv.config();

const server = fastify({ logger: true });

// Read environment variables
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/recycle_bin';
const JWT_SECRET = process.env.JWT_SECRET || 'crty_recycle_bin_secret_key';
const API_KEY = process.env.API_KEY || 'crty_api_key_default';
const ALLOWED_CORS = process.env.CORS_ORIGINS || '*';

// Register CORS
server.register(cors, {
  origin: ALLOWED_CORS,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
});

// Register Rate Limiting
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Setup DB connection and Recycle Bin Core Service
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PostgresAdapter(DATABASE_URL);
const service = new RecycleBinService(pool, adapter);

// Helper for sending standardised API errors
function sendError(reply: any, statusCode: number, code: string, message: string, details?: any) {
  return reply.status(statusCode).send({
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId: reply.request.id,
  });
}

// Authentication & Tenant Validation Hook
server.addHook('preHandler', async (request, reply) => {
  // Exclude healthcheck or options routes
  if (request.url === '/health' || request.method === 'OPTIONS') {
    return;
  }

  // 1. Tenant Check: Verify X-Site-ID header is present
  const siteId = request.headers['x-site-id'] as string;
  if (!siteId) {
    return sendError(reply, 400, 'MISSING_SITE_ID', 'X-Site-ID header is required');
  }

  // Attach siteId to request for route usage
  (request as any).siteId = siteId;

  // 2. Auth Check: Verify Bearer Token or API Key
  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(reply, 401, 'UNAUTHORIZED', 'Bearer token is missing or malformed');
  }

  const token = authHeader.substring(7);

  // Check direct API Key matching first (for server-to-server SDK communication)
  if (token === API_KEY) {
    (request as any).user = { role: 'admin', userId: 'system' };
    return;
  }

  // Otherwise, verify as JWT token (for dashboard frontend UI users)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; siteId: string };
    
    // Verify that JWT matches current tenant siteId
    if (decoded.siteId !== siteId) {
      return sendError(reply, 403, 'FORBIDDEN', 'Token is not valid for this Site ID');
    }

    (request as any).user = decoded;
  } catch (err) {
    return sendError(reply, 401, 'INVALID_TOKEN', 'Session token is invalid or expired');
  }
});

// GET /health
server.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date() };
});

// POST /api/v1/recycle-bin/items -> Create item (Backup/Soft Delete)
server.post('/api/v1/recycle-bin/items', async (request, reply) => {
  const siteId = (request as any).siteId;
  const body = request.body as any;

  if (!body.contentType || !body.originalId || !body.snapshot || !body.userId) {
    return sendError(reply, 400, 'BAD_REQUEST', 'contentType, originalId, snapshot, and userId are required');
  }

  try {
    const item = await service.deleteToRecycleBin({
      siteId,
      userId: body.userId,
      contentType: body.contentType,
      originalId: body.originalId,
      snapshot: body.snapshot,
      metadata: body.metadata || {},
      retentionDays: body.retentionDays || Number(process.env.RETENTION_DAYS || 30),
      deleteFromOriginalTable: body.deleteFromOriginalTable || false,
      tableName: body.tableName,
      idField: body.idField || 'id',
    });

    return reply.status(201).send({
      success: true,
      data: item,
    });
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'BACKUP_FAILED', err.message);
  }
});

// GET /api/v1/recycle-bin/items -> List items
server.get('/api/v1/recycle-bin/items', async (request, reply) => {
  const siteId = (request as any).siteId;
  const user = (request as any).user;
  const query = request.query as any;

  // RBAC checks: normal user role can only list their own deleted items
  const userIdFilter = user.role === 'user' ? user.userId : query.userId;

  try {
    const result = await service.listItems({
      siteId,
      userId: userIdFilter,
      status: query.status,
      contentType: query.contentType,
      limit: query.limit ? Number(query.limit) : 20,
      offset: query.offset ? Number(query.offset) : 0,
    });

    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        limit: query.limit ? Number(query.limit) : 20,
        offset: query.offset ? Number(query.offset) : 0,
      },
    };
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'LIST_FAILED', err.message);
  }
});

// GET /api/v1/recycle-bin/items/:id -> View details
server.get('/api/v1/recycle-bin/items/:id', async (request, reply) => {
  const siteId = (request as any).siteId;
  const user = (request as any).user;
  const { id } = request.params as { id: string };

  try {
    const item = await service.getItem(id, siteId);
    if (!item) {
      return sendError(reply, 404, 'RESOURCE_NOT_FOUND', 'Item not found in Recycle Bin');
    }

    // Role verification
    if (user.role === 'user' && item.userId !== user.userId) {
      return sendError(reply, 403, 'FORBIDDEN', 'You do not have permission to view this item');
    }

    return {
      success: true,
      data: item,
    };
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'FETCH_FAILED', err.message);
  }
});

// POST /api/v1/recycle-bin/items/:id/restore -> Restore item
server.post('/api/v1/recycle-bin/items/:id/restore', async (request, reply) => {
  const siteId = (request as any).siteId;
  const user = (request as any).user;
  const { id } = request.params as { id: string };
  const body = (request.body || {}) as any;

  try {
    // 1. Fetch item to perform role validation
    const item = await service.getItem(id, siteId);
    if (!item) {
      return sendError(reply, 404, 'RESOURCE_NOT_FOUND', 'Item not found in Recycle Bin');
    }

    // Role verification
    if (user.role === 'user' && item.userId !== user.userId) {
      return sendError(reply, 403, 'FORBIDDEN', 'You do not have permission to restore this item');
    }

    const restoredItem = await service.restoreFromRecycleBin(
      id,
      body.tableName,
      body.idField || 'id'
    );

    return {
      success: true,
      data: restoredItem,
    };
  } catch (err: any) {
    request.log.error(err);
    
    if (err.message === 'ID_CONFLICT') {
      return sendError(reply, 409, 'ID_CONFLICT', 'Cannot restore item because original ID is already taken');
    }
    if (err.message === 'ITEM_EXPIRED') {
      return sendError(reply, 410, 'ITEM_EXPIRED', 'Cannot restore item because it has expired retention period');
    }
    return sendError(reply, 500, 'RESTORE_FAILED', err.message);
  }
});

// DELETE /api/v1/recycle-bin/items/:id -> Permanent delete
server.delete('/api/v1/recycle-bin/items/:id', async (request, reply) => {
  const siteId = (request as any).siteId;
  const user = (request as any).user;
  const { id } = request.params as { id: string };

  try {
    const item = await service.getItem(id, siteId);
    if (!item) {
      return sendError(reply, 404, 'RESOURCE_NOT_FOUND', 'Item not found in Recycle Bin');
    }

    // Moderator role cannot permanently delete, only Admin can
    if (user.role !== 'admin' && user.userId !== item.userId) {
      return sendError(reply, 403, 'FORBIDDEN', 'Only administrators or item owners can permanently delete items');
    }

    const deletedItem = await service.permanentDelete(id);

    return {
      success: true,
      data: deletedItem,
    };
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'DELETE_FAILED', err.message);
  }
});

// POST /api/v1/recycle-bin/empty -> Bulk permanent delete
server.post('/api/v1/recycle-bin/empty', async (request, reply) => {
  const siteId = (request as any).siteId;
  const user = (request as any).user;

  if (user.role !== 'admin') {
    return sendError(reply, 403, 'FORBIDDEN', 'Only administrators can empty the Recycle Bin');
  }

  // Not implemented in MVP core, but let's clear all currently 'deleted' items for this tenant
  try {
    // In Fastify we can use direct queries or loop permanentDelete. For MVP we'll query list and empty.
    const deletedList = await service.listItems({ siteId, status: 'deleted', limit: 1000 });
    for (const item of deletedList.items) {
      await service.permanentDelete(item.id);
    }

    return {
      success: true,
      data: { count: deletedList.total },
    };
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'EMPTY_FAILED', err.message);
  }
});

// POST /api/v1/recycle-bin/cleanup -> Idempotent cron worker trigger
server.post('/api/v1/recycle-bin/cleanup', async (request, reply) => {
  const user = (request as any).user;

  if (user.role !== 'admin') {
    return sendError(reply, 403, 'FORBIDDEN', 'Only system administrators can run retention cleanup jobs');
  }

  try {
    const result = await service.cleanupExpired();
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    request.log.error(err);
    return sendError(reply, 500, 'CLEANUP_FAILED', err.message);
  }
});

// Run server
const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Recycle Bin API running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server };
