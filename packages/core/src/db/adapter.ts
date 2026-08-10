import { Pool } from 'pg';

export interface DatabaseAdapter {
  checkIdConflict(tableName: string, idField: string, idValue: any): Promise<boolean>;
  restoreItem(tableName: string, snapshot: Record<string, any>): Promise<void>;
  deleteItem(tableName: string, idField: string, idValue: any): Promise<void>;
  query(sql: string, params?: any[]): Promise<any[]>;
}

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async checkIdConflict(tableName: string, idField: string, idValue: any): Promise<boolean> {
    // Basic SQL injection protection: validate table and column names
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(idField)) {
      throw new Error('Invalid table or field name format');
    }

    const sql = `SELECT 1 FROM "${tableName}" WHERE "${idField}" = $1 LIMIT 1`;
    const res = await this.pool.query(sql, [idValue]);
    return res.rowCount !== null && res.rowCount > 0;
  }

  async restoreItem(tableName: string, snapshot: Record<string, any>): Promise<void> {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      throw new Error('Invalid table name format');
    }

    const columns = Object.keys(snapshot);
    const validatedColumns = columns.filter(col => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col));
    
    if (validatedColumns.length === 0) {
      throw new Error('No valid columns found in snapshot');
    }

    const colNames = validatedColumns.map(col => `"${col}"`).join(', ');
    const placeholders = validatedColumns.map((_, idx) => `$${idx + 1}`).join(', ');
    const values = validatedColumns.map(col => snapshot[col]);

    const sql = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`;
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql, values);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteItem(tableName: string, idField: string, idValue: any): Promise<void> {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(idField)) {
      throw new Error('Invalid table or field name format');
    }

    const sql = `DELETE FROM "${tableName}" WHERE "${idField}" = $1`;
    await this.pool.query(sql, [idValue]);
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
