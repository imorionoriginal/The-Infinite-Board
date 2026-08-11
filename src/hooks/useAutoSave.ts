import { useCallback, useEffect, useRef } from 'react';
import { useDatabase } from './useDatabase';

const AUTO_SAVE_INTERVAL_MS = 60_000;

interface UseAutoSaveOptions {
  elementId: string | null;
  getContent: () => string | null;
}

interface UseAutoSaveReturn {
  saveNow: () => Promise<void>;
  saveContent: () => Promise<void>;
  cleanup: () => void;
}

export function useAutoSave({
  elementId,
  getContent,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { updateElementContent } = useDatabase();

  const elementIdRef = useRef(elementId);
  const getContentRef = useRef(getContent);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedContentRef = useRef<string | null>(null);

  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  useEffect(() => {
    getContentRef.current = getContent;
  }, [getContent]);

  const saveContent = useCallback(async (): Promise<void> => {
    const id = elementIdRef.current;
    const content = getContentRef.current();

    if (!id || content === null) return;

    if (content === lastSavedContentRef.current) return;

    try {
      await updateElementContent(id, content);
      lastSavedContentRef.current = content;
      console.log(`[AutoSave] Content saved for element ${id}`);
    } catch (error) {
      console.error(`[AutoSave] Failed to save content for element ${id}:`, error);
    }
  }, [updateElementContent]);

  const saveNow = useCallback(async (): Promise<void> => {
    const id = elementIdRef.current;
    const content = getContentRef.current();

    if (!id || content === null) return;

    try {
      await updateElementContent(id, content);
      lastSavedContentRef.current = content;
      console.log(`[AutoSave] Instant save for element ${id}`);
    } catch (error) {
      console.error(`[AutoSave] Failed instant save for element ${id}:`, error);
    }
  }, [updateElementContent]);

  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    cleanup();

    if (!elementId) return;

    lastSavedContentRef.current = getContent();

    intervalRef.current = setInterval(() => {
      saveContent().catch((error) => {
        console.error('[AutoSave] Interval save failed:', error);
      });
    }, AUTO_SAVE_INTERVAL_MS);

    return cleanup;
  }, [elementId, cleanup, saveContent, getContent]);

  return {
    saveNow,
    saveContent,
    cleanup,
  };
}
