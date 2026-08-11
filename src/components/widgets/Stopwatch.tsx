import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

interface Lap {
  id: number;
  time: number;
  delta: number;
}

export default function Stopwatch() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    accumulatedRef.current = elapsed;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const total = accumulatedRef.current + (now - startTimeRef.current);
      setElapsed(total);
    }, 16);
  }, [elapsed]);

  const stop = useCallback(() => {
    clearTimer();
    accumulatedRef.current = elapsed;
    setIsRunning(false);
  }, [clearTimer, elapsed]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setLaps([]);
  }, [clearTimer]);

  const recordLap = useCallback(() => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const delta = elapsed - lastLapTime;
    const newLap: Lap = {
      id: laps.length + 1,
      time: elapsed,
      delta,
    };
    setLaps((prev) => {
      const updated = [newLap, ...prev];
      return updated.slice(0, 10);
    });
  }, [elapsed, laps]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const formatTime = (ms: number): { hours: string; minutes: string; seconds: string; centiseconds: string } => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      centiseconds: centiseconds.toString().padStart(2, '0'),
    };
  };

  const formatLapDelta = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const time = formatTime(elapsed);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card flex w-[220px] flex-col items-center gap-3 p-5"
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            isDarkMode ? 'text-violet-400' : 'text-violet-600'
          }`}
        >
          Stopwatch
        </span>
        {laps.length > 0 && (
          <span
            className={`text-[10px] font-medium ${
              isDarkMode ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            {laps.length} lap{laps.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-0.5 py-3">
        <span
          className={`text-3xl font-light tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ fontFamily: "'Inter', monospace", fontVariantNumeric: 'tabular-nums' }}
        >
          {time.hours}:{time.minutes}:{time.seconds}
        </span>
        <span
          className={`text-lg font-light ${
            isDarkMode ? 'text-white/40' : 'text-gray-400'
          }`}
          style={{ fontFamily: "'Inter', monospace", fontVariantNumeric: 'tabular-nums' }}
        >
          .{time.centiseconds}
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-2">
        {isRunning ? (
          <>
            <button
              onClick={stop}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-black/5 text-gray-700 hover:bg-black/10'
              }`}
            >
              Stop
            </button>
            <button
              onClick={recordLap}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
              }`}
            >
              Lap
            </button>
          </>
        ) : (
          <>
            <button
              onClick={start}
              className="flex-1 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-600"
            >
              {elapsed > 0 ? 'Resume' : 'Start'}
            </button>
            {elapsed > 0 && (
              <button
                onClick={reset}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    : 'bg-black/5 text-gray-400 hover:bg-black/10 hover:text-gray-600'
                }`}
              >
                Reset
              </button>
            )}
          </>
        )}
      </div>

      {laps.length > 0 && (
        <div
          className={`mt-1 w-full overflow-y-auto rounded-lg border ${
            isDarkMode ? 'border-white/5' : 'border-gray-200'
          }`}
          style={{ maxHeight: '120px' }}
        >
          {laps.map((lap) => (
            <div
              key={lap.id}
              className={`flex items-center justify-between px-3 py-1.5 text-[11px] ${
                isDarkMode
                  ? 'border-b border-white/5 last:border-b-0'
                  : 'border-b border-gray-100 last:border-b-0'
              }`}
            >
              <span
                className={`font-medium ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}
              >
                Lap {lap.id}
              </span>
              <span
                className={`font-medium ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}
                style={{ fontFamily: "'Inter', monospace", fontVariantNumeric: 'tabular-nums' }}
              >
                +{formatLapDelta(lap.delta)}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
