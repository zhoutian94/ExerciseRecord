import { useState } from 'react';
import { useAppContext } from '../context';
import { X, Plus, Save } from 'lucide-react';
import { WorkoutPlan } from '../store';

const dayNames: Record<number, string> = {
  1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
};

export function Settings() {
  const { state, updateGoal, updatePlans } = useAppContext();
  
  const [goal, setGoal] = useState(state.weeklyGoal.toString());
  const [plans, setPlans] = useState<WorkoutPlan[]>(JSON.parse(JSON.stringify(state.workoutPlans)));

  const handleSaveGoal = () => {
    const val = Number(goal);
    if (!isNaN(val) && val > 0) {
      updateGoal(val);
      alert('已更新本周锻炼目标');
    }
  };

  const handleAddPlan = () => {
    // find next available day
    const usedDays = plans.map(p => p.dayOfWeek);
    const available = [1,2,3,4,5,6,7].find(d => !usedDays.includes(d));
    if (available) {
      setPlans([...plans, { dayOfWeek: available, exercises: [] }]);
    } else {
      alert('所有天都已设置训练计划');
    }
  };

  const handleRemovePlan = (dayOfWeek: number) => {
    setPlans(plans.filter(p => p.dayOfWeek !== dayOfWeek));
  };

  const handleUpdatePlanDay = (oldDay: number, newDayString: string) => {
    const newDay = Number(newDayString);
    if (oldDay === newDay) return;
    if (plans.some(p => p.dayOfWeek === newDay)) {
      alert('该日已存在训练计划');
      return;
    }
    setPlans(plans.map(p => p.dayOfWeek === oldDay ? { ...p, dayOfWeek: newDay } : p));
  };

  const handleAddExercise = (dayOfWeek: number) => {
    const ex = prompt('请输入训练项目名称：');
    if (ex && ex.trim()) {
      setPlans(plans.map(p => {
        if (p.dayOfWeek === dayOfWeek) {
          if (p.exercises.includes(ex.trim())) return p; // prevent dup
          return { ...p, exercises: [...p.exercises, ex.trim()] };
        }
        return p;
      }));
    }
  };

  const handleRemoveExercise = (dayOfWeek: number, ex: string) => {
    setPlans(plans.map(p => p.dayOfWeek === dayOfWeek ? { ...p, exercises: p.exercises.filter(e => e !== ex) } : p));
  };

  const handleSavePlans = () => {
    updatePlans(plans);
    alert('已更新训练计划');
  };

  return (
    <div className="space-y-6 mt-2">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span>每周锻炼总目标 (分钟)</span>
        </h2>
        <div className="flex gap-3 relative">
          <input 
            type="number"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white text-lg font-bold"
          />
          <button 
            onClick={handleSaveGoal}
            className="bg-gray-900 text-white px-5 rounded-xl font-bold hover:bg-gray-800 whitespace-nowrap active:scale-95 transition-transform"
          >
            保存目标
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-gray-800">每周训练计划</h2>
          <button onClick={handleAddPlan} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:bg-blue-100">
            <Plus size={14} /> 添加天数
          </button>
        </div>

        <div className="space-y-5">
          {plans.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(plan => (
            <div key={plan.dayOfWeek} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
              <div className="flex justify-between items-center mb-3">
                <select 
                  value={plan.dayOfWeek}
                  onChange={(e) => handleUpdatePlanDay(plan.dayOfWeek, e.target.value)}
                  className="bg-transparent font-bold text-gray-900 outline-none text-base border-b border-dashed border-gray-300 pb-0.5"
                >
                  {[1,2,3,4,5,6,7].map(d => (
                    <option key={d} value={d}>{dayNames[d]}</option>
                  ))}
                </select>
                <button onClick={() => handleRemovePlan(plan.dayOfWeek)} className="text-gray-400 hover:text-red-500">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {plan.exercises.map(ex => (
                  <div key={ex} className="bg-white border border-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1 shadow-sm">
                    {ex}
                    <button onClick={() => handleRemoveExercise(plan.dayOfWeek, ex)} className="text-gray-400 hover:text-red-500 ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleAddExercise(plan.dayOfWeek)}
                  className="bg-white border border-dashed border-gray-300 text-gray-500 rounded-full px-3 py-1 text-sm flex items-center shadow-sm hover:border-gray-400 hover:text-gray-700"
                >
                  <Plus size={14} className="mr-1"/> 添加项目
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && <div className="text-center text-gray-400 py-4 text-sm">无训练计划</div>}
        </div>
        
        <button 
          onClick={handleSavePlans}
          className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold text-base mt-5 active:bg-blue-700 shadow-sm flex items-center justify-center gap-2"
        >
          <Save size={18} />
          保存训练计划
        </button>
      </div>
    </div>
  );
}
