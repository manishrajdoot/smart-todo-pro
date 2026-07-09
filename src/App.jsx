import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Mic, Check, Trash2, Sun, Moon, Search, Edit2, 
  Download, Upload, MapPin, Wind, Droplets, Loader2, X,
  RefreshCw, Award, Flame, Zap, Clock, Calendar, Target,
  Play, Pause, RotateCcw, ListChecks, Share2, Gift, Star, Crown,
  Sparkles, TrendingUp, Brain, Paperclip, FileText, Command
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, addWeeks, addMonths, nextDay } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { categorizeWithAI } from './services/aiService';
import { getPriorityColor, getCategoryColor } from './utils/helpers';

// ============================================================
// COMPONENTS (All previous components, plus new ones)
// ============================================================

// ---------- Progress Bar ----------
function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5 }}
        className="h-2 rounded-full"
        style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))' }}
      />
    </div>
  );
}

// ---------- Empty State ----------
function EmptyState({ message, sub }) {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-6xl mb-4"
      >
        🎯
      </motion.div>
      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{message}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="text-center py-4 text-sm border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
      Developed with ❤️ by{' '}
      <a 
        href="https://manish-matrix-portfolio.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        Manish Rajdoot
      </a>
    </footer>
  );
}

// ---------- Bottom Navigation ----------
function BottomNav({ view, setView }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t z-20" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-4xl mx-auto flex justify-around py-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex flex-col items-center px-4 py-1.5 rounded-lg transition-all ${
              view === t.id ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ---------- Weather Widget (unchanged) ----------
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Loading...');

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
      );
      const data = await res.json();
      let city = '', country = '';
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1`
        );
        const geoData = await geoRes.json();
        if (geoData.results?.length) {
          city = geoData.results[0].name || '';
          country = geoData.results[0].country || '';
        }
      } catch (e) {}
      if (!city) {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        city = ipData.city || '';
        country = ipData.country_name || '';
      }
      setLocation(city ? `${city}, ${country}` : 'Unknown');
      setWeather({
        temp: Math.round(data.current_weather.temperature),
        wind: Math.round(data.current_weather.windspeed || 0),
        humidity: data.current?.relative_humidity_2m || 0,
        code: data.current_weather.weathercode || 0,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
              if (data.latitude && data.longitude) fetchWeather(data.latitude, data.longitude);
              else { setLoading(false); setLocation('Location unavailable'); }
            })
            .catch(() => { setLoading(false); setLocation('Location unavailable'); });
        }
      );
    } else {
      setLoading(false);
      setLocation('Location not supported');
    }
  }, []);

  const getIcon = (c) => {
    if (c === 0) return '☀️';
    if (c <= 3) return '⛅';
    if (c <= 20) return '🌧️';
    if (c <= 30) return '❄️';
    return '☁️';
  };

  if (loading) {
    return (
      <div className="card-gradient flex items-center justify-center gap-2 py-3">
        <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading weather...</span>
      </div>
    );
  }
  if (!weather) {
    return (
      <div className="card-gradient text-center py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        🌤️ Weather unavailable
      </div>
    );
  }
  return (
    <div className="card-gradient">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{location}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getIcon(weather.code)}</span>
          <div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{weather.temp}°</span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>C</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1">
            <Wind size={14} style={{ color: 'var(--accent)' }} />
            <span>{weather.wind} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={14} style={{ color: 'var(--accent)' }} />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Live Clock (with manual timezone) ----------
function LiveClock({ countryCode = 'US', manualTimezone = null }) {
  const [time, setTime] = useState(new Date());

  const getTimezone = (code) => {
    if (manualTimezone) return manualTimezone;
    const map = {
      'US': 'America/New_York', 'GB': 'Europe/London', 'IN': 'Asia/Kolkata',
      'CA': 'America/Toronto', 'AU': 'Australia/Sydney', 'DE': 'Europe/Berlin',
      'FR': 'Europe/Paris', 'JP': 'Asia/Tokyo', 'CN': 'Asia/Shanghai',
      'BR': 'America/Sao_Paulo', 'RU': 'Europe/Moscow', 'ZA': 'Africa/Johannesburg',
      'EG': 'Africa/Cairo', 'MX': 'America/Mexico_City', 'IT': 'Europe/Rome',
      'ES': 'Europe/Madrid', 'KR': 'Asia/Seoul', 'SA': 'Asia/Riyadh',
      'AE': 'Asia/Dubai', 'SG': 'Asia/Singapore', 'MY': 'Asia/Kuala_Lumpur',
      'NZ': 'Pacific/Auckland', 'IE': 'Europe/Dublin', 'NL': 'Europe/Amsterdam',
      'SE': 'Europe/Stockholm', 'CH': 'Europe/Zurich', 'BE': 'Europe/Brussels',
      'AT': 'Europe/Vienna', 'DK': 'Europe/Copenhagen', 'NO': 'Europe/Oslo',
      'FI': 'Europe/Helsinki', 'PL': 'Europe/Warsaw', 'PT': 'Europe/Lisbon',
      'GR': 'Europe/Athens', 'TR': 'Europe/Istanbul', 'IL': 'Asia/Jerusalem',
      'PK': 'Asia/Karachi', 'BD': 'Asia/Dhaka', 'NG': 'Africa/Lagos',
      'KE': 'Africa/Nairobi', 'AR': 'America/Buenos_Aires', 'CL': 'America/Santiago',
      'CO': 'America/Bogota', 'PE': 'America/Lima', 'TH': 'Asia/Bangkok',
      'VN': 'Asia/Ho_Chi_Minh', 'ID': 'Asia/Jakarta', 'PH': 'Asia/Manila',
    };
    return map[code] || Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const tz = getTimezone(countryCode);
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      const [h, m, s] = formatted.split(':').map(Number);
      const newDate = new Date(now);
      newDate.setHours(h, m, s, 0);
      setTime(newDate);
    }, 1000);
    return () => clearInterval(interval);
  }, [countryCode, manualTimezone]);

  const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>🕐 {countryCode}</span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dateStr}</span>
      </div>
      <div className="text-center mt-1">
        <motion.span
          key={time.getTime()}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tabular-nums"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </motion.span>
      </div>
    </div>
  );
}

// ---------- Stats Widget ----------
function StatsWidget({ completed, total, streak, points, badges }) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="card">
      <div className="flex flex-wrap justify-around gap-2">
        <div className="text-center min-w-[60px]">
          <div className="text-green-500 text-lg">✅</div>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{completed}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Done</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-blue-500 text-lg">⏳</div>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{total - completed}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Pending</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-orange-500 text-lg">🔥</div>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{streak}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Streak</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-purple-500 text-lg">🏆</div>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{rate}%</p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Rate</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(rate, 100)}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))' }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-500" />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {rate === 100 ? '🎉 Perfect!' : rate >= 75 ? '🔥 Amazing!' : rate >= 50 ? '💪 Keep going!' : rate >= 25 ? '📈 On track!' : '🚀 Start now!'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1"><Award size={14} className="text-yellow-500" />{points}</span>
          {badges.length > 0 && <span className="flex items-center gap-1"><Crown size={14} className="text-purple-500" />{badges.length}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------- Smart Suggestion (Level 2) ----------
function SmartSuggestion({ tasks }) {
  const suggestion = useMemo(() => {
    if (tasks.length === 0) return null;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...tasks]
      .filter(t => !t.completed)
      .sort((a, b) => {
        const pA = priorityOrder[a.priority] ?? 1;
        const pB = priorityOrder[b.priority] ?? 1;
        if (pA !== pB) return pA - pB;
        const dA = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
        const dB = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
        return dA - dB;
      });
    return sorted[0] || null;
  }, [tasks]);

  if (!suggestion) return null;

  return (
    <div className="card flex items-center gap-3 border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
      <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>💡 Suggested Next Task</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{suggestion.title}</p>
        <div className="flex gap-2 mt-1">
          <span className={`badge ${getPriorityColor(suggestion.priority)}`}>{suggestion.priority}</span>
          {suggestion.dueDate && (
            <span className="badge bg-gray-100 dark:bg-gray-700" style={{ color: 'var(--text-secondary)' }}>
              📅 {format(new Date(suggestion.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => toast('Focus on this task!', { duration: 2000 })}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Target size={18} style={{ color: 'var(--accent)' }} />
      </button>
    </div>
  );
}

// ---------- Subtask List ----------
function SubtaskList({ subtasks, onToggle, onAdd, onDelete }) {
  const [newSubtask, setNewSubtask] = useState('');
  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd(newSubtask.trim());
      setNewSubtask('');
    }
  };
  return (
    <div className="ml-6 mt-2 space-y-1">
      {subtasks?.map((sub) => (
        <div key={sub.id} className="flex items-center gap-2">
          <button onClick={() => onToggle(sub.id)} className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500'}`}>
            {sub.completed && <Check size={10} className="text-white" />}
          </button>
          <span className={`text-sm ${sub.completed ? 'line-through' : ''}`} style={{ color: sub.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
            {sub.title}
          </span>
          <button onClick={() => onDelete(sub.id)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add subtask..."
          className="text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border focus:outline-none focus:ring-1"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} style={{ color: 'var(--accent)' }}><Plus size={16} /></button>
      </div>
    </div>
  );
}

// ---------- Pomodoro Timer ----------
function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            const msg = isBreak ? 'Break over! Time to work.' : 'Time for a break!';
            toast(msg);
            setIsBreak(!isBreak);
            setMinutes(isBreak ? 25 : 5);
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, isBreak]);

  const reset = () => {
    setMinutes(25);
    setSeconds(0);
    setIsRunning(false);
    setIsBreak(false);
  };

  return (
    <div className="card text-center">
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        {isBreak ? '☕ Break' : '🎯 Focus'}
      </h3>
      <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-2 mt-3">
        <button onClick={() => setIsRunning(!isRunning)} className={`p-2 rounded-lg ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={reset} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}

// ---------- Focus Mode ----------
function FocusMode({ task, onExit }) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => {
      document.exitFullscreen?.().catch(() => {});
      clearInterval(interval);
    };
  }, []);
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white">
      <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors text-2xl">✕</button>
      <h2 className="text-3xl font-bold mb-4">🎯 Focus Mode</h2>
      <p className="text-xl text-gray-300 mb-8">{task?.title || 'Focus on your task'}</p>
      <div className="text-7xl font-bold text-blue-400 mb-8">{formatTime(time)}</div>
      <button onClick={onExit} className="px-8 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors text-white text-lg">Exit Focus</button>
    </div>
  );
}

// ---------- Calendar View ----------
function CalendarView({ selectedCountry, holidays, loading }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const getHolidaysForDay = (day) => {
    return holidays?.filter(h => isSameDay(new Date(h.date), day)) || [];
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">◀</button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">▶</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayHolidays = getHolidaysForDay(day);
          const isTodayDate = isToday(day);
          return (
            <div
              key={idx}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                isTodayDate ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${dayHolidays.length > 0 ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (dayHolidays.length > 0) {
                  const names = dayHolidays.map(h => h.name).join('\n');
                  toast(`📅 ${format(day, 'MMM d, yyyy')}:\n${names}`, { duration: 5000 });
                }
              }}
            >
              <span className={`text-sm ${isTodayDate ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`} style={{ color: isTodayDate ? undefined : 'var(--text-primary)' }}>
                {format(day, 'd')}
              </span>
              {dayHolidays.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                  {dayHolidays.length > 1 && <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>+{dayHolidays.length-1}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-center text-xs border-t pt-2" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
        {loading ? 'Loading holidays...' : `${holidays?.length || 0} holidays this month`}
      </div>
    </div>
  );
}

// ---------- Analytics Widget ----------
function AnalyticsWidget({ tasks, completed, total, streak }) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cats = tasks.reduce((acc, t) => {
    const name = t.category?.name || 'Personal';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };
  const getCompletionData = () => {
    const days = getLast7Days();
    return days.map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));
      return tasks.filter(t => 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === d.toDateString()
      ).length;
    });
  };
  const maxCompletion = Math.max(...getCompletionData(), 1);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>📊 Analytics Dashboard</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completion</p><p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{rate}%</p></div>
        <div className="card"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Streak</p><p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{streak} 🔥</p></div>
        <div className="card"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{total}</p></div>
        <div className="card"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending</p><p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{total - completed}</p></div>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>📈 Weekly Progress</h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {getLast7Days().map((day, i) => {
            const value = getCompletionData()[i] || 0;
            const height = maxCompletion > 0 ? (value / maxCompletion) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full max-w-[30px] rounded-t-lg"
                  style={{ background: 'linear-gradient(to top, var(--accent), var(--accent-hover))', height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                />
                <span className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{day}</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📂 Categories</h3>
        {Object.entries(cats).length > 0 ? (
          Object.entries(cats).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{k}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${total > 0 ? (v / total) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No categories yet</p>
        )}
      </div>
    </div>
  );
}

// ---------- Settings Widget (with theme, dark mode, timezone) ----------
function SettingsWidget({ darkMode, setDarkMode, theme, setTheme, exportTasks, importTasks, clearCompleted, timezone, setTimezone }) {
  const themes = [
    { id: 'default', name: 'Default', color: '#3b82f6' },
    { id: 'ocean', name: 'Ocean', color: '#10b981' },
    { id: 'sunset', name: 'Sunset', color: '#f97316' },
    { id: 'forest', name: 'Forest', color: '#22c55e' },
    { id: 'midnight', name: 'Midnight', color: '#8b5cf6' },
  ];

  const timezones = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland', 'Africa/Johannesburg',
    'America/Sao_Paulo', 'America/Mexico_City'
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ Settings</h2>
      <div className="card space-y-3">
        {/* Dark Mode */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon size={18} style={{ color: 'var(--accent)' }} /> : <Sun size={18} style={{ color: 'var(--accent)' }} />}
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Theme */}
        <div className="py-2">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>🎨 Theme</p>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  theme === t.id ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  background: theme === t.id ? 'var(--accent)' : 'var(--border-color)',
                  color: theme === t.id ? 'white' : 'var(--text-primary)',
                  ringColor: 'var(--accent)',
                }}
              >
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="py-2">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>🕐 Timezone</p>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ 
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px',
              ringColor: 'var(--accent)'
            }}
          >
            <option value="auto">Auto (detect from browser)</option>
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <button onClick={exportTasks} className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Download size={18} /> Export Tasks</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>JSON</span>
        </button>
        <label className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Upload size={18} /> Import Tasks</span>
          <input type="file" accept=".json" onChange={importTasks} className="hidden" />
        </label>
        <button onClick={clearCompleted} className="w-full flex items-center justify-between py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 size={18} /> Clear Completed</span>
          <span className="text-xs text-red-400">Permanent</span>
        </button>
        <button onClick={() => { if (window.confirm('⚠️ Delete all tasks permanently?')) { localStorage.removeItem('tasks'); localStorage.removeItem('points'); localStorage.removeItem('badges'); window.location.reload(); } }} className="w-full flex items-center justify-between py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400"><RefreshCw size={18} /> Reset All Data</span>
          <span className="text-xs text-red-400">⚠️ Warning</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LEVEL 3 NEW COMPONENTS
// ============================================================

// ---------- File Attachment ----------
function FileAttachment({ task, onAttach, onRemove }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      onAttach(task.id, { name: file.name, type: file.type, data: base64 });
    };
    reader.readAsDataURL(file);
  };

  const attachment = task.attachment;
  if (attachment) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <Paperclip size={14} />
        <span>{attachment.name}</span>
        <button onClick={() => onRemove(task.id)} className="text-red-400 hover:text-red-600">
          <X size={14} />
        </button>
        {attachment.type.startsWith('image/') && (
          <img src={attachment.data} alt="attachment" className="h-8 w-8 object-cover rounded" />
        )}
      </div>
    );
  }
  return (
    <div className="mt-2">
      <label className="text-xs flex items-center gap-1 cursor-pointer" style={{ color: 'var(--accent)' }}>
        <Paperclip size={14} /> Attach file
        <input type="file" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}

// ---------- AI Daily Plan Button ----------
function DailyPlanButton({ tasks, onPlanGenerated }) {
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (tasks.length === 0) {
      toast('No tasks to plan.');
      return;
    }
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      let plan = [];
      if (apiKey && apiKey !== 'your_openrouter_api_key_here') {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              {
                role: 'system',
                content: 'You are a productivity assistant. Based on the list of tasks, suggest the best order to work on them today. Return a JSON array of task titles in the recommended order.'
              },
              {
                role: 'user',
                content: `Tasks: ${tasks.map(t => `"${t.title}" (due: ${t.dueDate ? format(new Date(t.dueDate), 'MMM d') : 'none'}, priority: ${t.priority})`).join('; ')}`
              }
            ],
            temperature: 0.5,
            max_tokens: 300,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '[]';
          const clean = content.replace(/```json|```/g, '').trim();
          plan = JSON.parse(clean);
        }
      }
      if (!plan || !Array.isArray(plan) || plan.length === 0) {
        // Fallback: sort by priority + due date
        plan = [...tasks]
          .filter(t => !t.completed)
          .sort((a, b) => {
            const pOrder = { high: 0, medium: 1, low: 2 };
            const pa = pOrder[a.priority] ?? 1;
            const pb = pOrder[b.priority] ?? 1;
            if (pa !== pb) return pa - pb;
            const da = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
            const db = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
            return da - db;
          })
          .map(t => t.title);
      }
      onPlanGenerated(plan);
    } catch (error) {
      console.error('Daily plan error:', error);
      toast('Could not generate plan, using fallback.');
      const fallback = tasks
        .filter(t => !t.completed)
        .sort((a, b) => {
          const pOrder = { high: 0, medium: 1, low: 2 };
          const pa = pOrder[a.priority] ?? 1;
          const pb = pOrder[b.priority] ?? 1;
          if (pa !== pb) return pa - pb;
          const da = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
          const db = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
          return da - db;
        })
        .map(t => t.title);
      onPlanGenerated(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePlan}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
      style={{ background: 'var(--accent)' }}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
      {loading ? 'Planning...' : 'AI Daily Plan'}
    </button>
  );
}

// ---------- Voice Command Processor (integrated in main component) ----------

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  // ---------- STATE ----------
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('themePreference') === 'dark' || 
      (!localStorage.getItem('themePreference') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState('home');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [focusTask, setFocusTask] = useState(null);
  const [points, setPoints] = useLocalStorage('points', 0);
  const [badges, setBadges] = useLocalStorage('badges', []);
  const [theme, setTheme] = useLocalStorage('theme', 'default');
  const [timezone, setTimezone] = useLocalStorage('timezone', 'auto');
  const [dailyPlan, setDailyPlan] = useState([]); // Level 3

  const { text, isListening, startListening, error: voiceError } = useSpeechRecognition();

  // ---------- Holidays ----------
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (selectedCountry) {
      setHolidaysLoading(true);
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${holidayYear}/${selectedCountry}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setHolidays(data || []))
        .catch(() => setHolidays([]))
        .finally(() => setHolidaysLoading(false));
    }
  }, [selectedCountry, holidayYear]);

  // ---------- Voice Command Processor (Level 3) ----------
  const processVoiceCommand = useCallback((command) => {
    const lower = command.toLowerCase().trim();
    // Complete task X
    const completeMatch = lower.match(/complete\s+(.+)/i);
    if (completeMatch) {
      const title = completeMatch[1].trim();
      const task = tasks.find(t => t.title.toLowerCase() === title.toLowerCase() && !t.completed);
      if (task) {
        toggleTask(task.id);
        toast(`✅ Completed: ${task.title}`);
      } else {
        toast(`No pending task found: "${title}"`);
      }
      return true;
    }
    // Delete task X
    const deleteMatch = lower.match(/delete\s+(.+)/i);
    if (deleteMatch) {
      const title = deleteMatch[1].trim();
      const task = tasks.find(t => t.title.toLowerCase() === title.toLowerCase());
      if (task) {
        deleteTask(task.id);
        toast(`🗑️ Deleted: ${task.title}`);
      } else {
        toast(`No task found: "${title}"`);
      }
      return true;
    }
    // Show pending tasks
    if (lower.includes('show pending') || lower.includes('show tasks')) {
      const pending = tasks.filter(t => !t.completed);
      if (pending.length === 0) {
        toast('🎉 No pending tasks!');
      } else {
        const list = pending.map(t => `• ${t.title}`).join('\n');
        toast(`📋 Pending tasks:\n${list}`, { duration: 5000 });
      }
      return true;
    }
    // Add task X (if not caught by auto-add)
    const addMatch = lower.match(/add\s+(.+)/i);
    if (addMatch) {
      const title = addMatch[1].trim();
      handleAddTask(title);
      return true;
    }
    return false;
  }, [tasks]);

  // ---------- Effects ----------
  useEffect(() => {
    if (text && text.length > 2) {
      // If voice input contains a command, process it; otherwise, auto-add task
      const handled = processVoiceCommand(text);
      if (!handled) {
        handleAddTask(text);
        setInput('');
      } else {
        setInput('');
      }
    }
  }, [text]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('themePreference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('themePreference', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (voiceError) toast.error(voiceError);
  }, [voiceError]);

  // ---------- Notifications ----------
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const checkDueTasks = () => {
      const today = new Date();
      const dueTasks = tasks.filter(t => 
        t.dueDate && !t.completed && isSameDay(new Date(t.dueDate), today)
      );
      if (dueTasks.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('📋 Tasks Due Today!', {
          body: `You have ${dueTasks.length} task${dueTasks.length > 1 ? 's' : ''} due today.`,
          icon: '/vite.svg'
        });
      }
    };
    checkDueTasks();
    const interval = setInterval(checkDueTasks, 3600000);
    return () => clearInterval(interval);
  }, [tasks]);

  // ---------- AI Categorization ----------
  const categorizeTask = useCallback(async (taskText) => {
    try { 
      return await categorizeWithAI(taskText); 
    } catch { 
      return { name: 'Personal', color: 'yellow', emoji: '😊', priority: 'low' }; 
    }
  }, []);

  // ---------- Smart Date Parser ----------
  const parseNaturalDate = (text) => {
    const now = new Date();
    const lower = text.toLowerCase();
    if (/today/i.test(lower)) return new Date(now.setHours(23, 59, 59, 999));
    if (/tomorrow/i.test(lower)) return new Date(now.setDate(now.getDate() + 1));
    const inMatch = lower.match(/in\s+(\d+)\s+(day|days|week|weeks|month|months)/i);
    if (inMatch) {
      const num = parseInt(inMatch[1]);
      const unit = inMatch[2].toLowerCase();
      if (unit.startsWith('day')) return addDays(now, num);
      if (unit.startsWith('week')) return addWeeks(now, num);
      if (unit.startsWith('month')) return addMonths(now, num);
    }
    const nextMatch = lower.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (nextMatch) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const target = days.indexOf(nextMatch[1].toLowerCase());
      if (target !== -1) {
        const date = nextDay(now, target);
        date.setHours(23, 59, 59, 999);
        return date;
      }
    }
    const match = text.match(/\d{1,2}\/\d{1,2}/);
    if (match) {
      const [m, d] = match[0].split('/');
      return new Date(now.getFullYear(), parseInt(m) - 1, parseInt(d));
    }
    return null;
  };

  // ---------- CRUD ----------
  const determinePriority = (text) => {
    if (/(urgent|asap|important|critical|immediate)/i.test(text)) return 'high';
    if (/(low priority|someday|maybe|whenever)/i.test(text)) return 'low';
    return 'medium';
  };

  const handleAddTask = useCallback(async (taskText = input) => {
    if (!taskText.trim()) { 
      toast.error('Please enter a task'); 
      return; 
    }
    const category = await categorizeTask(taskText);
    const dueDate = parseNaturalDate(taskText);
    const newTask = {
      id: Date.now(),
      title: taskText.trim(),
      completed: false,
      category: category,
      priority: determinePriority(taskText),
      dueDate: dueDate,
      createdAt: new Date(),
      completedAt: null,
      tags: (taskText.match(/#\w+/g) || []).map(tag => tag.slice(1)),
      subtasks: [],
      recurring: null,
      notes: '',
      attachment: null, // Level 3
    };
    setTasks(prev => [newTask, ...prev]);
    setInput('');
    toast.success('Task added! 🎯');
  }, [input, setTasks, categorizeTask]);

  // ---------- Gamification ----------
  const awardPointsAndBadges = (task) => {
    let earnedPoints = 10;
    if (task.subtasks?.length > 0) {
      earnedPoints += task.subtasks.filter(s => s.completed).length * 5;
    }
    if (task.priority === 'high') earnedPoints += 5;
    if (task.dueDate && new Date(task.dueDate) > new Date()) {
      earnedPoints += 3;
    }
    const newPoints = points + earnedPoints;
    setPoints(newPoints);
    const newBadges = [...badges];
    if (newPoints >= 100 && !newBadges.includes('rookie')) {
      newBadges.push('rookie');
      toast.success('🏅 Badge Unlocked: Rookie!');
    }
    if (newPoints >= 250 && !newBadges.includes('achiever')) {
      newBadges.push('achiever');
      toast.success('🏅 Badge Unlocked: Achiever!');
    }
    if (newPoints >= 500 && !newBadges.includes('master')) {
      newBadges.push('master');
      toast.success('🏅 Badge Unlocked: Master!');
    }
    if (newPoints >= 1000 && !newBadges.includes('legend')) {
      newBadges.push('legend');
      toast.success('🏅 Badge Unlocked: Legend! 🎉');
    }
    setBadges(newBadges);
  };

  // ---------- Share ----------
  const shareTask = (task) => {
    const shareText = `📋 Task: ${task.title}\n📅 Due: ${task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}\n🏷️ Category: ${task.category?.name || 'Personal'}\n⚡ Priority: ${task.priority || 'medium'}\n\n✅ Smart To-Do Pro`;
    if (navigator.share) {
      navigator.share({ title: 'Smart To-Do Pro', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText + '\n\n' + window.location.href);
      toast.success('Task details copied to clipboard!');
    }
  };

  // ---------- AI Subtask Generator ----------
  const generateSubtasks = async (taskId, taskTitle) => {
    toast.loading('🤖 Generating subtasks...', { id: 'gen-subtasks' });
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    let subtaskArray = [];

    if (apiKey && apiKey !== 'your_openrouter_api_key_here') {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              {
                role: 'system',
                content: 'You are an expert task breakdown assistant. Given a task title, suggest 3-5 actionable, specific subtasks in a logical order. Return only a JSON array of strings, e.g. ["Subtask 1", "Subtask 2"].'
              },
              {
                role: 'user',
                content: `Task: "${taskTitle}"`
              }
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '[]';
          const clean = content.replace(/```json|```/g, '').trim();
          subtaskArray = JSON.parse(clean);
          if (!Array.isArray(subtaskArray) || subtaskArray.length === 0) throw new Error('Invalid');
        } else {
          console.warn('OpenRouter API error:', response.status);
        }
      } catch (error) {
        console.error('AI subtask generation error:', error);
      }
    }
    if (!subtaskArray || subtaskArray.length === 0) {
      subtaskArray = [`Plan and research ${taskTitle}`, `Gather necessary resources for ${taskTitle}`, `Execute ${taskTitle}`, `Review and finalize ${taskTitle}`];
      toast.info('Used fallback subtasks (AI unavailable)', { id: 'gen-subtasks' });
    }
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newSubtasks = subtaskArray.map((title, idx) => ({ id: Date.now() + idx, title, completed: false }));
        return { ...task, subtasks: [...(task.subtasks || []), ...newSubtasks] };
      }
      return task;
    }));
    toast.success(`✨ ${subtaskArray.length} subtasks added!`, { id: 'gen-subtasks' });
  };

  // ---------- toggleTask ----------
  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        if (completed) awardPointsAndBadges(task);
        return { ...task, completed, completedAt: completed ? new Date() : null };
      }
      return task;
    }));
  };

  // ---------- File Attachment (Level 3) ----------
  const handleAttachFile = (taskId, fileData) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, attachment: fileData } : task
    ));
    toast.success('File attached!');
  };

  const handleRemoveFile = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, attachment: null } : task
    ));
    toast.success('File removed.');
  };

  // ---------- Daily Plan ----------
  const handleDailyPlanGenerated = (plan) => {
    setDailyPlan(plan);
    toast('📅 Daily plan generated! Check the list.');
  };

  // ---------- Subtask Operations ----------
  const addSubtask = (taskId, title) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newSubtask = { id: Date.now() + Math.random(), title, completed: false };
        return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
      }
      return task;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, subtasks: task.subtasks?.map(sub => 
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        ) };
      }
      return task;
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, subtasks: task.subtasks?.filter(sub => sub.id !== subtaskId) };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success('Deleted');
  };

  const editTask = (id, newTitle) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, title: newTitle } : task
    ));
    setEditingId(null);
    toast.success('Updated');
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
    toast.success('Cleared completed tasks');
  };

  // ---------- Recurring ----------
  const setRecurring = (taskId, type) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, recurring: type ? { type, interval: 1, nextOccurrence: null } : null };
      }
      return task;
    }));
  };

  // ---------- Export/Import ----------
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `tasks-${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.click();
    toast.success('Exported!');
  };

  const importTasks = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setTasks(imported);
          toast.success('Imported successfully!');
        } else {
          toast.error('Invalid data format');
        }
      } catch {
        toast.error('Invalid file');
      }
    };
    reader.readAsText(file);
  };

  // ---------- Filtering ----------
  const getFilteredTasks = () => {
    let filtered = tasks;
    if (filter === 'completed') filtered = filtered.filter(t => t.completed);
    if (filter === 'pending') filtered = filtered.filter(t => !t.completed);
    if (searchQuery) filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (tasks.some(t => t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString())) {
        s++;
      } else break;
    }
    return s;
  })();

  // ---------- Render Home ----------
  const renderHome = () => (
    <div className="space-y-4">
      {/* Daily Plan Button */}
      <div className="flex justify-end">
        <DailyPlanButton tasks={tasks} onPlanGenerated={handleDailyPlanGenerated} />
      </div>
      {dailyPlan.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>📅 Today's Plan</h3>
          <ol className="list-decimal list-inside text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {dailyPlan.map((title, i) => (
              <li key={i}>{title}</li>
            ))}
          </ol>
        </div>
      )}

      <SmartSuggestion tasks={tasks} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsWidget completed={completed} total={total} streak={streak} points={points} badges={badges} />
        <div className="space-y-4">
          <LiveClock countryCode={selectedCountry} manualTimezone={timezone === 'auto' ? null : timezone} />
          <PomodoroTimer />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="input-field pl-10"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task... (try voice 🎤)"
            className="input-field pr-24"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={startListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Mic size={18} />
            </button>
            <button
              onClick={() => handleAddTask()}
              className="p-2 rounded-lg text-white transition-colors"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
              filter === f 
                ? 'text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            style={filter === f ? { background: 'var(--accent)' } : { color: 'var(--text-primary)' }}
          >
            {f === 'all' ? 'All' : f === 'pending' ? '📋 Pending' : '✅ Completed'}
          </button>
        ))}
        <button
          onClick={clearCompleted}
          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Clear Completed
        </button>
      </div>

      <AnimatePresence>
        {filteredTasks.length === 0 ? (
          <EmptyState 
            message="No tasks found!" 
            sub={searchQuery ? "Try a different search term" : "Add a task above or try voice input 🎤"} 
          />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const subtaskProgress = task.subtasks?.length > 0 
                ? (task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100 
                : 0;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="card"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
                      }`}
                    >
                      {task.completed && <Check size={14} className="text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <input
                          type="text"
                          defaultValue={task.title}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') editTask(task.id, e.target.value);
                          }}
                          onBlur={(e) => editTask(task.id, e.target.value)}
                          className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2"
                          style={{ ringColor: 'var(--accent)', color: 'var(--text-primary)' }}
                          autoFocus
                        />
                      ) : (
                        <p className={`font-medium ${
                          task.completed 
                            ? 'line-through' 
                            : ''
                        }`} style={{ color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          {task.title}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`badge ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`badge ${getCategoryColor(task.category?.name)}`}>
                          {task.category?.emoji} {task.category?.name}
                        </span>
                        {task.dueDate && (
                          <span className="badge bg-gray-100 dark:bg-gray-700" style={{ color: 'var(--text-secondary)' }}>
                            📅 {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            #{task.tags.join(' #')}
                          </span>
                        )}
                        {task.recurring && (
                          <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            🔄 {task.recurring.type}
                          </span>
                        )}
                      </div>
                      {task.subtasks?.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <ListChecks size={14} className="text-gray-400" />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(subtaskProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <SubtaskList 
                            subtasks={task.subtasks}
                            onToggle={(sid) => toggleSubtask(task.id, sid)}
                            onAdd={(title) => addSubtask(task.id, title)}
                            onDelete={(sid) => deleteSubtask(task.id, sid)}
                          />
                        </div>
                      )}
                      {!task.subtasks?.length && !task.completed && (
                        <button
                          onClick={() => generateSubtasks(task.id, task.title)}
                          className="mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Sparkles size={14} /> Generate Subtasks
                        </button>
                      )}
                      {/* File Attachment (Level 3) */}
                      <FileAttachment task={task} onAttach={handleAttachFile} onRemove={handleRemoveFile} />
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => shareTask(task)}
                        className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        title="Share Task"
                      >
                        <Share2 size={16} className="text-green-400 hover:text-green-600" />
                      </button>
                      <button
                        onClick={() => setFocusTask(task)}
                        className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        title="Focus Mode"
                      >
                        <Target size={16} className="text-purple-400 hover:text-purple-600" />
                      </button>
                      <button
                        onClick={() => {
                          const types = ['daily', 'weekly', 'monthly'];
                          const current = task.recurring?.type || 'none';
                          const idx = types.indexOf(current);
                          const next = idx >= 0 ? types[(idx + 1) % types.length] : 'daily';
                          if (next === 'daily') setRecurring(task.id, 'daily');
                          else if (next === 'weekly') setRecurring(task.id, 'weekly');
                          else if (next === 'monthly') setRecurring(task.id, 'monthly');
                          else setRecurring(task.id, null);
                          toast.success(`Recurring: ${next}`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                        title="Toggle Recurring"
                      >
                        <span className="text-sm">🔄</span>
                      </button>
                      <button
                        onClick={() => setEditingId(editingId === task.id ? null : task.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  // ---------- Main Render ----------
  return (
    <div data-theme={theme} className="min-h-screen transition-colors duration-300 pb-20" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      
      {focusTask && <FocusMode task={focusTask} onExit={() => setFocusTask(null)} />}
      
      <header className="sticky top-0 z-10 glass border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                📋 Smart To-Do
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Pro</span>
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {completed}/{total} tasks • {streak} day streak 🔥
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={20} style={{ color: 'var(--accent)' }} /> : <Moon size={20} style={{ color: 'var(--accent)' }} />}
              </button>
              <button 
                onClick={exportTasks} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Download size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <label className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <Upload size={20} style={{ color: 'var(--text-secondary)' }} />
                <input type="file" accept=".json" onChange={importTasks} className="hidden" />
              </label>
            </div>
          </div>
          
          <ProgressBar progress={progress} />
          
          <div className="mt-2">
            <WeatherWidget />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'home' && renderHome()}
            {view === 'analytics' && (
              <AnalyticsWidget 
                tasks={tasks} 
                completed={completed} 
                total={total} 
                streak={streak} 
              />
            )}
            {view === 'calendar' && (
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      background: 'var(--bg-card)', 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px',
                      ringColor: 'var(--accent)'
                    }}
                  >
                    <option value="US">🇺🇸 US</option>
                    <option value="GB">🇬🇧 UK</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="BR">🇧🇷 Brazil</option>
                    <option value="IT">🇮🇹 Italy</option>
                    <option value="ES">🇪🇸 Spain</option>
                    <option value="KR">🇰🇷 South Korea</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="NZ">🇳🇿 New Zealand</option>
                    <option value="ZA">🇿🇦 S. Africa</option>
                    <option value="EG">🇪🇬 Egypt</option>
                    <option value="TR">🇹🇷 Turkey</option>
                    <option value="IL">🇮🇱 Israel</option>
                    <option value="PK">🇵🇰 Pakistan</option>
                    <option value="BD">🇧🇩 Bangladesh</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="KE">🇰🇪 Kenya</option>
                  </select>
                  <select
                    value={holidayYear}
                    onChange={(e) => setHolidayYear(parseInt(e.target.value))}
                    className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      background: 'var(--bg-card)', 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px',
                      ringColor: 'var(--accent)'
                    }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <CalendarView 
                  selectedCountry={selectedCountry} 
                  holidays={holidays} 
                  loading={holidaysLoading} 
                />
              </div>
            )}
            {view === 'settings' && (
              <SettingsWidget 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                theme={theme}
                setTheme={setTheme}
                exportTasks={exportTasks} 
                importTasks={importTasks} 
                clearCompleted={clearCompleted} 
                timezone={timezone}
                setTimezone={setTimezone}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        <Footer />
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  );
}