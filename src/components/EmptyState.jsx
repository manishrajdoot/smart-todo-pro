import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ message = "No tasks yet!", subMessage = "Add a task above or try voice input 🎤" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="text-7xl mb-4">🎯</div>
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-1">{message}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">{subMessage}</p>
    </motion.div>
  );
}