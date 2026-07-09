import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flame, Clock, Award, Zap } from 'lucide-react';

export default function LiveStats({ tasks, completed, total, streak }) {
  const [animatedCompletion, setAnimatedCompletion] = useState(0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    const duration = 800;
    const steps = 40;
    const increment = completionRate / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= completionRate) {
        setAnimatedCompletion(completionRate);
        clearInterval(interval);
      } else {
        setAnimatedCompletion(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [completionRate]);

  const getMotivation = () => {
    if (completionRate === 100) return '🎉 Perfect! All done!';
    if (completionRate >= 75) return '🔥 Amazing!';
    if (completionRate >= 50) return '💪 Keep going!';
    if (completionRate >= 25) return '📈 On track!';
    return '🚀 Start now!';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <CheckCircle size={18} className="mx-auto text-green-500" />
          <p className="text-lg font-bold text-gray-800 dark:text-white">{completed}</p>
          <p className="text-[10px] text-gray-400">Done</p>
        </div>
        <div className="text-center">
          <Clock size={18} className="mx-auto text-blue-500" />
          <p className="text-lg font-bold text-gray-800 dark:text-white">{total - completed}</p>
          <p className="text-[10px] text-gray-400">Pending</p>
        </div>
        <div className="text-center">
          <Flame size={18} className="mx-auto text-orange-500" />
          <p className="text-lg font-bold text-gray-800 dark:text-white">{streak}</p>
          <p className="text-[10px] text-gray-400">Streak</p>
        </div>
        <div className="text-center">
          <Award size={18} className="mx-auto text-purple-500" />
          <p className="text-lg font-bold text-gray-800 dark:text-white">{animatedCompletion}%</p>
          <p className="text-[10px] text-gray-400">Rate</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Zap size={14} className="text-yellow-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{getMotivation()}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
        />
      </div>
    </div>
  );
}