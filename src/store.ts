
export interface WorkoutRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: string;
  duration: number;
  notes: string;
  source?: 'plan';
}

export interface PlannedExercise {
  name: string;
  duration: number;
}

// 1 = Monday, 7 = Sunday.
export interface WorkoutPlan {
  dayOfWeek: number; 
  exercises: PlannedExercise[];
}

export interface AppState {
  weeklyGoal: number;
  workoutPlans: WorkoutPlan[];
  records: WorkoutRecord[];
  exerciseTypes: string[];
}

export function getDefaultDuration(name: string): number {
  if (name === '骑行') return 30;
  if (name === '平板支撑') return 5;
  return 10;
}

export function isValidDuration(duration: number): boolean {
  return Number.isFinite(duration) && Number.isInteger(duration) && duration > 0;
}

const defaultPlans: WorkoutPlan[] = [
  { dayOfWeek: 1, exercises: ['骑行', '平板支撑', '俯卧撑'].map(createPlannedExercise) },
  { dayOfWeek: 3, exercises: ['骑行', '平板支撑', '深蹲'].map(createPlannedExercise) },
  { dayOfWeek: 5, exercises: ['骑行', '平板支撑', '肩部训练'].map(createPlannedExercise) },
];

function createPlannedExercise(name: string): PlannedExercise {
  return { name, duration: getDefaultDuration(name) };
}

// Upgrade existing string-only plans without changing their records or other settings.
export function normalizePlans(plans: (Omit<WorkoutPlan, 'exercises'> & {
  exercises: (string | PlannedExercise)[];
})[]): WorkoutPlan[] {
  return plans.map(plan => ({
    ...plan,
    exercises: plan.exercises.map(exercise => {
      if (typeof exercise === 'string') return createPlannedExercise(exercise);
      return {
        ...exercise,
        duration: isValidDuration(exercise.duration) ? exercise.duration : getDefaultDuration(exercise.name),
      };
    }),
  }));
}

export function setPlanCompletion(
  state: AppState,
  date: string,
  exercise: PlannedExercise,
  completed: boolean,
): AppState {
  const matches = (record: WorkoutRecord) => record.date === date && record.type === exercise.name;
  if (!completed) {
    return { ...state, records: state.records.filter(record => !matches(record)) };
  }
  if (!isValidDuration(exercise.duration) || state.records.some(matches)) return state;
  return {
    ...state,
    records: [...state.records, {
      id: crypto.randomUUID(),
      date,
      type: exercise.name,
      duration: exercise.duration,
      notes: '',
      source: 'plan',
    }],
  };
}

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
      return {
        ...defaultState,
        ...parsed,
        workoutPlans: normalizePlans(parsed.workoutPlans ?? defaultPlans),
      };
    } catch (e) {
      return defaultState;
    }
  }
  return defaultState;
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
