import { useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAppStore } from '../../store/useAppStore';

const appWindow = getCurrentWindow();

interface TopbarProps {
  activeWidget: string | null;
  onToggleWidget: (widget: string) => void;
}

export default function Topbar({ activeWidget, onToggleWidget }: TopbarProps) {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  const handleMinimize = useCallback(async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error('Failed to minimize window:', err);
    }
  }, []);

  const handleMaximize = useCallback(async () => {
    try {
      const isMaximized = await appWindow.isMaximized();
      if (isMaximized) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    } catch (err) {
      console.error('Failed to toggle maximize:', err);
    }
  }, []);

  const handleClose = useCallback(async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error('Failed to close window:', err);
    }
  }, []);

  return (
    <div
      data-tauri-drag-region
      className={`flex h-[40px] w-full select-none items-center justify-between px-3 ${
        isDarkMode
          ? 'bg-gray-900/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div
        className="flex items-center gap-2"
        data-tauri-drag-region
      >
        <img
          src="/infinite-table-logo.ico"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-5 w-5 rounded-md object-contain"
        />
        <span
          className={`text-sm font-semibold tracking-wide ${
            isDarkMode ? 'text-white/90' : 'text-gray-800'
          }`}
          data-tauri-drag-region
        >
          The Infinite Table
        </span>
      </div>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={toggleDarkMode}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            isDarkMode
              ? 'text-yellow-400 hover:bg-white/10'
              : 'text-indigo-500 hover:bg-black/5'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div
          className={`mx-1 h-4 w-px ${
            isDarkMode ? 'bg-white/10' : 'bg-gray-300'
          }`}
        />

        <button
          onClick={handleMinimize}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            isDarkMode
              ? 'text-white/60 hover:bg-white/10 hover:text-white/90'
              : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'
          }`}
          title="Minimize"
          aria-label="Minimize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            isDarkMode
              ? 'text-white/60 hover:bg-white/10 hover:text-white/90'
              : 'text-gray-500 hover:bg-black/5 hover:text-gray-800'
          }`}
          title="Maximize"
          aria-label="Maximize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
            isDarkMode
              ? 'text-white/60 hover:bg-red-500/80 hover:text-white'
              : 'text-gray-500 hover:bg-red-500 hover:text-white'
          }`}
          title="Close"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
