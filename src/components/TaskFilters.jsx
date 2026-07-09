import React from 'react';

export default function TaskFilters({ filter, setFilter, categories }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setFilter('all')}
        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
          filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        All
      </button>
      <button
        onClick={() => setFilter('pending')}
        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
          filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        📋 Pending
      </button>
      <button
        onClick={() => setFilter('completed')}
        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
          filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        ✅ Completed
      </button>
      {categories?.map(cat => (
        <button
          key={cat}
          onClick={() => setFilter(cat)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            filter === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}