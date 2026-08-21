import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { getWeekInterval, isDateInInterval, formatToDateString, getWeekDays } from '../utils/date';
import { CheckCircle2, Circle, Check } from 'lucide-react';
import { getDay } from 'date-fns';

function getCustomDay(date: Date) {
  const d = getDay(date);
  return d === 0 ? 7 : d;
}

export function Home() {
  const { state } = useAppContext();
  const currentWeek = getWeekInterval();
  
  // 1. Calculate week total duration
  const weekRecords = state.records.filter(r => isDateInInterval(r.date, currentWeek));
  const weekTotalMins = weekRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const goal = state.weeklyGoal;
  const progressPercent = Math.min(100, Math.round((weekTotalMins / goal) * 100)) || 0;
  const isGoalMet = weekTotalMins >= goal;

  // 2. Prepare 7 days status
  const weekDays = getWeekDays(new Date());
  
  const dayLetters = ['一', '二', '三', '四', '五', '六', '日'];
  
  const dayStatuses = weekDays.map(date => {
    const cDay = getCustomDay(date);
    const plan = state.workoutPlans.find(p => p.dayOfWeek === cDay);
    const dateStr = formatToDateString(date);
    const dailyRecords = weekRecords.filter(r => r.date === dateStr);
    const exercisedToday = dailyRecords.length > 0;
    
    let statusIcon = <span className="text-gray-300 font-bold">·</span>; // default not planned
    
    if (plan) {
      // Check if all exercises are met
      const hasAllExercises = plan.exercises.every(ex => dailyRecords.some(r => r.type === ex));
      if (hasAllExercises) {
        statusIcon = <Check className="text-green-500 w-4 h-4" />; // ✓
      } else {
        statusIcon = <Circle className="text-gray-400 w-3 h-3" />; // ○
      }
    } else if (exercisedToday) {
      statusIcon = <Check className="text-blue-400 w-3 h-3" />; // Custom indicator for un-planned exercise
    }
    
    return { name: dayLetters[cDay - 1], icon: statusIcon, cDay, dateStr, plan, dailyRecords };
  });

  return (
    <div className="space-y-6">
      {/* Week Progress */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm text-gray-500 font-medium mb-1">本周锻炼</h2>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-black text-gray-900">{weekTotalMins}</span>
          <span className="text-gray-500 mb-1">/ {goal} min</span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden w-full relative">
          <div 
            className={`h-full absolute left-0 top-0 transition-all duration-500 ease-out ${isGoalMet ? 'bg-green-500' : 'bg-blue-600'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">{progressPercent}%</span>
          {isGoalMet && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={16}/> 本周目标已完成</span>}
        </div>
      </div>

      {/* 7 Days Status */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">周状态</h3>
        <div className="flex justify-between items-center px-1">
          {dayStatuses.map((ds, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 w-8">
              <span className="text-xs text-gray-500">{ds.name}</span>
              <div className="h-6 flex items-center justify-center">
                {ds.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Plan Breakdown */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-800 mb-2">训练计划执行</h3>
        {dayStatuses.filter(ds => ds.plan).map(ds => {
          const plan = ds.plan!;
          const isPlanMet = plan.exercises.every(ex => ds.dailyRecords.some(r => r.type === ex));
          return (
            <div key={ds.cDay} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-gray-800">周{ds.name}</span>
                {isPlanMet ? <Check className="text-green-500 w-4 h-4" /> : <Circle className="text-gray-400 w-4 h-4" />}
              </div>
              <ul className="grid grid-cols-1 gap-2 ml-1">
                {plan.exercises.map(ex => {
                  const done = ds.dailyRecords.some(r => r.type === ex);
                  return (
                    <li key={ex} className={`flex items-center gap-2 text-sm ${done ? 'text-gray-400' : 'text-gray-600'}`}>
                      {done ? <CheckCircle2 size={14} className="text-green-500"/> : <Circle size={14} className="text-gray-300"/>}
                      <span className={done ? 'line-through decoration-gray-300' : ''}>{ex}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          );
        })}
        {dayStatuses.filter(ds => ds.plan).length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">本周未设置训练计划</p>
        )}
      </div>

      {/* Quick Record Button */}
      <div className="fixed bottom-20 right-6 z-20">
        <Link to="/record" className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-transform">
          <span className="text-3xl pb-1 leading-none inline-block">+</span>
        </Link>
      </div>
    </div>
  );
}
