import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2, X, ChevronDown } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

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
  { code: 'AE', name: 'UAE' },
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

export default function CountryHolidays({ selectedCountry, setSelectedCountry }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!selectedCountry) return;
    fetchHolidays();
  }, [selectedCountry, year]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${selectedCountry}`);
      if (!res.ok) {
        if (res.status === 404) { setHolidays([]); return; }
        throw new Error('Failed');
      }
      const data = await res.json();
      setHolidays(data || []);
    } catch (err) {
      console.error(err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmoji = (name) => {
    const map = {
      'New Year': '🎉', 'Christmas': '🎄', 'Easter': '🐰', 'Independence': '🗽',
      'Republic': '🇮🇳', 'Thanksgiving': '🦃', 'Halloween': '🎃', 'Valentine': '💝',
      'Labor': '👷', 'Memorial': '🕊️', 'Veterans': '🎖️', 'Diwali': '🪔',
      'Holi': '🎨', 'Eid': '🕌', 'Hanukkah': '🕎'
    };
    for (const [key, emoji] of Object.entries(map)) {
      if (name.toLowerCase().includes(key.toLowerCase())) return emoji;
    }
    return '📅';
  };

  const upcoming = holidays
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-blue-500" />
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
        >
          {[2024,2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {loading && <Loader2 size={18} className="animate-spin text-blue-500" />}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">📅 Upcoming Holidays</h4>
          <div className="space-y-1.5">
            {upcoming.map((h, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHoliday(h)}
                className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEmoji(h.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{h.name}</p>
                    <p className="text-xs text-gray-400">{format(new Date(h.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {h.types?.[0] || 'Public'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
        {holidays.length} holidays in {year} {holidays.length === 0 && '— No data'}
      </div>

      <AnimatePresence>
        {selectedHoliday && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedHoliday(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getEmoji(selectedHoliday.name)}</span>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{selectedHoliday.name}</h3>
                </div>
                <button onClick={() => setSelectedHoliday(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-medium">📅 Date:</span> {format(new Date(selectedHoliday.date), 'EEEE, MMMM d, yyyy')}</p>
                {selectedHoliday.localName && <p><span className="font-medium">🏷️ Local:</span> {selectedHoliday.localName}</p>}
                <p><span className="font-medium">📌 Type:</span> {selectedHoliday.types?.join(', ') || 'Public'}</p>
                <p><span className="font-medium">🌍 Country:</span> {selectedHoliday.countryCode}</p>
                <p><span className="font-medium">📅 Fixed:</span> {selectedHoliday.fixed ? 'Yes' : 'No'}</p>
              </div>
              <button onClick={() => setSelectedHoliday(null)} className="mt-4 w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}