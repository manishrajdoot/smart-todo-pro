import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Globe } from 'lucide-react';

export default function LiveClock({ countryCode = 'US' }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const day = time.toLocaleDateString('en-US', { weekday: 'long' });
  const date = time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{countryCode}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={12} />
          <span>{day}</span>
        </div>
      </div>
      <div className="flex items-center justify-center mt-2">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner border border-gray-200 dark:border-gray-600">
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const radius = 38;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              const isMain = i % 3 === 0;
              return (
                <div
                  key={i}
                  className="absolute text-xs font-bold text-gray-400 dark:text-gray-500"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: isMain ? '12px' : '8px',
                  }}
                >
                  {i === 0 ? '12' : i}
                </div>
              );
            })}
          </div>
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-7 bg-gray-800 dark:bg-gray-200 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`, transformOrigin: 'bottom center' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-0.5 h-9 bg-blue-500 dark:bg-blue-400 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`, transformOrigin: 'bottom center' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-red-500 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`, transformOrigin: 'bottom center' }}
          />
          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white dark:border-gray-800" />
        </div>
        <div className="ml-4 text-center">
          <motion.p
            key={time.getTime()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tabular-nums bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.p>
          <p className="text-xs text-gray-400 mt-1">{date}</p>
        </div>
      </div>
    </div>
  );
}