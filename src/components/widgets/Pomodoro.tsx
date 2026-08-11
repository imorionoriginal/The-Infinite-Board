import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

type TimerMode = 'work' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function Pomodoro() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [sessions, setSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const totalDuration = mode === 'work' ? WORK_DURATION : BREAK_DURATION;
  const progress = 1 - timeLeft / totalDuration;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const current = timeLeftRef.current;
      if (current <= 1) {
        clearTimer();
        if (mode === 'work') {
          setSessions((prev) => prev + 1);
          setMode('break');
          setTimeLeft(BREAK_DURATION);
          timeLeftRef.current = BREAK_DURATION;
        } else {
          setMode('work');
          setTimeLeft(WORK_DURATION);
          timeLeftRef.current = WORK_DURATION;
        }
        setStatus('idle');
      } else {
        setTimeLeft(current - 1);
        timeLeftRef.current = current - 1;
      }
    }, 1000);
  }, [clearTimer, mode]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setMode('work');
    setStatus('idle');
    setTimeLeft(WORK_DURATION);
    timeLeftRef.current = WORK_DURATION;
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (status === 'running') {
      startTimer();
    }
  }, [mode]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modeLabel = mode === 'work' ? 'Focus' : 'Break';
  const modeColor = mode === 'work' ? '#8b5cf6' : '#10b981';
  const modeTrackColor = isDarkMode
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card flex w-[220px] flex-col items-center gap-3 p-5"
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: modeColor }}
        >
          {modeLabel}
        </span>
        <span
          className={`text-xs font-medium ${
            isDarkMode ? 'text-white/40' : 'text-gray-400'
          }`}
        >
          #{sessions}
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={modeTrackColor}
            strokeWidth="6"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={modeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${modeColor}60)` }}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span
            className={`text-3xl font-light tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatTime(timeLeft)}
          </span>
          <span
            className={`mt-0.5 text-[10px] font-medium uppercase tracking-widest ${
              isDarkMode ? 'text-white/30' : 'text-gray-400'
            }`}
          >
            {status === 'running'
              ? 'Running'
              : status === 'paused'
                ? 'Paused'
                : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-2">
        {status === 'running' ? (
          <button
            onClick={pauseTimer}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isDarkMode
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-black/5 text-gray-700 hover:bg-black/10'
            }`}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: modeColor }}
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          onClick={resetTimer}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isDarkMode
              ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              : 'bg-black/5 text-gray-400 hover:bg-black/10 hover:text-gray-600'
          }`}
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
}
