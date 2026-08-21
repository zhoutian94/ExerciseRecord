import { 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  parseISO, 
  format,
  eachDayOfInterval,
  subWeeks
} from 'date-fns';

export function getWeekInterval(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday based
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
}

export function isDateInInterval(dateString: string, interval: { start: Date; end: Date }) {
  const date = parseISO(dateString);
  return isWithinInterval(date, interval);
}

export function formatToDateString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekDays(date: Date = new Date()) {
  const interval = getWeekInterval(date);
  return eachDayOfInterval(interval);
}

export function getPreviousWeekInterval(weeksAgo: number) {
  const date = subWeeks(new Date(), weeksAgo);
  return getWeekInterval(date);
}
