const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("month-title");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --------------------
// PERSISTENT STORAGE
// --------------------
const STORAGE_KEY = "openCalendarReservations";
let reservations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

function saveReservations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

// --------------------
// CALENDAR STATE
// --------------------
let currentDate = new Date();

// --------------------
// RENDER FUNCTION
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

  // Empty cells before day 1
  for (let i = 0; i < startingWeekday; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();

    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day available";
    dayDiv.textContent = day;

    // Highlight today
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("today");
    }

    // Disable Sunday (0), Thursday (4), Friday (5), Saturday (6)
    if (weekday === 0 || weekday === 4 || weekday === 5 || weekday === 6) {
      dayDiv.classList.remove("available");
      dayDiv.classList.add("disabled");
      calendar.appendChild(dayDiv);
      continue;
    }

    // Reserved?
    if (reservations[dateKey]) {
      dayDiv.classList.remove("available");
      dayDiv.classList.add("taken");
      dayDiv.innerHTML = `<strong>${day}</strong><br>${reservations[dateKey]}`;
    }

    dayDiv.addEventListener("click", () => {
      if (reservations[dateKey]) {
        const action = prompt(
          `Reserved by "${reservations[dateKey]}".\n\n` +
          `Type a NEW name to change it\n` +
          `or type 0 to remove the reservation.`
        );

        if (!action) return;

        if (action.toUpperCase() === "0") {
          delete reservations[dateKey];
          saveReservations();
          renderCalendar();
          return;
        }

        reservations[dateKey] = action;
        saveReservations();
        renderCalendar();
        return;
      }

      const name = prompt("Enter your name:");
      if (!name) return;

      reservations[dateKey] = name;
      saveReservations();
      renderCalendar();
    });

    calendar.appendChild(dayDiv);
  }
}

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
const howToBtn = document.getElementById("how-to-btn");
const instructionPanel = document.getElementById("instruction-panel");

howToBtn.addEventListener("click", () => {
  instructionPanel.classList.toggle("hidden");

  howToBtn.textContent = instructionPanel.classList.contains("hidden")
    ? "How to use this calendar"
    : "Hide instructions";
});