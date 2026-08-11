import React, { useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useAppStore } from '@/store/useAppStore';

interface TiptapEditorProps {
  initialContent: string;
  onContentChange: (jsonContent: string) => void;
  isDarkMode: boolean;
}

export default function TiptapEditor({ initialContent, onContentChange, isDarkMode }: TiptapEditorProps) {
  const parsedContent = useMemo(() => {
    try {
      const parsed = JSON.parse(initialContent);
      if (parsed && parsed.type === 'doc') {
        return parsed;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Yazmaya başlayın... Düşüncelerinizi buraya not edin ✨',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
    ],
    content: parsedContent,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[400px] px-1',
      },
    },
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      onContentChange(json);
    },
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="tiptap-editor w-full">
      <BubbleMenu editor={editor}>
        <div
          className="flex items-center gap-0.5 rounded-lg shadow-2xl p-1"
          style={{
            background: isDarkMode ? 'rgba(30,30,45,0.95)' : 'rgba(255,255,255,0.95)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ToolbarButton
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            isDarkMode={isDarkMode}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            isDarkMode={isDarkMode}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            isDarkMode={isDarkMode}
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            isDarkMode={isDarkMode}
          >
            <s>S</s>
          </ToolbarButton>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--glass-border)' }} />

          <ToolbarButton
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
            isDarkMode={isDarkMode}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            isDarkMode={isDarkMode}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
            isDarkMode={isDarkMode}
          >
            H3
          </ToolbarButton>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--glass-border)' }} />

          <ToolbarButton
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            isDarkMode={isDarkMode}
          >
            •
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
            isDarkMode={isDarkMode}
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Task List"
            isDarkMode={isDarkMode}
          >
            ☑
          </ToolbarButton>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--glass-border)' }} />

          <ToolbarButton
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
            isDarkMode={isDarkMode}
          >
            "
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
            isDarkMode={isDarkMode}
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
            isDarkMode={isDarkMode}
          >
            🖍
          </ToolbarButton>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarButtonProps {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  isDarkMode: boolean;
}

function ToolbarButton({ isActive, onClick, title, children, isDarkMode }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150"
      style={{
        background: isActive
          ? isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.15)'
          : 'transparent',
        color: isActive
          ? isDarkMode ? '#c4b5fd' : '#7c3aed'
          : isDarkMode ? '#a1a1aa' : '#64748b',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.background = isDarkMode
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.target as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}
