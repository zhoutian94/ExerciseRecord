import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test, beforeEach } from 'node:test';
import ts from 'typescript';

// Compile the TypeScript store in memory using the project's existing compiler.
const source = readFileSync(new URL('../src/store.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getInitialState, saveState, normalizePlans, isValidDuration, setPlanCompletion } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
});

test('existing string plans gain defaults without losing records or settings', () => {
  const record = { id: 'legacy', date: '2026-10-19', type: '骑行', duration: 42, notes: '旧记录' };
  storage.set('exercise-record-data', JSON.stringify({
    weeklyGoal: 200,
    workoutPlans: [{ dayOfWeek: 7, exercises: ['骑行', '平板支撑', '自定义项目'] }],
    records: [record],
    exerciseTypes: ['骑行', '自定义项目'],
  }));
  const state = getInitialState();
  assert.deepEqual(state.workoutPlans, [{ dayOfWeek: 7, exercises: [
    { name: '骑行', duration: 30 }, { name: '平板支撑', duration: 5 }, { name: '自定义项目', duration: 10 },
  ] }]);
  assert.equal(state.weeklyGoal, 200);
  assert.deepEqual(state.records, [record]);
  assert.deepEqual(state.exerciseTypes, ['骑行', '自定义项目']);
});

test('stored custom durations survive save and reload; invalid defaults are repaired', () => {
  const state = structuredClone(getInitialState());
  state.workoutPlans[0].exercises[0] = { name: '骑行', duration: 47 };
  saveState(state);
  assert.equal(getInitialState().workoutPlans[0].exercises[0].duration, 47);
  const plans = normalizePlans([{ dayOfWeek: 1, exercises: [
    { name: '骑行', duration: 0 }, { name: '平板支撑', duration: -2 }, { name: '深蹲', duration: 15 },
  ] }]);
  assert.deepEqual(plans[0].exercises.map(ex => ex.duration), [30, 5, 15]);
});

test('checking a plan uses its date and duration, persists, and counts only once', () => {
  const state = getInitialState();
  const exercise = { name: '骑行', duration: 47 };
  const checked = setPlanCompletion(state, '2026-10-19', exercise, true);
  const checkedAgain = setPlanCompletion(checked, '2026-10-19', exercise, true);
  assert.equal(state.records.length, 0);
  assert.equal(checkedAgain.records.length, 1);
  assert.equal(checkedAgain.records[0].date, '2026-10-19');
  assert.equal(checkedAgain.records[0].duration, 47);
  assert.equal(checkedAgain.records[0].source, 'plan');
  saveState(checkedAgain);
  assert.deepEqual(getInitialState().records, checkedAgain.records);
});

test('unchecking removes the matching completion, leaves other days and exercises intact', () => {
  let state = getInitialState();
  const exercise = { name: '骑行', duration: 30 };
  state = setPlanCompletion(state, '2026-10-19', exercise, true);
  state = setPlanCompletion(state, '2026-10-21', exercise, true);
  state = setPlanCompletion(state, '2026-10-19', { name: '深蹲', duration: 10 }, true);
  const unchecked = setPlanCompletion(state, '2026-10-19', exercise, false);
  assert.deepEqual(unchecked.records.map(record => [record.date, record.type]), [
    ['2026-10-21', '骑行'], ['2026-10-19', '深蹲'],
  ]);
  assert.equal(unchecked.records.reduce((sum, record) => sum + record.duration, 0), 40);
  const checkedAgain = setPlanCompletion(unchecked, '2026-10-19', { name: '骑行', duration: 40 }, true);
  assert.equal(checkedAgain.records.at(-1).duration, 40);
});

test('existing manual and repeated records already complete an exercise without duplicates', () => {
  const state = { ...getInitialState(), records: [
    { id: 'manual-1', date: '2026-10-19', type: '骑行', duration: 20, notes: '早' },
    { id: 'manual-2', date: '2026-10-19', type: '骑行', duration: 15, notes: '晚' },
  ] };
  const checked = setPlanCompletion(state, '2026-10-19', { name: '骑行', duration: 30 }, true);
  assert.equal(checked, state);
  assert.equal(checked.records.reduce((sum, record) => sum + record.duration, 0), 35);
  const unchecked = setPlanCompletion(checked, '2026-10-19', { name: '骑行', duration: 30 }, false);
  assert.equal(unchecked.records.length, 0);
});

test('duration edits do not rewrite past records or defaults on other days', () => {
  let state = getInitialState();
  state = setPlanCompletion(state, '2026-10-19', state.workoutPlans[0].exercises[0], true);
  state = { ...state, workoutPlans: state.workoutPlans.map(plan => plan.dayOfWeek === 1 ? {
    ...plan, exercises: plan.exercises.map(ex => ex.name === '骑行' ? { ...ex, duration: 45 } : ex),
  } : plan) };
  assert.equal(state.records[0].duration, 30);
  assert.equal(state.workoutPlans.find(plan => plan.dayOfWeek === 3).exercises[0].duration, 30);
  saveState(state);
  assert.equal(getInitialState().workoutPlans[0].exercises[0].duration, 45);
});

test('empty, negative, fractional and non-finite durations cannot create records', () => {
  const state = getInitialState();
  for (const duration of [0, -1, 1.5, NaN, Infinity]) {
    assert.equal(isValidDuration(duration), false);
    assert.equal(setPlanCompletion(state, '2026-10-19', { name: '骑行', duration }, true), state);
  }
  assert.equal(isValidDuration(1), true);
});

test('invalid saved JSON falls back to defaults and empty plans stay empty', () => {
  storage.set('exercise-record-data', '{invalid');
  assert.equal(getInitialState().workoutPlans.length, 3);
  storage.set('exercise-record-data', JSON.stringify({ workoutPlans: [] }));
  assert.deepEqual(getInitialState().workoutPlans, []);
});
