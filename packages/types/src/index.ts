export type RecycleBinStatus = 'deleted' | 'restored' | 'permanently_deleted' | 'expired';

export interface RecycleBinItem {
  id: string; // rb_xxxxxx
  siteId: string;
  userId: string;
  contentType: string;
  originalId: string;
  snapshot: Record<string, any>;
  metadata: Record<string, any> | null;
  status: RecycleBinStatus;
  deletedAt: Date;
  expiresAt: Date;
  restoredAt: Date | null;
  permanentlyDeletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}

export interface ListItemsResponse {
  items: RecycleBinItem[];
  total: number;
  limit: number;
  offset: number;
}
