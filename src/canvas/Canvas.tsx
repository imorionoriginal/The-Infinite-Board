import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { Tldraw, Editor, TLShapeId, createShapeId, TLAssetStore } from 'tldraw';
import 'tldraw/tldraw.css';
import { useAppStore } from '@/store/useAppStore';
import { useAssets } from '@/hooks/useAssets';
import { v4 as uuidv4 } from 'uuid';
import { convertFileSrc } from '@tauri-apps/api/core';

const NOTE_COLORS = [
  '#FEF3C7', '#FCE7F3', '#E0F2FE', '#D1FAE5', '#EDE9FE', '#FFEDD5',
];

function getRandomColor(): string {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

export default function Canvas() {
  const editorRef = useRef<Editor | null>(null);
  const { elements, addElement, openModal, isDarkMode } = useAppStore();
  const { uploadAsset } = useAssets();

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    if (isDarkMode) {
      editor.user.updateUserPreferences({ colorScheme: 'dark' });
    } else {
      editor.user.updateUserPreferences({ colorScheme: 'light' });
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.user.updateUserPreferences({
        colorScheme: isDarkMode ? 'dark' : 'light',
      });
    }
  }, [isDarkMode]);

  const handleDoubleClick = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const viewportCenter = editor.getViewportScreenCenter();
    const pagePoint = editor.screenToPage(viewportCenter);

    const newElement = {
      id: uuidv4(),
      board_id: 'default',
      type: 'sticky-note' as const,
      x: pagePoint.x - 120,
      y: pagePoint.y - 100,
      width: 240,
      height: 200,
      z_index: 0,
      title: 'New Note',
      content: '{}',
      color: getRandomColor(),
      is_trashed: false,
      trashed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addElement(newElement);
  }, [addElement]);

  const customAssetStore: TLAssetStore = useMemo(() => ({
    async upload(asset, file) {
      try {
        const localPath = await uploadAsset(file);
        const assetUrl = convertFileSrc(localPath);
        return {
          src: assetUrl,
        };
      } catch (error) {
        console.error('Failed to upload asset:', error);
        throw error;
      }
    },
    resolve(asset) {
      return asset.props.src;
    },
  }), [uploadAsset]);

  return (
    <div
      className="w-full h-full relative"
      style={{ background: isDarkMode ? '#0f0f12' : '#f8fafc' }}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDoubleClick();
        }
      }}
    >
      <Tldraw
        onMount={handleMount}
        autoFocus
        persistenceKey="infinite-table-board"
        assets={customAssetStore}
      />

      <StickyNotesOverlay />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="glass-card px-4 py-2 text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
          Kanvasa çift tıklayarak yeni not oluşturun
        </div>
      </div>
    </div>
  );
}

function StickyNotesOverlay() {
  const { elements, openModal, bringToFront, updateElement, trashElement, isDarkMode } = useAppStore();
  const activeNotes = elements.filter(el => el.type === 'sticky-note' && !el.is_trashed);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {activeNotes.map(note => (
        <StickyNote
          key={note.id}
          note={note}
          onOpen={() => openModal(note)}
          onBringToFront={() => bringToFront(note.id)}
          onUpdatePosition={(x, y) => updateElement(note.id, { x, y })}
          onTrash={() => trashElement(note.id)}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
}

interface StickyNoteProps {
  note: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    z_index: number;
    title: string;
    content: string;
    color: string;
  };
  onOpen: () => void;
  onBringToFront: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onTrash: () => void;
  isDarkMode: boolean;
}

function StickyNote({ note, onOpen, onBringToFront, onUpdatePosition, onTrash, isDarkMode }: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });

  const PIN_COLORS: Record<string, string> = {
    '#FEF3C7': '#F59E0B',
    '#FCE7F3': '#EC4899',
    '#E0F2FE': '#0EA5E9',
    '#D1FAE5': '#10B981',
    '#EDE9FE': '#8B5CF6',
    '#FFEDD5': '#F97316',
  };

  const pinColor = PIN_COLORS[note.color] || '#8B5CF6';

  let contentPreview = '';
  try {
    const parsed = JSON.parse(note.content);
    if (parsed.content) {
      contentPreview = parsed.content
        .slice(0, 3)
        .map((node: any) => {
          if (node.content) {
            return node.content.map((c: any) => c.text || '').join('');
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }
  } catch {
    contentPreview = '';
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      onBringToFront();
      isDragging.current = true;
      const rect = noteRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffset.current = {
          x: e.clientX - note.x,
          y: e.clientY - note.y,
        };
      }
      e.stopPropagation();
    }
  }, [note.x, note.y, onBringToFront]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      onUpdatePosition(newX, newY);
    }
  }, [onUpdatePosition]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) {
      onOpen();
    }
  }, [onOpen]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <div
      ref={noteRef}
      className="absolute pointer-events-auto cursor-pointer select-none group"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        zIndex: note.z_index,
        transition: isDragging.current ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
          <circle cx="12" cy="8" r="7" fill={pinColor} stroke={isDarkMode ? '#1a1a24' : '#fff'} strokeWidth="2" />
          <circle cx="12" cy="8" r="3" fill={isDarkMode ? '#1a1a24' : '#fff'} opacity="0.4" />
          <line x1="12" y1="15" x2="12" y2="28" stroke={pinColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>

      <div
        className="rounded-lg p-4 pt-5 shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: isDarkMode
            ? `${note.color}15`
            : note.color,
          border: `1px solid ${isDarkMode ? `${note.color}30` : `${note.color}80`}`,
          boxShadow: isHovered
            ? `0 0 24px ${pinColor}40, 0 8px 32px rgba(0,0,0,0.4)`
            : '0 4px 16px rgba(0,0,0,0.2)',
          minHeight: note.height,
          backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
        }}
      >
        <h3
          className="font-semibold text-sm mb-2 truncate"
          style={{
            color: isDarkMode ? '#e4e4e7' : PIN_COLORS[note.color] || '#374151',
          }}
        >
          {note.title || 'Untitled'}
        </h3>

        <p
          className="text-xs leading-relaxed opacity-70 line-clamp-4"
          style={{
            color: isDarkMode ? '#a1a1aa' : '#4b5563',
          }}
        >
          {contentPreview || 'Tıklayarak düzenlemeye başlayın...'}
        </p>

        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: isDarkMode
              ? `linear-gradient(transparent, ${note.color}10)`
              : `linear-gradient(transparent, ${note.color})`,
          }}
        />
      </div>

      {showContextMenu && (
        <div
          className="fixed glass-card shadow-2xl py-1 z-[9999]"
          style={{
            left: contextMenuPos.x,
            top: contextMenuPos.y,
            minWidth: 160,
            background: isDarkMode ? 'rgba(30,30,45,0.95)' : 'rgba(255,255,255,0.95)',
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
              setShowContextMenu(false);
            }}
          >
            ✏️ Düzenle
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2 text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onTrash();
              setShowContextMenu(false);
            }}
          >
            🗑️ Sil
          </button>
        </div>
      )}
    </div>
  );
}
