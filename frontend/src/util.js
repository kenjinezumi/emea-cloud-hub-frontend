import dayjs from 'dayjs';

export function getMonth(month = dayjs().month()) {
  month = Math.floor(month);
  const year = dayjs().year();
  const firstDayOfTheMonth = dayjs(new Date(year, month, 1)).day();
  let currentMonthCount = 0 - firstDayOfTheMonth;
  const daysMatrix = new Array(5).fill([]).map(() => {
    return new Array(7).fill(null).map(() => {
      currentMonthCount++;
      return dayjs(new Date(year, month, currentMonthCount));
    });
  });
  return daysMatrix;
}

export function createYearData(year) {
  const yearData = [];

  for (let month = 0; month < 12; month++) {
    let monthStart = dayjs(new Date(year, month, 1));
    let monthEnd = dayjs(new Date(year, month + 1, 0));

    // Find the previous Sunday for month start
    while (monthStart.day() !== 0) {
      monthStart = monthStart.subtract(1, 'day');
    }

    // Find the next Saturday for month end
    while (monthEnd.day() !== 6) {
      monthEnd = monthEnd.add(1, 'day');
    }

    // Generate days for the month
    const monthDays = [];
    let currentDay = monthStart;

    while (currentDay.isBefore(monthEnd) || currentDay.isSame(monthEnd, 'day')) {
      // Make sure currentDay is a dayjs object
      monthDays.push({
        date: dayjs(currentDay), // Wrap it properly in dayjs
        isCurrentMonth: currentDay.month() === month, // True if the day belongs to the current month
        month: month, // Correct month check
      });
      currentDay = currentDay.add(1, 'day');
    }

    // Split into weeks
    const weeks = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7));
    }

    yearData.push(weeks);
  }

  return yearData;
}
