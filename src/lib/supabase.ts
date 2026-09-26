export type EmployeeProfile = {
  id: string;
  name: string;
  hourlyRate: number;
};

export type DayEntry = {
  inTime: string;
  outDate: string;
  outTime: string;
};

export type HoursMap = Record<string, DayEntry>;

export type SalaryRecord = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  computedWage: number;
  createdAt: string;
};

const STORAGE_KEYS = {
  profiles: 'wageflow-profiles',
  currentUser: 'wageflow-current-user',
  hours: 'wageflow-hours',
  salaryRecords: 'wageflow-salary-records',
};

const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const storage = {
  getProfiles: () => readStorage<EmployeeProfile[]>(STORAGE_KEYS.profiles, []),
  saveProfiles: (profiles: EmployeeProfile[]) => writeStorage(STORAGE_KEYS.profiles, profiles),
  getCurrentUser: () => readStorage<string | null>(STORAGE_KEYS.currentUser, null),
  saveCurrentUser: (id: string | null) => writeStorage(STORAGE_KEYS.currentUser, id),
  getHours: () => readStorage<HoursMap>(STORAGE_KEYS.hours, {}),
  saveHours: (entries: HoursMap) => writeStorage(STORAGE_KEYS.hours, entries),
  getSalaryRecords: () => readStorage<SalaryRecord[]>(STORAGE_KEYS.salaryRecords, []),
  saveSalaryRecords: (records: SalaryRecord[]) => writeStorage(STORAGE_KEYS.salaryRecords, records),
};

export const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
export const standardDayHours = 8.5;

export function pad(value: number | string) {
  return String(value).padStart(2, '0');
}

export function getDayName(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  return dayNames[date.getDay()] || '';
}

export function parseTime(value: string) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return `${hours}:${pad(minutes % 60)}`;
}

export function nextDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function datesForMonth(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    return `${year}-${pad(month)}-${pad(day)}`;
  });
}

export function calculateDayEntry(dateValue: string, entry: DayEntry, hourlyRate: number) {
  const inDate = dateValue;
  const outDate = entry.outDate || inDate;
  const inMinutes = parseTime(entry.inTime);
  const outMinutes = parseTime(entry.outTime);

  if (!inDate || !outDate || inMinutes === null || outMinutes === null) {
    return { minutes: 0, amount: 0, days: 0, duration: '', decimalHours: '', totalDay: '', amountText: '' };
  }

  const start = new Date(`${inDate}T${entry.inTime}:00`);
  const end = new Date(`${outDate}T${entry.outTime}:00`);
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const decimalHours = minutes / 60;
  const days = decimalHours / standardDayHours;
  const amount = decimalHours * hourlyRate;

  return {
    minutes,
    amount,
    days,
    duration: formatDuration(minutes),
    decimalHours: decimalHours.toFixed(1),
    totalDay: days.toFixed(2),
    amountText: Math.round(amount).toString(),
  };
}

export function getMonthTotals(entries: HoursMap, hourlyRate: number) {
  const totals = Object.entries(entries).reduce(
    (carry, [dateValue, entry]) => {
      const result = calculateDayEntry(dateValue, entry, hourlyRate);
      carry.minutes += result.minutes;
      carry.amount += result.amount;
      carry.days += result.days;
      return carry;
    },
    { minutes: 0, amount: 0, days: 0 },
  );

  return {
    minutes: totals.minutes,
    hours: formatDuration(totals.minutes),
    days: totals.days.toFixed(2),
    amount: Math.round(totals.amount).toString(),
  };
}

export function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function makeCsvFromEntries(entries: HoursMap, hourlyRate: number, monthValue: string) {
  const headers = ['DATE', 'DAY', 'IN TIME', 'OUT DATE', 'OUT TIME', 'HOURS', 'TOTAL MIN', 'TOTAL HOURS', 'TOTAL DAY', 'AMOUNT'];
  const rows = datesForMonth(monthValue).map((dateValue) => {
    const entry = entries[dateValue] || { inTime: '', outDate: dateValue, outTime: '' };
    const result = calculateDayEntry(dateValue, entry, hourlyRate);
    return [
      dateValue,
      getDayName(dateValue),
      entry.inTime,
      entry.outDate || dateValue,
      entry.outTime,
      result.duration,
      result.minutes,
      result.decimalHours,
      result.totalDay,
      result.amountText,
    ];
  });

  const totals = getMonthTotals(entries, hourlyRate);
  rows.push(['MONTHLY TOTAL', '', '', '', '', '', totals.minutes, totals.hours, totals.days, totals.amount]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

