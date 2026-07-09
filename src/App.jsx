import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Mic, Check, Trash2, Sun, Moon, Search, Edit2, 
  Download, Upload, MapPin, Wind, Droplets, Loader2, X,
  RefreshCw, Award, Flame, Zap, Clock, Calendar, Target,
  Play, Pause, RotateCcw, ListChecks
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, addWeeks, addMonths } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { categorizeWithAI } from './services/aiService';
import { getPriorityColor, getCategoryColor } from './utils/helpers';

// ============================================================
// COMPONENTS
// ============================================================

// ---------- Progress Bar ----------
function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
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
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">{message}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="text-center py-4 text-sm text-gray-400 border-t border-gray-200 dark:border-gray-700">
      Developed with ❤️ by{' '}
      <a 
        href="https://manish-matrix-portfolio.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-20">
      <div className="max-w-4xl mx-auto flex justify-around py-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex flex-col items-center px-4 py-1.5 rounded-lg transition-all ${
              view === t.id 
                ? 'text-blue-500' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
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

// ---------- Weather Widget ----------
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Loading...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true&timezone=auto&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
            );
            const data = await res.json();
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&count=1`
            );
            const geoData = await geoRes.json();
            setLocation(geoData.results?.[0]?.name || 'Your Location');
            setWeather({
              temp: Math.round(data.current_weather.temperature),
              wind: Math.round(data.current_weather.windspeed || 0),
              humidity: data.current?.relative_humidity_2m || 0,
              code: data.current_weather.weathercode || 0,
            });
          } catch (e) { console.error(e); }
          setLoading(false);
        },
        () => setLoading(false)
      );
    } else {
      setLoading(false);
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
        <Loader2 className="animate-spin text-blue-500" size={18} />
        <span className="text-sm text-gray-500">Loading weather...</span>
      </div>
    );
  }
  if (!weather) {
    return (
      <div className="card-gradient text-center py-3 text-sm text-gray-400">
        🌤️ Weather unavailable
      </div>
    );
  }
  return (
    <div className="card-gradient">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{location}</span>
        </div>
        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getIcon(weather.code)}</span>
          <div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{weather.temp}°</span>
            <span className="text-xs text-gray-400 ml-1">C</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Wind size={14} className="text-blue-400" />
            <span>{weather.wind} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={14} className="text-blue-400" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Live Clock (timezone-aware) ----------
function LiveClock({ countryCode = 'US' }) {
  const [time, setTime] = useState(new Date());

  const getTimezone = (code) => {
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
  }, [countryCode]);

  const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">🕐 {countryCode}</span>
        <span className="text-xs text-gray-400">{dateStr}</span>
      </div>
      <div className="text-center mt-1">
        <motion.span
          key={time.getTime()}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tabular-nums bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </motion.span>
      </div>
    </div>
  );
}

// ---------- Stats Widget ----------
function StatsWidget({ completed, total, streak }) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="card">
      <div className="flex flex-wrap justify-around gap-2">
        <div className="text-center min-w-[60px]">
          <div className="text-green-500 text-lg">✅</div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{completed}</p>
          <p className="text-[10px] text-gray-400">Done</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-blue-500 text-lg">⏳</div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{total - completed}</p>
          <p className="text-[10px] text-gray-400">Pending</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-orange-500 text-lg">🔥</div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{streak}</p>
          <p className="text-[10px] text-gray-400">Streak</p>
        </div>
        <div className="text-center min-w-[60px]">
          <div className="text-purple-500 text-lg">🏆</div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{rate}%</p>
          <p className="text-[10px] text-gray-400">Rate</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(rate, 100)}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
        />
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Zap size={14} className="text-yellow-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {rate === 100 ? '🎉 Perfect!' : rate >= 75 ? '🔥 Amazing!' : rate >= 50 ? '💪 Keep going!' : rate >= 25 ? '📈 On track!' : '🚀 Start now!'}
        </span>
      </div>
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
          <button 
            onClick={() => onToggle(sub.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500'}`}
          >
            {sub.completed && <Check size={12} className="text-white" />}
          </button>
          <span className={`text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
            {sub.title}
          </span>
          <button onClick={() => onDelete(sub.id)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add subtask..."
          className="text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="text-blue-500 hover:text-blue-600">
          <Plus size={16} />
        </button>
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
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {isBreak ? '☕ Break' : '🎯 Focus'}
      </h3>
      <div className="text-4xl font-bold text-gray-800 dark:text-white">
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
      <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors">
        <X size={28} />
      </button>
      <h2 className="text-3xl font-bold mb-4">🎯 Focus Mode</h2>
      <p className="text-xl mb-8 text-gray-300">{task?.title || 'Focus on your task'}</p>
      <div className="text-7xl font-bold mb-8 text-blue-400">{formatTime(time)}</div>
      <button onClick={onExit} className="px-8 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors text-white text-lg">
        Exit Focus
      </button>
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
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ◀
        </button>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              <span className={`text-sm ${isTodayDate ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              {dayHolidays.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                  {dayHolidays.length > 1 && (
                    <span className="text-[8px] text-gray-500">+{dayHolidays.length-1}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
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
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">📊 Analytics Dashboard</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm text-gray-500">Completion</p><p className="text-2xl font-bold">{rate}%</p></div>
        <div className="card"><p className="text-sm text-gray-500">Streak</p><p className="text-2xl font-bold">{streak} 🔥</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{total}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold">{total - completed}</p></div>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">📈 Weekly Progress</h3>
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
                  className="w-full max-w-[30px] bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-lg"
                  style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                />
                <span className="text-[10px] text-gray-400 mt-1">{day}</span>
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">📂 Categories</h3>
        {Object.entries(cats).length > 0 ? (
          Object.entries(cats).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm text-gray-600 dark:text-gray-300">{k}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${total > 0 ? (v / total) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{v}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No categories yet</p>
        )}
      </div>
    </div>
  );
}

// ---------- Settings Widget ----------
function SettingsWidget({ darkMode, setDarkMode, exportTasks, importTasks, clearCompleted }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">⚙️ Settings</h2>
      <div className="card space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-yellow-500" />}
            <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <button onClick={exportTasks} className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"><Download size={18} /> Export Tasks</span>
          <span className="text-xs text-gray-400">JSON</span>
        </button>
        <label className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"><Upload size={18} /> Import Tasks</span>
          <input type="file" accept=".json" onChange={importTasks} className="hidden" />
        </label>
        <button onClick={clearCompleted} className="w-full flex items-center justify-between py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><Trash2 size={18} /> Clear Completed</span>
          <span className="text-xs text-red-400">Permanent</span>
        </button>
        <button onClick={() => { if (window.confirm('⚠️ Delete all tasks permanently?')) { localStorage.removeItem('tasks'); window.location.reload(); } }} className="w-full flex items-center justify-between py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><RefreshCw size={18} /> Reset All Data</span>
          <span className="text-xs text-red-400">⚠️ Warning</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState('home');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [focusTask, setFocusTask] = useState(null);
  const [showPomodoro, setShowPomodoro] = useState(false);

  const { text, isListening, startListening, error: voiceError } = useSpeechRecognition();

  // ---------- Holidays State ----------
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

  // ---------- Effects ----------
  useEffect(() => {
    if (text && text.length > 2) {
      handleAddTask(text);
      setInput('');
    }
  }, [text]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (voiceError) toast.error(voiceError);
  }, [voiceError]);

  // ---------- AI Categorization ----------
  const categorizeTask = useCallback(async (taskText) => {
    try { 
      return await categorizeWithAI(taskText); 
    } catch { 
      return { name: 'Personal', color: 'yellow', emoji: '😊', priority: 'low' }; 
    }
  }, []);

  // ---------- Helpers ----------
  const determinePriority = (text) => {
    if (/(urgent|asap|important|critical|immediate)/i.test(text)) return 'high';
    if (/(low priority|someday|maybe|whenever)/i.test(text)) return 'low';
    return 'medium';
  };

  const extractDueDate = (text) => {
    const now = new Date();
    if (/today/i.test(text)) return new Date(now.setHours(23, 59, 59, 999));
    if (/tomorrow/i.test(text)) return new Date(now.setDate(now.getDate() + 1));
    const match = text.match(/\d{1,2}\/\d{1,2}/);
    if (match) {
      const [m, d] = match[0].split('/');
      return new Date(now.getFullYear(), parseInt(m) - 1, parseInt(d));
    }
    return null;
  };

  // ---------- CRUD ----------
  const handleAddTask = useCallback(async (taskText = input) => {
    if (!taskText.trim()) { 
      toast.error('Please enter a task'); 
      return; 
    }
    const category = await categorizeTask(taskText);
    const newTask = {
      id: Date.now(),
      title: taskText.trim(),
      completed: false,
      category: category,
      priority: determinePriority(taskText),
      dueDate: extractDueDate(taskText),
      createdAt: new Date(),
      completedAt: null,
      tags: (taskText.match(/#\w+/g) || []).map(tag => tag.slice(1)),
      subtasks: [],
      recurring: null,
      notes: '',
    };
    setTasks(prev => [newTask, ...prev]);
    setInput('');
    toast.success('Task added! 🎯');
  }, [input, setTasks, categorizeTask]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null 
      } : task
    ));
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

  // ---------- Subtask Functions ----------
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
        return {
          ...task,
          subtasks: task.subtasks?.map(sub => 
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          )
        };
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

  // ---------- Recurring Functions ----------
  const setRecurring = (taskId, type, interval = 1) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, recurring: { type, interval, nextOccurrence: null } };
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
      if (tasks.some(t => 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === d.toDateString()
      )) {
        s++;
      } else break;
    }
    return s;
  })();

  // ---------- Render Home ----------
  const renderHome = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsWidget completed={completed} total={total} streak={streak} />
        <div className="space-y-4">
          <LiveClock countryCode={selectedCountry} />
          <PomodoroTimer />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-3 pr-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={startListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Mic size={18} />
            </button>
            <button
              onClick={() => handleAddTask()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
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
                          className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <p className={`font-medium ${
                          task.completed 
                            ? 'line-through text-gray-400 dark:text-gray-500' 
                            : 'text-gray-800 dark:text-white'
                        }`}>
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
                          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
                      {/* Subtask Progress */}
                      {task.subtasks?.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <ListChecks size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
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
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {/* Focus Mode Button */}
                      <button
                        onClick={() => setFocusTask(task)}
                        className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        title="Focus Mode"
                      >
                        <Target size={16} className="text-purple-400 hover:text-purple-600" />
                      </button>
                      {/* Recurring Button */}
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
                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingId(editingId === task.id ? null : task.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 size={16} className="text-gray-400" />
                      </button>
                      {/* Delete Button */}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Focus Mode Overlay */}
      {focusTask && (
        <FocusMode 
          task={focusTask} 
          onExit={() => setFocusTask(null)} 
        />
      )}
      
      <header className="sticky top-0 z-10 glass border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                📋 Smart To-Do
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Pro</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {completed}/{total} tasks • {streak} day streak 🔥
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={exportTasks} 
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Download size={20} />
              </button>
              <label className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <Upload size={20} />
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
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                exportTasks={exportTasks} 
                importTasks={importTasks} 
                clearCompleted={clearCompleted} 
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