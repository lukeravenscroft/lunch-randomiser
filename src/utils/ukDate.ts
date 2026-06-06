const UK_TIMEZONE = 'Europe/London';

export function getUkDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: UK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
