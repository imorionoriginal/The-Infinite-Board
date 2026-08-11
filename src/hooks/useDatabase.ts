import { useCallback, useRef } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import type { CanvasElement } from '../types/schema';

let dbInstance: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      const db = await Database.load('sqlite:canvas.db');
      dbInstance = db;
      return db;
    } catch (error) {
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
}

export function useDatabase() {
  const dbRef = useRef<Database | null>(null);

  const ensureDb = useCallback(async (): Promise<Database> => {
    if (dbRef.current) return dbRef.current;
    const db = await getDb();
    dbRef.current = db;
    return db;
  }, []);

  const initDatabase = useCallback(async (): Promise<void> => {
    try {
      const db = await ensureDb();
      const migrationStatements = await invoke<string[]>('get_migration_sql');

      for (const statement of migrationStatements) {
        const trimmed = statement.trim();
        if (trimmed.length > 0) {
          await db.execute(trimmed);
        }
      }

      console.log('[Database] Migration completed successfully');
    } catch (error) {
      console.error('[Database] Failed to initialize database:', error);
      throw error;
    }
  }, [ensureDb]);

  const loadElements = useCallback(
    async (boardId: string): Promise<CanvasElement[]> => {
      try {
        const db = await ensureDb();
        const rows = await db.select<CanvasElement[]>(
          'SELECT * FROM elements WHERE board_id = $1 AND is_trashed = 0 ORDER BY z_index ASC',
          [boardId]
        );

        return rows.map((row) => ({
          ...row,
          is_trashed: Boolean(row.is_trashed),
        }));
      } catch (error) {
        console.error('[Database] Failed to load elements:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const saveElement = useCallback(
    async (element: CanvasElement): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `INSERT INTO elements (
            id, board_id, type, x, y, width, height, z_index,
            title, content, color, is_trashed, trashed_at,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            element.id,
            element.board_id,
            element.type,
            element.x,
            element.y,
            element.width,
            element.height,
            element.z_index,
            element.title,
            element.content,
            element.color,
            element.is_trashed ? 1 : 0,
            element.trashed_at,
            element.created_at,
            element.updated_at,
          ]
        );
      } catch (error) {
        console.error('[Database] Failed to save element:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const updateElementPosition = useCallback(
    async (
      id: string,
      x: number,
      y: number,
      width: number,
      height: number
    ): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `UPDATE elements
           SET x = $1, y = $2, width = $3, height = $4, updated_at = $5
           WHERE id = $6`,
          [x, y, width, height, new Date().toISOString(), id]
        );
      } catch (error) {
        console.error('[Database] Failed to update element position:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const updateElementContent = useCallback(
    async (id: string, content: string): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `UPDATE elements
           SET content = $1, updated_at = $2
           WHERE id = $3`,
          [content, new Date().toISOString(), id]
        );
      } catch (error) {
        console.error('[Database] Failed to update element content:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const updateElementTitle = useCallback(
    async (id: string, title: string): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `UPDATE elements
           SET title = $1, updated_at = $2
           WHERE id = $3`,
          [title, new Date().toISOString(), id]
        );
      } catch (error) {
        console.error('[Database] Failed to update element title:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const updateElementColor = useCallback(
    async (id: string, color: string): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `UPDATE elements
           SET color = $1, updated_at = $2
           WHERE id = $3`,
          [color, new Date().toISOString(), id]
        );
      } catch (error) {
        console.error('[Database] Failed to update element color:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const updateElementZIndex = useCallback(
    async (id: string, zIndex: number): Promise<void> => {
      try {
        const db = await ensureDb();
        await db.execute(
          `UPDATE elements
           SET z_index = $1, updated_at = $2
           WHERE id = $3`,
          [zIndex, new Date().toISOString(), id]
        );
      } catch (error) {
        console.error('[Database] Failed to update element z_index:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const trashElement = useCallback(
    async (id: string): Promise<void> => {
      try {
        const db = await ensureDb();
        const now = new Date().toISOString();
        await db.execute(
          `UPDATE elements
           SET is_trashed = 1, trashed_at = $1, updated_at = $2
           WHERE id = $3`,
          [now, now, id]
        );
      } catch (error) {
        console.error('[Database] Failed to trash element:', error);
        throw error;
      }
    },
    [ensureDb]
  );

  const deleteExpiredTrash = useCallback(async (): Promise<string[]> => {
    try {
      const db = await ensureDb();

      const expiredRows = await db.select<{ id: string }[]>(
        `SELECT id FROM elements
         WHERE is_trashed = 1 AND trashed_at < datetime('now', '-3 days')`
      );

      const expiredIds = expiredRows.map((row) => row.id);

      if (expiredIds.length === 0) {
        return [];
      }

      const placeholders = expiredIds.map((_, i) => `$${i + 1}`).join(', ');
      await db.execute(
        `DELETE FROM elements WHERE id IN (${placeholders})`,
        expiredIds
      );

      console.log(
        `[Database] Deleted ${expiredIds.length} expired trash elements`
      );
      return expiredIds;
    } catch (error) {
      console.error('[Database] Failed to delete expired trash:', error);
      throw error;
    }
  }, [ensureDb]);

  return {
    initDatabase,
    loadElements,
    saveElement,
    updateElementPosition,
    updateElementContent,
    updateElementTitle,
    updateElementColor,
    updateElementZIndex,
    trashElement,
    deleteExpiredTrash,
  };
}
