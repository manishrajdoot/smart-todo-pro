import { Check, Plus, X } from 'lucide-react';

export default function SubtaskList({ subtasks, onToggle, onAdd, onDelete }) {
  const [newSubtask, setNewSubtask] = useState('');

  return (
    <div className="ml-6 mt-2 space-y-1">
      {subtasks.map((sub) => (
        <div key={sub.id} className="flex items-center gap-2">
          <button 
            onClick={() => onToggle(sub.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
          >
            {sub.completed && <Check size={12} className="text-white" />}
          </button>
          <span className={`text-sm ${sub.completed ? 'line-through text-gray-400' : ''}`}>
            {sub.title}
          </span>
          <button onClick={() => onDelete(sub.id)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add subtask..."
          className="text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
          onKeyPress={(e) => e.key === 'Enter' && onAdd(newSubtask)}
        />
        <button onClick={() => onAdd(newSubtask)} className="text-blue-500">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}