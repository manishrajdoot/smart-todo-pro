import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Download, Upload, Trash2, RefreshCw } from 'lucide-react';

export default function Settings({ darkMode, setDarkMode, exportTasks, importTasks, clearCompleted }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">⚙️ Settings</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <button
          onClick={exportTasks}
          className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Download size={18} /> Export Tasks
          </span>
          <span className="text-xs text-gray-400">JSON</span>
        </button>

        <label className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Upload size={18} /> Import Tasks
          </span>
          <input type="file" accept=".json" onChange={importTasks} className="hidden" />
        </label>

        <button
          onClick={clearCompleted}
          className="w-full flex items-center justify-between py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 size={18} /> Clear Completed Tasks
          </span>
          <span className="text-xs text-red-400">Permanent</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Delete all tasks?')) {
              localStorage.removeItem('tasks');
              window.location.reload();
            }
          }}
          className="w-full flex items-center justify-between py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <RefreshCw size={18} /> Reset All Data
          </span>
          <span className="text-xs text-red-400">⚠️ Warning</span>
        </button>
      </div>
    </motion.div>
  );
}