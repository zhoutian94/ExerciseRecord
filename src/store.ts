
export interface WorkoutRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: string;
  duration: number;
  notes: string;
}

// 1 = Monday, 7 = Sunday for easier display, or just use 0-6 where 0 is Sunday, 1 is Monday.
// Let's use date-fns standard: JavaScript Date uses 0 for Sunday, 1 for Monday.
export interface WorkoutPlan {
  dayOfWeek: number; 
  exercises: string[];
}

export interface AppState {
  weeklyGoal: number;
  workoutPlans: WorkoutPlan[];
  records: WorkoutRecord[];
  exerciseTypes: string[];
}

const defaultPlans: WorkoutPlan[] = [
  { dayOfWeek: 1, exercises: ['骑行', '平板支撑', '俯卧撑'] },
  { dayOfWeek: 3, exercises: ['骑行', '平板支撑', '深蹲'] },
  { dayOfWeek: 5, exercises: ['骑行', '平板支撑', '肩部训练'] },
];

const defaultTypes = ['骑行', '平板支撑', '俯卧撑', '深蹲', '肩部训练', '其他'];

const defaultState: AppState = {
  weeklyGoal: 150,
  workoutPlans: defaultPlans,
  records: [],
  exerciseTypes: defaultTypes,
};

const STORAGE_KEY = 'exercise-record-data';

export function getInitialState(): AppState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure missing exerciseTypes default is populated for older saves if needed
      return { ...defaultState, ...parsed };
    } catch (e) {
      return defaultState;
    }
  }
  return defaultState;
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
