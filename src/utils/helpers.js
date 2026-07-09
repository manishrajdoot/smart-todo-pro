export const getPriorityColor = (priority) => {
  const colors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };
  return colors[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
};

export const getCategoryColor = (category) => {
  const colors = {
    'Work': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Personal': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Shopping': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Health': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Education': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

export const formatDate = (date) => {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};