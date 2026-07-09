import { addDays, addWeeks, addMonths, isBefore } from 'date-fns';

export function generateNextOccurrence(task) {
  if (!task.recurring) return null;
  
  const nextDate = {
    daily: addDays(new Date(), task.recurring.interval),
    weekly: addWeeks(new Date(), task.recurring.interval),
    monthly: addMonths(new Date(), task.recurring.interval)
  }[task.recurring.type];

  return nextDate;
}