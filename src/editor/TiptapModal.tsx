import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TiptapEditor from './TiptapEditor';
import { useAppStore } from '@/store/useAppStore';

const NOTE_COLOR_OPTIONS = [
  { name: 'Amber', value: '#FEF3C7' },
  { name: 'Rose', value: '#FCE7F3' },
  { name: 'Sky', value: '#E0F2FE' },
  { name: 'Emerald', value: '#D1FAE5' },
  { name: 'Violet', value: '#EDE9FE' },
  { name: 'Orange', value: '#FFEDD5' },
];

export default function TiptapModal() {
  const { isModalOpen, modalElement, closeModal, updateElement, isDarkMode } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('{}');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestContentRef = useRef<string>('{}');
  const latestTitleRef = useRef<string>('');

  useEffect(() => {
    if (modalElement) {
      setTitle(modalElement.title || '');
      setContent(modalElement.content || '{}');
      latestContentRef.current = modalElement.content || '{}';
      latestTitleRef.current = modalElement.title || '';
      setHasUnsavedChanges(false);
    }
  }, [modalElement]);

  useEffect(() => {
    if (isModalOpen && modalElement) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (hasUnsavedChanges && modalElement) {
          updateElement(modalElement.id, {
            content: latestContentRef.current,
            title: latestTitleRef.current,
            updated_at: new Date().toISOString(),
          });
          setHasUnsavedChanges(false);
          console.log('⏰ Auto-saved (interval)');
        }
      }, 60000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [isModalOpen, modalElement, hasUnsavedChanges, updateElement]);

  const handleClose = useCallback(() => {
    if (modalElement) {
      updateElement(modalElement.id, {
        content: latestContentRef.current,
        title: latestTitleRef.current,
        updated_at: new Date().toISOString(),
      });
      console.log('💾 Saved on close');
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    closeModal();
  }, [modalElement, updateElement, closeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleClose]);

  const handleContentChange = useCallback((jsonContent: string) => {
    latestContentRef.current = jsonContent;
    setHasUnsavedChanges(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    latestTitleRef.current = newTitle;
    setHasUnsavedChanges(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    if (modalElement) {
      updateElement(modalElement.id, {
        title: latestTitleRef.current,
        updated_at: new Date().toISOString(),
      });
      console.log('💾 Title saved (blur)');
    }
  }, [modalElement, updateElement]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  const handleColorChange = useCallback((color: string) => {
    if (modalElement) {
      updateElement(modalElement.id, {
        color,
        updated_at: new Date().toISOString(),
      });
    }
  }, [modalElement, updateElement]);

  return (
    <AnimatePresence>
      {isModalOpen && modalElement && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)',
            }}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(24px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-3xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: isDarkMode
                ? 'rgba(20, 20, 32, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              backdropFilter: 'blur(40px)',
              maxHeight: '85vh',
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-8 pt-6 pb-4 border-b"
              style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {NOTE_COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-1"
                      style={{
                        backgroundColor: c.value,
                        boxShadow: modalElement.color === c.value ? `0 0 0 2px ${isDarkMode ? '#141420' : '#fff'}, 0 0 0 4px var(--accent)` : 'none'
                      }}
                      onClick={() => handleColorChange(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                placeholder="Başlık ekleyin..."
                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-opacity-40"
                style={{
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div
              className="px-8 py-4 overflow-y-auto"
              style={{ maxHeight: 'calc(85vh - 140px)' }}
            >
              <TiptapEditor
                initialContent={modalElement.content || '{}'}
                onContentChange={handleContentChange}
                isDarkMode={isDarkMode}
              />
            </div>

            <div
              className="px-8 py-2 text-xs flex items-center justify-between border-t"
              style={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>
                {hasUnsavedChanges ? '● Kaydedilmemiş değişiklikler' : '✓ Kaydedildi'}
              </span>
              <span>ESC ile kapat • Otomatik kayıt aktif</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
