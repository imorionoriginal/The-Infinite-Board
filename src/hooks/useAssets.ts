import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ImportResult {
  localPath: string;
}

export function useAssets() {
  const importFile = useCallback(
    async (sourcePath: string): Promise<ImportResult> => {
      try {
        const localPath = await invoke<string>('import_asset', { sourcePath });
        console.log(`[Assets] Imported file: ${sourcePath} -> ${localPath}`);
        return { localPath };
      } catch (error) {
        console.error(`[Assets] Failed to import file "${sourcePath}":`, error);
        throw error;
      }
    },
    []
  );

  const trashFile = useCallback(async (localPath: string): Promise<void> => {
    try {
      await invoke('trash_asset', { localPath });
      console.log(`[Assets] Trashed file: ${localPath}`);
    } catch (error) {
      console.error(`[Assets] Failed to trash file "${localPath}":`, error);
      throw error;
    }
  }, []);

  const deleteFile = useCallback(async (filePath: string): Promise<void> => {
    try {
      await invoke('delete_asset_permanently', { filePath });
      console.log(`[Assets] Permanently deleted file: ${filePath}`);
    } catch (error) {
      console.error(
        `[Assets] Failed to permanently delete file "${filePath}":`,
        error
      );
      throw error;
    }
  }, []);

  const uploadAsset = useCallback(async (file: File): Promise<string> => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const extension = file.name.split('.').pop() || 'png';

      const localPath = await invoke<string>('save_base64_asset', {
        base64,
        extension
      });

      console.log(`[Assets] Uploaded file: ${file.name} -> ${localPath}`);
      return localPath;
    } catch (error) {
      console.error(`[Assets] Failed to upload asset:`, error);
      throw error;
    }
  }, []);

  return {
    importFile,
    trashFile,
    deleteFile,
    uploadAsset,
  };
}
