export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatDateLabel = (value: string) => {
  if (value === todayISO()) return 'Сегодня';
  if (value === addDays(1)) return 'Завтра';
  if (value === addDays(-1)) return 'Вчера';

  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
};
