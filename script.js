const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("month-title");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

/* MODAL ELEMENTS */
const entryModal = document.getElementById("entry-modal");
const modalDayLabel = document.getElementById("modal-day-label");
const editEntryBtn = document.getElementById("edit-entry-btn");
const removeEntryBtn = document.getElementById("remove-entry-btn");
const cancelEntryBtn = document.getElementById("cancel-entry-btn");

let activeDateKey = null;

const OFF_VALUE = "__OFF__";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
];

// --------------------
// STORAGE
// --------------------
const STORAGE_KEY = "openCalendarReservations";
let reservations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

function saveReservations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

// --------------------
// STATE
// --------------------
let currentDate = new Date();

// --------------------
// MODAL CONTROLS
// --------------------
function openModal(dateKey, labelText) {
  activeDateKey = dateKey;
  modalDayLabel.textContent = labelText;
  entryModal.classList.remove("hidden");
}

function closeModal() {
  entryModal.classList.add("hidden");
  activeDateKey = null;
}

// --------------------
// RENDER
// --------------------
function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  // Weekday headers
  for (let day of weekdays) {
    const header = document.createElement("div");
    header.className = "weekday";
    header.textContent = day;
    calendar.appendChild(header);
  }

  const firstDay = new Date(year, month, 1);
  const startingWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells
  for (let i = 0; i < startingWeekday; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();

    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day available";

    const numberDiv = document.createElement("div");
    numberDiv.className = "day-number";
    numberDiv.textContent = day;

    const nameDiv = document.createElement("div");
    nameDiv.className = "day-name";

    dayDiv.appendChild(numberDiv);
    dayDiv.appendChild(nameDiv);

    // Today highlight
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("today");
    }

    // Disable certain weekdays
    if (weekday === 0 || weekday === 4 || weekday === 5 || weekday === 6) {
      dayDiv.classList.remove("available");
      dayDiv.classList.add("disabled");
      calendar.appendChild(dayDiv);
      continue;
    }

    // Reservation handling
    if (reservations[dateKey]) {
      dayDiv.classList.remove("available");

      if (reservations[dateKey] === OFF_VALUE) {
        dayDiv.classList.add("off-day");
        nameDiv.textContent = "No devotional today";
      } else {
        dayDiv.classList.add("taken");
        nameDiv.textContent = reservations[dateKey];
      }
    }

    // Click handler
    dayDiv.addEventListener("click", () => {
      if (reservations[dateKey]) {
        const label =
          reservations[dateKey] === OFF_VALUE
            ? `${monthNames[month]} ${day}, ${year} — No devotional today`
            : `${monthNames[month]} ${day}, ${year} — ${reservations[dateKey]}`;

        openModal(dateKey, label);
        return;
      }

      const input = prompt("Enter your name:");
      if (!input) return;

      if (input.trim().toLowerCase() === "off") {
        reservations[dateKey] = OFF_VALUE;
      } else {
        reservations[dateKey] = input.trim();
      }

      saveReservations();
      renderCalendar();
    });

    calendar.appendChild(dayDiv);
  }
}

// --------------------
// MODAL BUTTON ACTIONS
// --------------------
editEntryBtn.addEventListener("click", () => {
  if (!activeDateKey) return;

  const current = reservations[activeDateKey];
  const promptLabel =
    current === OFF_VALUE
      ? "Type a name or OFF:"
      : "Edit name (or type OFF):";

  const newValue = prompt(promptLabel, current === OFF_VALUE ? "" : current);
  if (!newValue) return;

  if (newValue.trim().toLowerCase() === "off") {
    reservations[activeDateKey] = OFF_VALUE;
  } else {
    reservations[activeDateKey] = newValue.trim();
  }

  saveReservations();
  closeModal();
  renderCalendar();
});

removeEntryBtn.addEventListener("click", () => {
  if (!activeDateKey) return;

  delete reservations[activeDateKey];
  saveReservations();
  closeModal();
  renderCalendar();
});

cancelEntryBtn.addEventListener("click", closeModal);

// --------------------
// NAVIGATION
// --------------------
prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initial render
renderCalendar();