import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flame, Award, Clock } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsDashboard({ tasks, completed, total, streak }) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryStats = tasks.reduce((acc, task) => {
    const name = task.category?.name || 'Personal';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  
  const categoryLabels = Object.keys(categoryStats);
  const categoryData = Object.values(categoryStats);
  const categoryColors = {
    Work: '#3B82F6',
    Personal: '#8B5CF6',
    Shopping: '#22C55E',
    Health: '#EF4444',
    Education: '#EAB308',
  };
  const backgroundColors = categoryLabels.map(label => categoryColors[label] || '#9CA3AF');

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  const getCompletionData = () => {
    const days = getLast7Days();
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const count = tasks.filter(t => 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === date.toDateString()
      ).length;
      return count;
    });
  };

  const barData = {
    labels: getLast7Days(),
    datasets: [{
      label: 'Tasks Completed',
      data: getCompletionData(),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      borderRadius: 5,
    }],
  };

  const pieData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryData,
      backgroundColor: backgroundColors,
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-20">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white">📊 Analytics Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><CheckCircle size={18} className="text-blue-500" /><span className="text-sm">Rate</span></div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{completionRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Flame size={18} className="text-orange-500" /><span className="text-sm">Streak</span></div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{streak} 🔥</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Award size={18} className="text-yellow-500" /><span className="text-sm">Total</span></div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Clock size={18} className="text-red-500" /><span className="text-sm">Pending</span></div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{total - completed}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">📈 Weekly Progress</h3>
          <Bar data={barData} options={barOptions} height={150} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🧩 Category Split</h3>
          {categoryLabels.length > 0 ? <Doughnut data={pieData} options={pieOptions} height={150} /> : <p className="text-center text-gray-400 py-4">No categories yet</p>}
        </div>
      </div>
    </motion.div>
  );
}