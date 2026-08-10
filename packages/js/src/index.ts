import { ApiResponse, RecycleBinItem, ListItemsResponse } from '@crty/recycle-bin-types';

export interface RecycleBinConfig {
  api: string;
  siteId: string;
  apiKey?: string; // Optional token for authenticated requests
}

export class RecycleBinClient {
  private api: string = '/api/v1/recycle-bin';
  private siteId: string = '';
  private apiKey: string = '';

  init(config: RecycleBinConfig) {
    this.api = config.api.replace(/\/$/, ''); // Remove trailing slash if present
    this.siteId = config.siteId;
    this.apiKey = config.apiKey || '';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Site-ID': this.siteId,
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error?.message || `Request failed with status ${response.status}`
      );
    }

    return data.data as T;
  }

  async list(params: {
    userId?: string;
    status?: string;
    contentType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ListItemsResponse> {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    if (params.status) query.append('status', params.status);
    if (params.contentType) query.append('contentType', params.contentType);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<ListItemsResponse>(`${this.api}/items${queryString}`);
  }

  async get(id: string): Promise<RecycleBinItem> {
    return this.request<RecycleBinItem>(`${this.api}/items/${id}`);
  }

  async backup(params: {
    userId: string;
    contentType: string;
    originalId: string;
    snapshot: Record<string, any>;
    metadata?: Record<string, any>;
    tableName?: string;
    idField?: string;
    deleteFromOriginalTable?: boolean;
  }): Promise<RecycleBinItem> {
    return this.request<RecycleBinItem>(`${this.api}/items`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async restore(id: string, tableName?: string, idField?: string): Promise<RecycleBinItem> {
    return this.request<RecycleBinItem>(`${this.api}/items/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ tableName, idField }),
    });
  }

  async delete(id: string): Promise<RecycleBinItem> {
    return this.request<RecycleBinItem>(`${this.api}/items/${id}`, {
      method: 'DELETE',
    });
  }

  async empty(): Promise<{ count: number }> {
    return this.request<{ count: number }>(`${this.api}/empty`, {
      method: 'POST',
    });
  }

  async cleanup(): Promise<{ purgedCount: number }> {
    return this.request<{ purgedCount: number }>(`${this.api}/cleanup`, {
      method: 'POST',
    });
  }
}

export const RecycleBin = new RecycleBinClient();
export default RecycleBin;
