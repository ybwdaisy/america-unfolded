// Year selections are year-end views; event links retain their exact source dates.
export const TIMELINE_END = '1959-08-21';
export const YEAR_INTERVAL = 900;
export const REDUCED_YEAR_INTERVAL = 1500;
export function dateForYear(value) {
  const year = Math.max(1776, Math.min(1959, Math.round(Number(value))));
  if (!Number.isFinite(year)) return null;
  return year === 1959 ? TIMELINE_END : `${year}-12-31`;
}
export function nextYearDate(date) {
  if (date >= TIMELINE_END) return null;
  return dateForYear(Number(date.slice(0, 4)) + 1);
}
