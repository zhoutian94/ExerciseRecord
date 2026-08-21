import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { formatToDateString } from '../utils/date';

export function RecordPage() {
  const { state, addRecord } = useAppContext();
  const navigate = useNavigate();

  const [dateStr, setDateStr] = useState(formatToDateString(new Date()));
  const [type, setType] = useState(state.exerciseTypes[0] || '其他');
  const [duration, setDuration] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleQuickAdd = (mins: number) => {
    setDuration(prev => (typeof prev === 'number' ? prev + mins : mins));
  };

  const handleSave = () => {
    if (!duration || Number(duration) <= 0) {
      alert('请输入有效的锻炼时长');
      return;
    }
    
    addRecord({
      date: dateStr,
      type,
      duration: Number(duration),
      notes
    });
    
    navigate('/');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 mt-2">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">日期</label>
        <input 
          type="date" 
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">锻炼类型</label>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none"
        >
          {state.exerciseTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">锻炼时长 (分钟)</label>
        <input 
          type="number" 
          value={duration}
          onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
          placeholder="0"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white text-xl font-bold bg-transparent"
        />
        <div className="flex gap-2 mt-3">
          {[10, 30, 50, 60].map(m => (
            <button 
              key={m}
              onClick={() => handleQuickAdd(m)}
              className="flex-1 bg-blue-50 text-blue-600 rounded-lg py-2 text-sm font-bold active:bg-blue-100 transition-colors"
            >
              +{m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">备注 (可选)</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例如：今天状态不错..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white min-h-[80px]"
        />
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg active:bg-blue-700 hover:bg-blue-700 transition-colors shadow-sm mt-4"
      >
        完成锻炼
      </button>
    </div>
  );
}
