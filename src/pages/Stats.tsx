import { useAppContext } from '../context';
import { getPreviousWeekInterval, isDateInInterval, formatToDateString } from '../utils/date';

export function Stats() {
  const { state } = useAppContext();

  // Helper to process a specific week
  const processWeek = (weeksAgo: number) => {
    const interval = getPreviousWeekInterval(weeksAgo);
    const weekRecords = state.records.filter(r => isDateInInterval(r.date, interval));
    const totalMins = weekRecords.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const isGoalMet = totalMins >= state.weeklyGoal;
    
    // check plans metric
    let planMetCount = 0;
    const planTotalCount = state.workoutPlans.length;
    
    state.workoutPlans.forEach(plan => {
      // Find what dates this plan fell on for `interval` week.
      // Wait, interval.start is Monday.
      const planDate = new Date(interval.start);
      planDate.setDate(planDate.getDate() + (plan.dayOfWeek - 1));
      const planDateStr = formatToDateString(planDate);
      
      const dailyRecords = weekRecords.filter(r => r.date === planDateStr);
      const isPlanMet = plan.exercises.length > 0 && plan.exercises.every(ex => dailyRecords.some(r => r.type === ex.name));
      if (isPlanMet) planMetCount++;
    });

    const isAllPlansMet = planMetCount === planTotalCount && planTotalCount > 0;

    return { totalMins, isGoalMet, planMetCount, planTotalCount, percent: Math.round((totalMins/state.weeklyGoal)*100), isAllPlansMet };
  };

  const currentWeek = processWeek(0);
  const weeksData = [
    { label: '本周', data: currentWeek },
    { label: '上周', data: processWeek(1) },
    { label: '2 周前', data: processWeek(2) },
    { label: '3 周前', data: processWeek(3) },
  ];

  // Cumulative
  const totalMins = state.records.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalCount = state.records.length;

  // Approximate all weeks calculation
  // Find first record date, calculate how many weeks from then till now.
  let cumulativeGoalMet = 0;
  let cumulativePlanMet = 0;
  let totalWeeks = 0;

  if (state.records.length > 0) {
    const sortedDates = [...state.records].map(r => new Date(r.date)).sort((a,b) => a.getTime() - b.getTime());
    const firstDate = sortedDates[0];
    const now = new Date();
    
    // We can evaluate up to 52 past weeks to avoid perf issues
    const weeksDiff = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7))) + 1;
    totalWeeks = Math.min(weeksDiff, 52); 

    for (let i = 0; i < totalWeeks; i++) {
      const wd = processWeek(i);
      if (wd.isGoalMet) cumulativeGoalMet++;
      if (wd.isAllPlansMet) cumulativePlanMet++;
    }
  }

  return (
    <div className="space-y-6 mt-2">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm text-gray-500 font-bold mb-3">最近四周</h2>
        <div className="w-full text-sm">
          <div className="grid grid-cols-4 text-gray-400 font-medium pb-2 border-b border-gray-100 mb-2">
            <div>周</div>
            <div className="text-right">时间</div>
            <div className="text-center">总量</div>
            <div className="text-center">计划</div>
          </div>
          {weeksData.map((row, i) => (
            <div key={i} className="grid grid-cols-4 items-center py-3 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="font-bold text-gray-800">{row.label}</div>
              <div className="text-right text-gray-600">
                <span className={row.data.isGoalMet ? 'text-green-600 font-bold' : ''}>{row.data.totalMins}</span> / {state.weeklyGoal}
              </div>
              <div className="text-center font-medium">
                {row.data.isGoalMet ? <span className="text-green-500 font-bold">✓</span> : `${Math.min(100, row.data.percent)}%`}
              </div>
              <div className="text-center text-gray-600">
                {row.data.planTotalCount === 0 ? '-' : `${row.data.planMetCount} / ${row.data.planTotalCount}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm text-gray-500 font-bold mb-4">累计数据</h2>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">累计锻炼时间</div>
            <div className="text-2xl font-black text-gray-900">{totalMins.toLocaleString()} <span className="text-sm text-gray-500 font-medium">min</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">累计锻炼次数</div>
            <div className="text-2xl font-black text-gray-900">{totalCount} <span className="text-sm text-gray-500 font-medium">次</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">周总量达标</div>
            <div className="text-xl font-bold text-gray-800">{cumulativeGoalMet} <span className="text-sm text-gray-500 font-medium">/ {totalWeeks} 周</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">完整执行计划</div>
            <div className="text-xl font-bold text-gray-800">{cumulativePlanMet} <span className="text-sm text-gray-500 font-medium">/ {totalWeeks} 周</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
