import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, getInitialState, saveState, WorkoutRecord, WorkoutPlan } from './store';

interface AppContextType {
  state: AppState;
  addRecord: (record: Omit<WorkoutRecord, 'id'>) => void;
  updateRecord: (id: string, record: Partial<WorkoutRecord>) => void;
  deleteRecord: (id: string) => void;
  updateGoal: (goal: number) => void;
  updatePlans: (plans: WorkoutPlan[]) => void;
  updateExerciseTypes: (types: string[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addRecord = (record: Omit<WorkoutRecord, 'id'>) => {
    setState((prev) => ({
      ...prev,
      records: [...prev.records, { ...record, id: Date.now().toString() }],
    }));
  };

  const updateRecord = (id: string, recordUpdate: Partial<WorkoutRecord>) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((r) => (r.id === id ? { ...r, ...recordUpdate } : r)),
    }));
  };

  const deleteRecord = (id: string) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.filter((r) => r.id !== id),
    }));
  };

  const updateGoal = (goal: number) => {
    setState((prev) => ({ ...prev, weeklyGoal: goal }));
  };

  const updatePlans = (plans: WorkoutPlan[]) => {
    setState((prev) => ({ ...prev, workoutPlans: plans }));
  };

  const updateExerciseTypes = (types: string[]) => {
    setState((prev) => ({ ...prev, exerciseTypes: types }));
  };

  return (
    <AppContext.Provider value={{ state, addRecord, updateRecord, deleteRecord, updateGoal, updatePlans, updateExerciseTypes }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
