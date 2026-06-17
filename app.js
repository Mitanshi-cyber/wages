const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const loginEmployee = document.querySelector("#loginEmployee");
const loginWage = document.querySelector("#loginWage");
const loginDayHours = document.querySelector("#loginDayHours");
const loginMonth = document.querySelector("#loginMonth");

const employeeLabel = document.querySelector("#employeeLabel");
const monthTitle = document.querySelector("#monthTitle");
const activeMonth = document.querySelector("#activeMonth");
const generateBtn = document.querySelector("#generateBtn");
const exportBtn = document.querySelector("#exportBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const hourlyWage = document.querySelector("#hourlyWage");
const dayHours = document.querySelector("#dayHours");
const entryBody = document.querySelector("#entryBody");
const rowTemplate = document.querySelector("#rowTemplate");

const totalMinutes = document.querySelector("#totalMinutes");
const totalHours = document.querySelector("#totalHours");
const totalDays = document.querySelector("#totalDays");
const totalAmount = document.querySelector("#totalAmount");

const dayNames = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

let currentEmployee = "";

const pad = (value) => String(value).padStart(2, "0");

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

function monthLabel(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function storageKey() {
  const cleanEmployee = currentEmployee.trim().toLowerCase().replace(/\s+/g, "-");
  return `salary-calculator:${cleanEmployee}:${activeMonth.value}`;
}

function parseTime(value) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours}:${pad(minutes % 60)}`;
}

function numberValue(input, fallback = 0) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function getDayName(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return dayNames[date.getDay()] || "";
}

function datesForMonth(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    return `${year}-${pad(month)}-${pad(day)}`;
  });
}

function loadSavedEntries() {
  const saved = localStorage.getItem(storageKey());
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveEntries() {
  const entries = {};
  entryBody.querySelectorAll("tr").forEach((row) => {
    const date = row.querySelector(".date").value;
    entries[date] = {
      inTime: row.querySelector(".inTime").value,
      outTime: row.querySelector(".outTime").value,
    };
  });
  localStorage.setItem(storageKey(), JSON.stringify(entries));
}

function calculateRow(row) {
  const inMinutes = parseTime(row.querySelector(".inTime").value);
  const outMinutes = parseTime(row.querySelector(".outTime").value);
  const wage = numberValue(hourlyWage);
  const standardDay = Math.max(numberValue(dayHours, 8.5), 0.01);

  if (inMinutes === null || outMinutes === null) {
    row.querySelector(".duration").value = "";
    row.querySelector(".minutes").value = "";
    row.querySelector(".decimalHours").value = "";
    row.querySelector(".totalDay").value = "";
    row.querySelector(".amount").value = "";
    return { minutes: 0, amount: 0, days: 0 };
  }

  let minutes = outMinutes - inMinutes;
  if (minutes < 0) minutes += 24 * 60;

  const decimalHours = minutes / 60;
  const days = decimalHours / standardDay;
  const amount = decimalHours * wage;

  row.querySelector(".duration").value = formatDuration(minutes);
  row.querySelector(".minutes").value = String(minutes);
  row.querySelector(".decimalHours").value = decimalHours.toFixed(1);
  row.querySelector(".totalDay").value = days.toFixed(2);
  row.querySelector(".amount").value = Math.round(amount).toString();

  return { minutes, amount, days };
}

function recalculate() {
  const totals = [...entryBody.querySelectorAll("tr")].reduce(
    (carry, row) => {
      const result = calculateRow(row);
      carry.minutes += result.minutes;
      carry.amount += result.amount;
      carry.days += result.days;
      return carry;
    },
    { minutes: 0, amount: 0, days: 0 }
  );

  totalMinutes.textContent = totals.minutes.toString();
  totalHours.textContent = formatDuration(totals.minutes);
  totalDays.textContent = totals.days.toFixed(2);
  totalAmount.textContent = Math.round(totals.amount).toString();
  saveEntries();
}

function addDateRow(dateValue, saved = {}) {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector("tr");

  row.querySelector(".date").value = dateValue;
  row.querySelector(".day").value = getDayName(dateValue);
  row.querySelector(".inTime").value = saved.inTime || "";
  row.querySelector(".outTime").value = saved.outTime || "";
  row.addEventListener("input", recalculate);

  entryBody.append(row);
}

function generateMonth() {
  if (!activeMonth.value) return;

  const savedEntries = loadSavedEntries();
  entryBody.replaceChildren();
  datesForMonth(activeMonth.value).forEach((dateValue) => {
    addDateRow(dateValue, savedEntries[dateValue]);
  });
  monthTitle.textContent = monthLabel(activeMonth.value);
  recalculate();
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = [
    "DATE",
    "DAY",
    "IN TIME",
    "OUT TIME",
    "HOURS",
    "TOTAL MIN",
    "TOTAL HOURS",
    "TOTAL DAY",
    "AMOUNT",
  ];

  const rows = [...entryBody.querySelectorAll("tr")].map((row) => [
    row.querySelector(".date").value,
    row.querySelector(".day").value,
    row.querySelector(".inTime").value,
    row.querySelector(".outTime").value,
    row.querySelector(".duration").value,
    row.querySelector(".minutes").value,
    row.querySelector(".decimalHours").value,
    row.querySelector(".totalDay").value,
    row.querySelector(".amount").value,
  ]);

  rows.push([
    "MONTHLY TOTAL",
    "",
    "",
    "",
    "",
    totalMinutes.textContent,
    totalHours.textContent,
    totalDays.textContent,
    totalAmount.textContent,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const employee = currentEmployee.trim().replace(/\s+/g, "-").toLowerCase();
  link.href = url;
  link.download = `${employee}-${activeMonth.value}-salary.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function openApp() {
  currentEmployee = loginEmployee.value.trim();
  employeeLabel.textContent = currentEmployee;
  hourlyWage.value = loginWage.value;
  dayHours.value = loginDayHours.value;
  activeMonth.value = loginMonth.value;
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  generateMonth();
}

loginMonth.value = currentMonthValue();
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openApp();
});

generateBtn.addEventListener("click", generateMonth);
activeMonth.addEventListener("change", generateMonth);
exportBtn.addEventListener("click", exportCsv);
logoutBtn.addEventListener("click", () => {
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});
[hourlyWage, dayHours].forEach((input) => {
  input.addEventListener("input", recalculate);
});
