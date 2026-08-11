import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

const STORAGE_KEY = 'the-infinite-table-exam-countdown-target';

const MOTIVATIONAL_MESSAGES = [
  "You've got this! 💪",
  'Stay focused, stay strong! 🎯',
  'Every minute counts! ⏰',
  'Hard work pays off! 🌟',
  'Almost there, keep going! 🚀',
  'Believe in yourself! ✨',
  'Consistency is key! 🔑',
  "You're doing great! 🙌",
  'Dream big, work hard! 💫',
  'Success is near! 🏆',
];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function computeTimeLeft(target: Date | null): TimeLeft {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const now = new Date().getTime();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

function loadTargetDate(): Date | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const date = new Date(stored);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  } catch {
  }
  return null;
}

function saveTargetDate(date: Date | null): void {
  try {
    if (date) {
      localStorage.setItem(STORAGE_KEY, date.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
  }
}

interface FlipDigitProps {
  value: string;
  label: string;
  isDarkMode: boolean;
}

function FlipDigit({ value, label, isDarkMode }: FlipDigitProps) {
  const prevValueRef = useRef(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsFlipping(true);
      prevValueRef.current = value;
      const timeout = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-lg ${
          isDarkMode
            ? 'bg-white/5 border border-white/10'
            : 'bg-black/5 border border-gray-200'
        } ${isFlipping ? 'flip-animate' : ''}`}
        style={{ perspective: '200px' }}
      >
        <span
          className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
      </div>
      <span
        className={`text-[9px] font-semibold uppercase tracking-widest ${
          isDarkMode ? 'text-white/30' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function ExamCountdown() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  const [targetDate, setTargetDate] = useState<Date | null>(() => loadTargetDate());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(loadTargetDate()));
  const [messageIndex, setMessageIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (targetDate) {
      const tick = () => {
        setTimeLeft(computeTimeLeft(targetDate));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  useEffect(() => {
    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 5000);

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setTargetDate(date);
        saveTargetDate(date);
        setShowDatePicker(false);
      }
    }
  }, []);

  const clearTarget = useCallback(() => {
    setTargetDate(null);
    saveTargetDate(null);
  }, []);

  const isExpired = targetDate !== null && timeLeft.total <= 0;
  const hasTarget = targetDate !== null;

  const dateInputValue = targetDate
    ? targetDate.toISOString().split('T')[0]
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card flex w-[240px] flex-col items-center gap-3 p-5"
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            isDarkMode ? 'text-amber-400' : 'text-amber-600'
          }`}
        >
          Exam Countdown
        </span>
        {hasTarget && (
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`rounded p-1 transition-colors ${
              isDarkMode
                ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'
            }`}
            title="Change date"
            aria-label="Change target date"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {(!hasTarget || showDatePicker) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={dateInputValue}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50'
                    : 'bg-black/5 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500/50'
                }`}
              />
              {hasTarget && (
                <div className="flex gap-2">
                  <button
                    onClick={clearTarget}
                    className={`flex-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className={`flex-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-white/5 text-white/50 hover:bg-white/10'
                        : 'bg-black/5 text-gray-400 hover:bg-black/10'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasTarget && !showDatePicker && (
        <>
          {isExpired ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 py-3"
            >
              <span className="text-3xl">🎉</span>
              <span
                className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Time's up!
              </span>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}
              >
                Good luck with your exam!
              </span>
            </motion.div>
          ) : (
            <div className="flex items-start gap-2 py-2">
              <FlipDigit
                value={timeLeft.days.toString().padStart(2, '0')}
                label="Days"
                isDarkMode={isDarkMode}
              />
              <span
                className={`mt-2.5 text-lg font-light ${
                  isDarkMode ? 'text-white/20' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <FlipDigit
                value={timeLeft.hours.toString().padStart(2, '0')}
                label="Hrs"
                isDarkMode={isDarkMode}
              />
              <span
                className={`mt-2.5 text-lg font-light ${
                  isDarkMode ? 'text-white/20' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <FlipDigit
                value={timeLeft.minutes.toString().padStart(2, '0')}
                label="Min"
                isDarkMode={isDarkMode}
              />
              <span
                className={`mt-2.5 text-lg font-light ${
                  isDarkMode ? 'text-white/20' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <FlipDigit
                value={timeLeft.seconds.toString().padStart(2, '0')}
                label="Sec"
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {!isExpired && (
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className={`text-center text-[11px] font-medium ${
                  isDarkMode ? 'text-white/40' : 'text-gray-400'
                }`}
              >
                {MOTIVATIONAL_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          )}
        </>
      )}

      {!hasTarget && (
        <div className="flex flex-col items-center gap-1 py-3">
          <span className="text-2xl">📅</span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            Set your exam date above
          </span>
        </div>
      )}
    </motion.div>
  );
}
