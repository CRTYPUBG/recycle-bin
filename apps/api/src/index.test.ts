import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from './index';

// Mock core service
vi.mock('@crty/recycle-bin-core', () => {
  const mockServiceInstance = {
    deleteToRecycleBin: vi.fn().mockResolvedValue({
      id: 'rb_mock_123',
      siteId: 'site-1',
      userId: 'user-1',
      contentType: 'post',
      originalId: '18452',
      snapshot: { title: 'Test' },
      status: 'deleted',
    }),
    restoreFromRecycleBin: vi.fn().mockImplementation((id) => {
      if (id === 'rb_conflict') throw new Error('ID_CONFLICT');
      return Promise.resolve({
        id,
        status: 'restored',
      });
    }),
    getItem: vi.fn().mockImplementation((id, siteId) => {
      if (id === 'rb_not_found') return Promise.resolve(null);
      return Promise.resolve({
        id,
        siteId,
        userId: 'user-1',
        contentType: 'post',
        originalId: '18452',
        status: 'deleted',
      });
    }),
    listItems: vi.fn().mockResolvedValue({
      items: [{ id: 'rb_mock_123', status: 'deleted' }],
      total: 1,
    }),
    permanentDelete: vi.fn().mockResolvedValue({
      id: 'rb_mock_123',
      status: 'permanently_deleted',
    }),
    cleanupExpired: vi.fn().mockResolvedValue({ purgedCount: 5 }),
  };

  return {
    RecycleBinService: vi.fn(() => mockServiceInstance),
    PostgresAdapter: vi.fn(() => ({})),
  };
});

describe('Fastify API REST Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should respond 200 on GET /health', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).status).toBe('healthy');
  });

  it('should return 400 when X-Site-ID header is missing', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/recycle-bin/items',
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload).error.code).toBe('MISSING_SITE_ID');
  });

  it('should return 401 when authorization token is missing', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/recycle-bin/items',
      headers: {
        'x-site-id': 'site-1',
      },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.payload).error.code).toBe('UNAUTHORIZED');
  });

  it('should allow request with valid API Key', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/recycle-bin/items',
      headers: {
        'x-site-id': 'site-1',
        authorization: 'Bearer crty_api_key_default',
      },
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.success).toBe(true);
    expect(data.data.items.length).toBe(1);
  });

  it('should create a backup item on POST /items', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/recycle-bin/items',
      headers: {
        'x-site-id': 'site-1',
        authorization: 'Bearer crty_api_key_default',
        'content-type': 'application/json',
      },
      payload: {
        userId: 'user-1',
        contentType: 'post',
        originalId: '18452',
        snapshot: { title: 'Test Post', content: 'Demo text' },
      },
    });

    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.payload);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('rb_mock_123');
  });

  it('should restore an item on POST /items/:id/restore', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/recycle-bin/items/rb_mock_123/restore',
      headers: {
        'x-site-id': 'site-1',
        authorization: 'Bearer crty_api_key_default',
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.payload);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('restored');
  });

  it('should return 409 Conflict when restore has an ID conflict', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/recycle-bin/items/rb_conflict/restore',
      headers: {
        'x-site-id': 'site-1',
        authorization: 'Bearer crty_api_key_default',
      },
    });

    expect(res.statusCode).toBe(409);
    const data = JSON.parse(res.payload);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('ID_CONFLICT');
  });

  it('should return 404 when item is not found during restore', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/recycle-bin/items/rb_not_found/restore',
      headers: {
        'x-site-id': 'site-1',
        authorization: 'Bearer crty_api_key_default',
      },
    });

    expect(res.statusCode).toBe(404);
  });
});
