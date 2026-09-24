import { format, formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';

export const formatDate = (date, pattern = 'dd MMM yyyy, hh:mm a') => {
  if (!date) return '—';
  return format(new Date(date), pattern);
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (date) => {
  if (!date) return false;
  return isPast(new Date(date));
};

export const minutesUntil = (date) => {
  if (!date) return null;
  return differenceInMinutes(new Date(date), new Date());
};

export const formatMinutesToDuration = (totalMinutes) => {
  if (totalMinutes == null) return '—';
  const abs = Math.abs(totalMinutes);
  const days = Math.floor(abs / 1440);
  const hours = Math.floor((abs % 1440) / 60);
  const minutes = Math.round(abs % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes && !days) parts.push(`${minutes}m`);

  return parts.length ? parts.join(' ') : '0m';
};