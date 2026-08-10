import { pgTable, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const recycleBinItems = pgTable('recycle_bin_items', {
  id: varchar('id', { length: 255 }).primaryKey(), // rb_xxxxxx
  siteId: varchar('site_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 255 }).notNull(),
  originalId: varchar('original_id', { length: 255 }).notNull(),
  snapshot: jsonb('snapshot').notNull(),
  metadata: jsonb('metadata'),
  status: varchar('status', { length: 50 }).default('deleted').notNull(), // deleted, restored, permanently_deleted, expired
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  restoredAt: timestamp('restored_at'),
  permanentlyDeletedAt: timestamp('permanently_deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('tenant_idx').on(table.siteId),
  userTenantIdx: index('user_tenant_idx').on(table.siteId, table.userId),
  expiresIdx: index('expires_idx').on(table.expiresAt, table.status),
  originalIdx: index('original_idx').on(table.siteId, table.contentType, table.originalId),
}));
