const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const loginEmployee = document.querySelector("#loginEmployee");
const loginPassword = document.querySelector("#loginPassword");
const loginMessage = document.querySelector("#loginMessage");

const employeeLabel = document.querySelector("#employeeLabel");
const monthTitle = document.querySelector("#monthTitle");
const activeMonth = document.querySelector("#activeMonth");
const generateBtn = document.querySelector("#generateBtn");
const clearBtn = document.querySelector("#clearBtn");
const exportBtn = document.querySelector("#exportBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const hourlyWage = document.querySelector("#hourlyWage");
const syncStatus = document.querySelector("#syncStatus");
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
let currentEmployeeId = "";
let saveTimer = null;
const defaultSupabaseUrl = "https://hxdrkczpjfburbivrtxp.supabase.co";
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZHJrY3pwamZidXJiaXZydHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTYwMDgsImV4cCI6MjA5NzI5MjAwOH0.XaMS7HgpybQpcpo1pnLSTsWgODxcQqMuTc-hoQA0UXo";
const standardDayHours = 8.5;

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

function supabaseHeaders(prefer = "") {
  const headers = {
    apikey: defaultSupabaseAnonKey,
    Authorization: `Bearer ${defaultSupabaseAnonKey}`,
    "Content-Type": "application/json",
  };

  if (prefer) headers.Prefer = prefer;
  return headers;
}

function supabaseEndpoint(path, query = "") {
  return `${defaultSupabaseUrl}/rest/v1/${path}${query}`;
}

async function supabaseRequest(path, options = {}, query = "") {
  const response = await fetch(supabaseEndpoint(path, query), {
    ...options,
    headers: {
      ...supabaseHeaders(options.prefer),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
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

function nextDateValue(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function datesForMonth(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    return `${year}-${pad(month)}-${pad(day)}`;
  });
}

function loadLocalEntries() {
  const saved = localStorage.getItem(storageKey());
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getOrCreateEmployee() {
  const name = currentEmployee.trim();
  const encodedName = encodeURIComponent(name);
  const passwordHash = await hashPassword(loginPassword.value);
  const existing = await supabaseRequest(
    "employees",
    { method: "GET" },
    `?select=*&name=eq.${encodedName}&limit=1`
  );

  if (existing.length) {
    const employee = existing[0];
    if (employee.password_hash && employee.password_hash !== passwordHash) {
      throw new Error("Incorrect password.");
    }

    if (!employee.password_hash) {
      await supabaseRequest(
        "employees",
        {
          method: "PATCH",
          body: JSON.stringify({ password_hash: passwordHash }),
        },
        `?id=eq.${employee.id}`
      );
    }
    return { ...employee, password_hash: employee.password_hash || passwordHash };
  }

  const created = await supabaseRequest(
    "employees",
    {
        method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        name,
        password_hash: passwordHash,
        hourly_wage: numberValue(hourlyWage),
        day_hours: standardDayHours,
      }),
    }
  );

  return created[0];
}

async function loadRemoteEntries() {
  if (!currentEmployeeId || !activeMonth.value) return {};
  const [year, month] = activeMonth.value.split("-").map(Number);
  const startDate = `${year}-${pad(month)}-01`;
  const endDate = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
  const entries = await supabaseRequest(
    "timesheet_entries",
    { method: "GET" },
    `?select=*&employee_id=eq.${currentEmployeeId}&work_date=gte.${startDate}&work_date=lte.${endDate}`
  );

  return entries.reduce((carry, entry) => {
    carry[entry.work_date] = {
      inTime: entry.in_time ? entry.in_time.slice(0, 5) : "",
      outDate: entry.out_date || entry.work_date,
      outTime: entry.out_time ? entry.out_time.slice(0, 5) : "",
    };
    return carry;
  }, {});
}

function saveLocalEntries() {
  const entries = {};
  entryBody.querySelectorAll("tr").forEach((row) => {
    const date = row.querySelector(".date").value;
    entries[date] = {
      inTime: row.querySelector(".inTime").value,
      outDate: row.querySelector(".outDate").value,
      outTime: row.querySelector(".outTime").value,
    };
  });
  localStorage.setItem(storageKey(), JSON.stringify(entries));
}

function rowPayload(row) {
  const result = calculateRow(row);
  return {
    employee_id: currentEmployeeId,
    work_date: row.querySelector(".date").value,
    day_name: row.querySelector(".day").value,
    in_time: row.querySelector(".inTime").value || null,
    out_date: row.querySelector(".outDate").value || row.querySelector(".date").value,
    out_time: row.querySelector(".outTime").value || null,
    duration_minutes: result.minutes,
    decimal_hours: Number((result.minutes / 60).toFixed(1)),
    total_day: Number(result.days.toFixed(2)),
    amount: Math.round(result.amount),
    hourly_wage: numberValue(hourlyWage),
    day_hours: standardDayHours,
  };
}

async function saveRemoteEntries() {
  if (!currentEmployeeId) return "skipped";

  await supabaseRequest(
    "employees",
    {
      method: "PATCH",
      body: JSON.stringify({
        hourly_wage: numberValue(hourlyWage),
        day_hours: standardDayHours,
      }),
    },
    `?id=eq.${currentEmployeeId}`
  );

  const rows = [...entryBody.querySelectorAll("tr")].map(rowPayload);
  try {
    await supabaseRequest("timesheet_entries", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: JSON.stringify(rows),
    }, "?on_conflict=employee_id,work_date");
  } catch (error) {
    console.error(error);
    return "settings-only";
  }

  return "saved";
}

function queueSave() {
  saveLocalEntries();
  window.clearTimeout(saveTimer);
  syncStatus.textContent = "Saving...";
  saveTimer = window.setTimeout(async () => {
    try {
      const result = await saveRemoteEntries();
      syncStatus.textContent =
        result === "settings-only"
          ? "Hourly rate saved. Run the out date query to save rows."
          : "Saved to Supabase";
    } catch (error) {
      syncStatus.textContent = "Could not save to Supabase";
      console.error(error);
    }
  }, 500);
}

function calculateRow(row) {
  const inDate = row.querySelector(".date").value;
  const outDate = row.querySelector(".outDate").value || inDate;
  const inMinutes = parseTime(row.querySelector(".inTime").value);
  const outMinutes = parseTime(row.querySelector(".outTime").value);
  const wage = numberValue(hourlyWage);
  const standardDay = standardDayHours;

  if (!inDate || !outDate || inMinutes === null || outMinutes === null) {
    row.querySelector(".duration").value = "";
    row.querySelector(".minutes").value = "";
    row.querySelector(".decimalHours").value = "";
    row.querySelector(".totalDay").value = "";
    row.querySelector(".amount").value = "";
    return { minutes: 0, amount: 0, days: 0 };
  }

  const start = new Date(`${inDate}T${row.querySelector(".inTime").value}:00`);
  const end = new Date(`${outDate}T${row.querySelector(".outTime").value}:00`);
  const minutes = Math.max(0, Math.round((end - start) / 60000));

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
  queueSave();
}

function addDateRow(dateValue, saved = {}) {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector("tr");

  row.querySelector(".date").value = dateValue;
  row.querySelector(".day").value = getDayName(dateValue);
  row.querySelector(".inTime").value = saved.inTime || "";
  row.querySelector(".outDate").value = saved.outDate || dateValue;
  row.querySelector(".outTime").value = saved.outTime || "";
  row.querySelector(".outTime").addEventListener("input", () => {
    const inTime = row.querySelector(".inTime").value;
    const outTime = row.querySelector(".outTime").value;
    const outDate = row.querySelector(".outDate");
    if (inTime && outTime && outDate.value === dateValue && parseTime(outTime) < parseTime(inTime)) {
      outDate.value = nextDateValue(dateValue);
    }
  });
  row.addEventListener("input", recalculate);

  entryBody.append(row);
}

async function generateMonth() {
  if (!activeMonth.value) return;

  const localEntries = loadLocalEntries();
  let savedEntries = localEntries;
  syncStatus.textContent = "Loading Supabase data...";
  try {
    const remoteEntries = await loadRemoteEntries();
    savedEntries = { ...localEntries, ...remoteEntries };
    syncStatus.textContent = "Connected to Supabase";
  } catch (error) {
    syncStatus.textContent = "Using local data only";
    console.error(error);
  }

  entryBody.replaceChildren();
  datesForMonth(activeMonth.value).forEach((dateValue) => {
    addDateRow(dateValue, savedEntries[dateValue]);
  });
  monthTitle.textContent = monthLabel(activeMonth.value);
  recalculate();
}

async function clearSavedData() {
  if (!currentEmployee.trim()) return;

  const prefix = `salary-calculator:${currentEmployee.trim().toLowerCase().replace(/\s+/g, "-")}:`;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(prefix)) localStorage.removeItem(key);
  }

  if (currentEmployeeId) {
    try {
      await supabaseRequest(
        "timesheet_entries",
        { method: "DELETE" },
        `?employee_id=eq.${currentEmployeeId}`
      );
    } catch (error) {
      console.error(error);
      syncStatus.textContent = "Could not clear remote data.";
      return;
    }
  }

  entryBody.replaceChildren();
  syncStatus.textContent = "Saved data cleared. You can update it now.";
  monthTitle.textContent = "Monthly Salary";
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
    "OUT DATE",
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
    row.querySelector(".outDate").value,
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

async function openApp() {
  currentEmployee = loginEmployee.value.trim();
  employeeLabel.textContent = currentEmployee;
  hourlyWage.value = "117.65";
  activeMonth.value = currentMonthValue();
  loginMessage.textContent = "Connecting...";

  try {
    const employee = await getOrCreateEmployee();
    currentEmployeeId = employee.id;
    hourlyWage.value = employee.hourly_wage || "117.65";
  } catch (error) {
    loginMessage.textContent =
      error.message === "Incorrect password."
        ? "Incorrect password."
        : "Could not connect to Supabase. Check the table queries.";
    console.error(error);
    return;
  }

  loginMessage.textContent = "";
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  generateMonth();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openApp();
});

generateBtn.addEventListener("click", generateMonth);
activeMonth.addEventListener("change", generateMonth);
clearBtn.addEventListener("click", clearSavedData);
exportBtn.addEventListener("click", exportCsv);
logoutBtn.addEventListener("click", () => {
  currentEmployeeId = "";
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});
hourlyWage.addEventListener("input", recalculate);
