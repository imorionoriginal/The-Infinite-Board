import React, { useEffect, useState } from 'react';
import Canvas from '@/canvas/Canvas';
import TiptapModal from '@/editor/TiptapModal';
import Topbar from '@/components/layout/Topbar';
import Pomodoro from '@/components/widgets/Pomodoro';
import Stopwatch from '@/components/widgets/Stopwatch';
import ExamCountdown from '@/components/widgets/ExamCountdown';
import { useAppStore } from '@/store/useAppStore';
import { useDatabase } from '@/hooks/useDatabase';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const { isDarkMode, elements, setElements, setLoading } = useAppStore();
  const { initDatabase, loadElements, deleteExpiredTrash } = useDatabase();
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await initDatabase();
        console.log('✅ Database initialized');

        const deletedCount = await deleteExpiredTrash();
        if (deletedCount.length > 0) {
          console.log(`🗑️ Cleaned up ${deletedCount.length} expired trash items`);
        }

        const loadedElements = await loadElements('default');
        setElements(loadedElements);
        console.log(`📦 Loaded ${loadedElements.length} elements`);

        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Initialization error:', error);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  if (!isInitialized) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f0f12 0%, #1a1a2e 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-2xl">∞</span>
          </motion.div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Yükleniyor...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background: isDarkMode
          ? 'linear-gradient(180deg, #0f0f12 0%, #12121a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '8px',
      }}
    >
      <Topbar
        activeWidget={activeWidget}
        onToggleWidget={(widget) =>
          setActiveWidget(prev => prev === widget ? null : widget)
        }
      />

      <div className="flex-1 relative overflow-hidden">
        <Canvas />

        <AnimatePresence>
          {activeWidget && (
            <motion.div
              className="absolute top-3 right-3 z-[500]"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              {activeWidget === 'pomodoro' && <Pomodoro />}
              {activeWidget === 'stopwatch' && <Stopwatch />}
              {activeWidget === 'countdown' && <ExamCountdown />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TiptapModal />
    </div>
  );
}

export default App;
