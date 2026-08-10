import { useState, useEffect } from 'react';
import './App.css';

interface RecycleBinItem {
  id: string;
  siteId: string;
  userId: string;
  contentType: string;
  originalId: string;
  snapshot: Record<string, any>;
  metadata: Record<string, any> | null;
  status: 'deleted' | 'restored' | 'permanently_deleted' | 'expired';
  deletedAt: string;
  expiresAt: string;
  restoredAt: string | null;
  permanentlyDeletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api/v1/recycle-bin');
  const [siteId, setSiteId] = useState('site-1');
  const [apiKey, setApiKey] = useState('crty_api_key_default');
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecycleBinItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (typeFilter) query.append('contentType', typeFilter);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const response = await fetch(`${apiUrl}/items${queryString}`, {
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const res = await response.json();
      if (res.success) {
        // Filter items locally by search query if present
        let filtered = res.data.items as RecycleBinItem[];
        if (searchQuery) {
          filtered = filtered.filter(
            (item) =>
              item.originalId.includes(searchQuery) ||
              item.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
              JSON.stringify(item.snapshot).toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setItems(filtered);
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Failed to fetch items' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Connection failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, typeFilter]);

  const handleRestore = async (id: string) => {
    setAlert(null);
    try {
      const response = await fetch(`${apiUrl}/items/${id}/restore`, {
        method: 'POST',
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: 'posts', // default mock table
          idField: 'id',
        }),
      });

      const res = await response.json();
      if (res.success) {
        setAlert({ type: 'success', message: `Item ${id} restored successfully!` });
        fetchItems();
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Restore failed' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Network error during restore' });
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this item? This action is irreversible.')) {
      return;
    }
    setAlert(null);
    try {
      const response = await fetch(`${apiUrl}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const res = await response.json();
      if (res.success) {
        setAlert({ type: 'success', message: `Item ${id} permanently deleted.` });
        fetchItems();
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Failed to delete' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Network error' });
    }
  };

  const handleEmpty = async () => {
    if (!confirm('Permanently delete all items?')) return;
    setAlert(null);
    try {
      const response = await fetch(`${apiUrl}/empty`, {
        method: 'POST',
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const res = await response.json();
      if (res.success) {
        setAlert({ type: 'success', message: 'Recycle bin emptied.' });
        fetchItems();
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Action failed' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  const handleCleanup = async () => {
    setAlert(null);
    try {
      const response = await fetch(`${apiUrl}/cleanup`, {
        method: 'POST',
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const res = await response.json();
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Cleanup cron run complete. Purged count: ${res.data.purgedCount}`,
        });
        fetchItems();
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Cleanup failed' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  const createDemoPost = async () => {
    setAlert(null);
    try {
      const demoId = String(Math.floor(10000 + Math.random() * 90000));
      const response = await fetch(`${apiUrl}/items`, {
        method: 'POST',
        headers: {
          'X-Site-ID': siteId,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-27',
          contentType: 'post',
          originalId: demoId,
          snapshot: {
            id: demoId,
            title: `CRTY Test Post (${demoId})`,
            content: 'This is a sample snapshot content designed to test original ID restoration.',
            author_id: 27,
          },
          metadata: {
            triggeredBy: 'Dashboard Demo UI',
          },
        }),
      });

      const res = await response.json();
      if (res.success) {
        setAlert({ type: 'success', message: `Mock post ${demoId} sent to Recycle Bin!` });
        fetchItems();
      } else {
        setAlert({ type: 'error', message: res.error?.message || 'Mock creation failed' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Failed to connect. Is the Fastify server running?' });
    }
  };

  const calculateDaysLeft = (expiresAtStr: string) => {
    const expires = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const diff = expires - now;
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <img src="/img/logo.svg" alt="Recycle Bin Logo" style={{ height: '32px', width: 'auto' }} />
          <h1 style={{ marginLeft: '10px' }}>Recycle Bin</h1>
          <span>v1.0.0</span>
        </div>
        <div className="brand-badge">
          Powered by <span style={{ color: '#10b981' }}>CRTY</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Sidebar Configuration */}
        <aside className="sidebar">
          <img src="/img/banner.webp" alt="Recycle Bin Banner" style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border-color)' }} />
          <div className="glass-panel config-box">
            <h2 className="card-title">🔌 Connection Settings</h2>
            <div className="form-group">
              <label htmlFor="apiUrl">API URL</label>
              <input
                id="apiUrl"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="siteId">Site ID (Tenant)</label>
              <input
                id="siteId"
                type="text"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="apiKey">Authorization Token</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={fetchItems}>
              🔄 Refresh Connection
            </button>
          </div>

          <div className="glass-panel quick-actions">
            <h2 className="card-title">⚡ Quick Actions</h2>
            <div className="action-buttons">
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={createDemoPost}>
                ♻️ Create Demo Post
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCleanup}>
                🧹 Trigger Cron Cleanup
              </button>
              <button className="btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleEmpty}>
                🔥 Empty Recycle Bin
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard View */}
        <section className="dashboard-view">
          {/* Alerts */}
          {alert && (
            <div className={`alert-banner ${alert.type} animate-fade-in`}>
              <span>{alert.message}</span>
              <button
                style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0 }}
                onClick={() => setAlert(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="glass-panel filter-bar">
            <input
              type="text"
              placeholder="Search by ID or content..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
            />
            <div className="select-filters">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="post">Posts</option>
                <option value="comment">Comments</option>
                <option value="message">Messages</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Status: Deleted</option>
                <option value="deleted">Deleted</option>
                <option value="restored">Restored</option>
                <option value="permanently_deleted">Permanently Deleted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Items List */}
          <div className="items-list">
            {loading ? (
              <div className="empty-state">
                <span>⏳</span>
                <p>Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="glass-panel empty-state">
                <span>♻️</span>
                <p>No items found in Recycle Bin</p>
                <small>Click "Create Demo Post" on the sidebar to add a test item.</small>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="glass-panel item-card animate-fade-in">
                  <div className="item-info">
                    <div className="item-meta-top">
                      <span className="content-type-badge">{item.contentType}</span>
                      <span className="original-id">Original ID: {item.originalId}</span>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    </div>
                    <div className="item-title">
                      {item.snapshot.title || `Snapshot ID: ${item.id.slice(3, 11)}`}
                    </div>
                    <div className="item-details-row">
                      <span>Deleted: {new Date(item.deletedAt).toLocaleDateString()}</span>
                      <span style={{ color: item.status === 'deleted' ? '#f59e0b' : '' }}>
                        {item.status === 'deleted' ? calculateDaysLeft(item.expiresAt) : `Expired / Handled`}
                      </span>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button className="btn-secondary" onClick={() => setSelectedItem(item)}>
                      👁️ View Details
                    </button>
                    {item.status === 'deleted' && (
                      <>
                        <button className="btn-primary" onClick={() => handleRestore(item.id)}>
                          🔄 Restore
                        </button>
                        <button className="btn-danger" onClick={() => handlePermanentDelete(item.id)}>
                          🔥 Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="glass-panel modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Item Details: {selectedItem.id}</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p><strong>Content Type:</strong> {selectedItem.contentType}</p>
                <p><strong>Original ID:</strong> {selectedItem.originalId}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
              </div>
              <div>
                <p><strong>Deleted At:</strong> {new Date(selectedItem.deletedAt).toLocaleString()}</p>
                <p><strong>Expires At:</strong> {new Date(selectedItem.expiresAt).toLocaleString()}</p>
                <p><strong>User ID:</strong> {selectedItem.userId}</p>
              </div>
            </div>

            <div>
              <p style={{ marginBottom: '8px', fontWeight: 600 }}>Snapshot Payload:</p>
              <pre className="json-block">{JSON.stringify(selectedItem.snapshot, null, 2)}</pre>
            </div>

            {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
              <div>
                <p style={{ marginBottom: '8px', fontWeight: 600 }}>Metadata:</p>
                <pre className="json-block">{JSON.stringify(selectedItem.metadata, null, 2)}</pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setSelectedItem(null)}>Close</button>
              {selectedItem.status === 'deleted' && (
                <>
                  <button className="btn-danger" onClick={() => handlePermanentDelete(selectedItem.id)}>
                    🔥 Permanent Delete
                  </button>
                  <button className="btn-primary" onClick={() => handleRestore(selectedItem.id)}>
                    🔄 Restore to Database
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Recycle Bin Open Source Project. All rights reserved.</p>
        <p style={{ marginTop: '8px' }}>
          Powered by <span className="brand-badge" style={{ color: '#10b981' }}>CRTY</span>
        </p>
      </footer>
    </div>
  );
}
