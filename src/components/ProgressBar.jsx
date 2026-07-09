import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
      />
    </div>
  );
}