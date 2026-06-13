import { drug } from '@prisma/client';

export function getWeeklyChartData(records: drug[]) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartMap = new Map(weekDays.map(day => [day, 0]));

  for (const record of records) {
    const date = new Date(record.created_at || new Date());
    const day = weekDays[date.getDay()]; // getDay() returns 0-6 (Sun-Sat)
    chartMap.set(day, (chartMap.get(day) || 0) + 1);
  }

  const chartData = weekDays.map(day => ({
    name: day,
    records: chartMap.get(day) || 0
  }));

  return chartData;
}
