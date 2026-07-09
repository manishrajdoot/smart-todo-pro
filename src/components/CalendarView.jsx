import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isToday, getYear 
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Country list (ISO 3166-1 alpha-2 codes with names)
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'RU', name: 'Russia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
];

export default function CalendarView({ tasks, selectedDate, setSelectedDate, selectedCountry, setSelectedCountry }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const year = getYear(selectedDate);
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch holidays when country or year changes
  useEffect(() => {
    const fetchHolidays = async () => {
      if (!selectedCountry) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/${selectedCountry}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            // No data for this country/year
            setHolidays([]);
            return;
          }
          throw new Error('Failed to fetch holidays');
        }
        const data = await response.json();
        setHolidays(data);
      } catch (error) {
        console.error('Holiday fetch error:', error);
        toast.error('Could not load holidays');
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [selectedCountry, year]);

  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const getTasksForDay = (day) => {
    return tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
  };

  const getHolidaysForDay = (day) => {
    return holidays.filter(h => isSameDay(new Date(h.date), day));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      {/* Country Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country:</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {loading && <Loader2 size={18} className="animate-spin text-blue-500" />}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const dayHolidays = getHolidaysForDay(day);
          const isTodayDate = isToday(day);
          const hasHoliday = dayHolidays.length > 0;

          return (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all relative ${
                isTodayDate ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${hasHoliday ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (hasHoliday) {
                  // Show first holiday details (or you can show a list)
                  setSelectedHoliday(dayHolidays[0]);
                } else if (dayTasks.length > 0) {
                  // Optionally show tasks
                  toast(dayTasks.map(t => t.title).join('\n'), { duration: 3000 });
                }
              }}
            >
              <span className={`text-sm ${isTodayDate ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              {hasHoliday && (
                <div className="flex gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                  {dayHolidays.length > 1 && (
                    <span className="text-[8px] text-gray-500">+{dayHolidays.length-1}</span>
                  )}
                </div>
              )}
              {dayTasks.length > 0 && !hasHoliday && (
                <div className="flex gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                  {dayTasks.length > 1 && (
                    <span className="text-[8px] text-gray-500">+{dayTasks.length-1}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Holiday Details Modal */}
      <AnimatePresence>
        {selectedHoliday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedHoliday(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  🗓️ {selectedHoliday.name}
                </h3>
                <button onClick={() => setSelectedHoliday(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-medium">Date:</span> {format(new Date(selectedHoliday.date), 'EEEE, MMMM d, yyyy')}</p>
                {selectedHoliday.localName && <p><span className="font-medium">Local Name:</span> {selectedHoliday.localName}</p>}
                <p><span className="font-medium">Type:</span> {selectedHoliday.types?.join(', ') || 'Public'}</p>
                {selectedHoliday.countryCode && <p><span className="font-medium">Country:</span> {selectedHoliday.countryCode}</p>}
                {selectedHoliday.fixed && <p><span className="font-medium">Fixed Date:</span> {selectedHoliday.fixed ? 'Yes' : 'No'}</p>}
                {selectedHoliday.global && <p><span className="font-medium">Global:</span> {selectedHoliday.global ? 'Yes' : 'No'}</p>}
              </div>
              <button
                onClick={() => setSelectedHoliday(null)}
                className="mt-4 w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}