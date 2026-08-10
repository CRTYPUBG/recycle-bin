import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecycleBinService } from './service';
import { DatabaseAdapter } from './db/adapter';
import { Pool } from 'pg';

// Mock drizzle ORM and node-postgres pool
vi.mock('pg', () => {
  const mClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mPool = {
    connect: vi.fn(() => Promise.resolve(mClient)),
    query: vi.fn(),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mPool) };
});

vi.mock('drizzle-orm/node-postgres', () => {
  const mDb: any = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    transaction: vi.fn((cb: any): any => cb(mDb)),
  };
  return { drizzle: vi.fn(() => mDb) };
});

describe('RecycleBinService', () => {
  let pool: Pool;
  let adapter: DatabaseAdapter;
  let service: RecycleBinService;
  let mockDb: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    pool = new Pool();
    adapter = {
      checkIdConflict: vi.fn(),
      restoreItem: vi.fn(),
      deleteItem: vi.fn(),
      query: vi.fn(),
    };
    service = new RecycleBinService(pool, adapter);
    const { drizzle } = await import('drizzle-orm/node-postgres');
    mockDb = drizzle(pool);
  });

  it('should create a backup item in recycle bin', async () => {
    const backup = await service.deleteToRecycleBin({
      siteId: 'site-123',
      userId: 'user-456',
      contentType: 'post',
      originalId: 'post-18452',
      snapshot: { id: 'post-18452', title: 'Test Post', author_id: 27 },
      metadata: { deletedByReason: 'user-action' },
    });

    expect(backup.id).toContain('rb_');
    expect(backup.siteId).toBe('site-123');
    expect(backup.originalId).toBe('post-18452');
    expect(backup.status).toBe('deleted');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should perform restore checks and successfully restore if no conflicts exist', async () => {
    const mockItem = {
      id: 'rb_123',
      siteId: 'site-123',
      userId: 'user-456',
      contentType: 'post',
      originalId: 'post-18452',
      snapshot: { id: 'post-18452', title: 'Test Post' },
      status: 'deleted',
      expiresAt: new Date(Date.now() + 100000), // In future
    };

    // Mock DB select return value
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockItem]),
        }),
      }),
    });

    // Mock adapter conflict check -> false (no conflict)
    adapter.checkIdConflict = vi.fn().mockResolvedValueOnce(false);

    const restored = await service.restoreFromRecycleBin('rb_123', 'posts');

    expect(restored.status).toBe('restored');
    expect(adapter.checkIdConflict).toHaveBeenCalledWith('posts', 'id', 'post-18452');
    expect(adapter.restoreItem).toHaveBeenCalledWith('posts', mockItem.snapshot);
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should throw an error on restore if there is an ID conflict', async () => {
    const mockItem = {
      id: 'rb_123',
      siteId: 'site-123',
      userId: 'user-456',
      contentType: 'post',
      originalId: 'post-18452',
      snapshot: { id: 'post-18452', title: 'Test Post' },
      status: 'deleted',
      expiresAt: new Date(Date.now() + 100000),
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockItem]),
        }),
      }),
    });

    // Mock adapter conflict check -> true (conflict exists)
    adapter.checkIdConflict = vi.fn().mockResolvedValueOnce(true);

    await expect(service.restoreFromRecycleBin('rb_123', 'posts'))
      .rejects.toThrow('ID_CONFLICT');

    expect(adapter.restoreItem).not.toHaveBeenCalled();
  });

  it('should prevent restoration if item is expired', async () => {
    const mockItem = {
      id: 'rb_123',
      siteId: 'site-123',
      userId: 'user-456',
      contentType: 'post',
      originalId: 'post-18452',
      snapshot: { id: 'post-18452', title: 'Test Post' },
      status: 'deleted',
      expiresAt: new Date(Date.now() - 100000), // In past
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockItem]),
        }),
      }),
    });

    await expect(service.restoreFromRecycleBin('rb_123', 'posts'))
      .rejects.toThrow('ITEM_EXPIRED');
  });

  it('should clear snapshot during permanent delete', async () => {
    const mockItem = {
      id: 'rb_123',
      siteId: 'site-123',
      status: 'deleted',
      snapshot: { title: 'Secret' },
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([mockItem]),
        }),
      }),
    });

    const deleted = await service.permanentDelete('rb_123');
    expect(deleted.status).toBe('permanently_deleted');
    expect(deleted.snapshot).toEqual({});
    expect(mockDb.update).toHaveBeenCalled();
  });
});
