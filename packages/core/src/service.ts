import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, lt } from 'drizzle-orm';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { recycleBinItems } from './db/schema';
import { DatabaseAdapter } from './db/adapter';
import { RecycleBinItem } from '@crty/recycle-bin-types';

export class RecycleBinService {
  private db: ReturnType<typeof drizzle>;
  private adapter: DatabaseAdapter;

  constructor(pool: Pool, adapter: DatabaseAdapter) {
    this.db = drizzle(pool);
    this.adapter = adapter;
  }

  private generateRbId(): string {
    return `rb_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  }

  async deleteToRecycleBin(params: {
    siteId: string;
    userId: string;
    contentType: string;
    originalId: string;
    snapshot: Record<string, any>;
    metadata?: Record<string, any>;
    retentionDays?: number;
    deleteFromOriginalTable?: boolean;
    tableName?: string;
    idField?: string;
  }): Promise<RecycleBinItem> {
    const {
      siteId,
      userId,
      contentType,
      originalId,
      snapshot,
      metadata = {},
      retentionDays = 30,
      deleteFromOriginalTable = false,
      tableName,
      idField = 'id',
    } = params;

    const id = this.generateRbId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const now = new Date();

    const newItem = {
      id,
      siteId,
      userId,
      contentType,
      originalId,
      snapshot,
      metadata,
      status: 'deleted' as const,
      deletedAt: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      restoredAt: null,
      permanentlyDeletedAt: null,
    };

    // Database transaction to write to Recycle Bin, and optionally delete from the original table
    await this.db.transaction(async (tx) => {
      await tx.insert(recycleBinItems).values(newItem);

      if (deleteFromOriginalTable && tableName) {
        await this.adapter.deleteItem(tableName, idField, originalId);
      }
    });

    return newItem;
  }

  async restoreFromRecycleBin(id: string, targetTableName?: string, idField: string = 'id'): Promise<RecycleBinItem> {
    const items = await this.db.select().from(recycleBinItems).where(eq(recycleBinItems.id, id)).limit(1);
    
    if (items.length === 0) {
      throw new Error('RECYCLE_BIN_ITEM_NOT_FOUND');
    }

    const item = items[0];

    if (item.status !== 'deleted') {
      throw new Error(`INVALID_STATUS: Item is already ${item.status}`);
    }

    if (new Date() > new Date(item.expiresAt)) {
      throw new Error('ITEM_EXPIRED');
    }

    const tableName = targetTableName || `${item.contentType}s`;

    // 1. Conflict Check: check if original ID already exists in target table
    const hasConflict = await this.adapter.checkIdConflict(tableName, idField, item.originalId);
    if (hasConflict) {
      throw new Error('ID_CONFLICT');
    }

    // 2. Restore inside target table and update status
    const now = new Date();
    await this.db.transaction(async (tx) => {
      // Restore back into original table
      await this.adapter.restoreItem(tableName, item.snapshot as Record<string, any>);

      // Update Recycle Bin Status
      await tx.update(recycleBinItems)
        .set({
          status: 'restored',
          restoredAt: now,
          updatedAt: now,
        })
        .where(eq(recycleBinItems.id, id));
    });

    return {
      ...item,
      status: 'restored',
      restoredAt: now,
      updatedAt: now,
    } as RecycleBinItem;
  }

  async permanentDelete(id: string, targetTableName?: string, idField: string = 'id'): Promise<RecycleBinItem> {
    const items = await this.db.select().from(recycleBinItems).where(eq(recycleBinItems.id, id)).limit(1);

    if (items.length === 0) {
      throw new Error('RECYCLE_BIN_ITEM_NOT_FOUND');
    }

    const item = items[0];

    const now = new Date();
    await this.db.transaction(async (tx) => {
      await tx.update(recycleBinItems)
        .set({
          status: 'permanently_deleted',
          permanentlyDeletedAt: now,
          snapshot: {}, // Clear snapshot for privacy/compliance (GDPR/KVKK)
          updatedAt: now,
        })
        .where(eq(recycleBinItems.id, id));
    });

    return {
      ...item,
      status: 'permanently_deleted',
      permanentlyDeletedAt: now,
      snapshot: {},
      updatedAt: now,
    } as RecycleBinItem;
  }

  async cleanupExpired(siteId?: string): Promise<{ purgedCount: number }> {
    const now = new Date();
    
    // Find all expired items that are still in 'deleted' status
    const conditions = siteId
      ? and(eq(recycleBinItems.status, 'deleted'), lt(recycleBinItems.expiresAt, now), eq(recycleBinItems.siteId, siteId))
      : and(eq(recycleBinItems.status, 'deleted'), lt(recycleBinItems.expiresAt, now));

    const expiredItems = await this.db.select({ id: recycleBinItems.id }).from(recycleBinItems).where(conditions);

    let purgedCount = 0;

    for (const item of expiredItems) {
      await this.db.transaction(async (tx) => {
        await tx.update(recycleBinItems)
          .set({
            status: 'expired',
            snapshot: {}, // Clear data
            updatedAt: now,
          })
          .where(eq(recycleBinItems.id, item.id));
      });
      purgedCount++;
    }

    return { purgedCount };
  }

  async listItems(params: {
    siteId: string;
    userId?: string;
    status?: string;
    contentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: RecycleBinItem[]; total: number }> {
    const { siteId, userId, status, contentType, limit = 20, offset = 0 } = params;

    const baseConditions = [eq(recycleBinItems.siteId, siteId)];

    if (userId) {
      baseConditions.push(eq(recycleBinItems.userId, userId));
    }
    if (status) {
      baseConditions.push(eq(recycleBinItems.status, status));
    } else {
      baseConditions.push(eq(recycleBinItems.status, 'deleted'));
    }
    if (contentType) {
      baseConditions.push(eq(recycleBinItems.contentType, contentType));
    }

    const whereClause = and(...baseConditions);

    const items = await this.db.select().from(recycleBinItems)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const allMatching = await this.db.select({ id: recycleBinItems.id }).from(recycleBinItems).where(whereClause);

    return {
      items: items as RecycleBinItem[],
      total: allMatching.length,
    };
  }

  async getItem(id: string, siteId: string): Promise<RecycleBinItem | null> {
    const items = await this.db.select().from(recycleBinItems)
      .where(and(eq(recycleBinItems.id, id), eq(recycleBinItems.siteId, siteId)))
      .limit(1);

    if (items.length === 0) return null;
    return items[0] as RecycleBinItem;
  }
}
