const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("month-title");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

const entryModal = document.getElementById("entry-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalDayLabel = document.getElementById("modal-day-label");
const editEntryBtn = document.getElementById("edit-entry-btn");
const removeEntryBtn = document.getElementById("remove-entry-btn");
const cancelEntryBtn = document.getElementById("cancel-entry-btn");

const calendarModal = document.getElementById("calendar-modal");
const addToCalendarBtn = document.getElementById("add-to-calendar-btn");
const skipCalendarBtn = document.getElementById("skip-calendar-btn");

const confirmBtn = document.getElementById("confirm-selection-btn");

const OFF_VALUE = "off";
const STORAGE_KEY = "openCalendarReservations";

let activeDateKey = null;
let selectedDates = [];
let pendingCalendarData = null;
let reservations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let currentDate = new Date();

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function saveReservations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function updateConfirmButton() {
  confirmBtn.classList.toggle("hidden", selectedDates.length === 0);
}

/* ======================
   ICS GENERATOR
====================== */
function generateMultiICS(name, datesArray) {
  const timestamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
  let events = "";

  datesArray.forEach(dateKey => {
    const date = dateKey.replace(/-/g,"");
    const uid = `${date}-bydevotional@calendar`;

    events += `
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${timestamp}
SUMMARY:BY Devotional – ${name}
DTSTART:${date}T083000
DTEND:${date}T093000
DESCRIPTION:BY Devotional
BEGIN:VALARM
TRIGGER:-PT15H
ACTION:DISPLAY
DESCRIPTION:Reminder: BY Devotional in 15 hours
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: BY Devotional in 2 hours
END:VALARM
END:VEVENT
`;
  });

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BY Devotionals//Calendar//EN
${events}
END:VCALENDAR`;

  const blob = new Blob([ics], { type:"text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "by-devotionals.ics";
  link.click();
}

/* ====================== RENDER ====================== */
function renderCalendar() {
  calendar.innerHTML = "";
  selectedDates = [];
  updateConfirmButton();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  monthTitle.textContent = `${monthNames[month]} ${year}`;

const shortWeekdays = ["S","M","T","W","T","F","S"];

shortWeekdays.forEach(day => {
  const h = document.createElement("div");
  h.className = "weekday";
  h.textContent = day;
  calendar.appendChild(h);
});

  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){
    calendar.appendChild(document.createElement("div"));
  }

  for(let day=1;day<=daysInMonth;day++){
    const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const weekday = new Date(year,month,day).getDay();

    const cell = document.createElement("div");
    cell.className="day available";

    const num = document.createElement("div");
    num.className="day-number";
    num.textContent=day;

    const nameDiv=document.createElement("div");
    nameDiv.className="day-name";

    cell.append(num,nameDiv);

    if(day===today.getDate() && month===today.getMonth() && year===today.getFullYear()){
      cell.classList.add("today");
    }

    if([0,4,5,6].includes(weekday)){
      cell.className="day disabled";
      calendar.appendChild(cell);
      continue;
    }

    if(reservations[dateKey]){
      cell.classList.remove("available");

      if(reservations[dateKey]===OFF_VALUE){
        cell.classList.add("off-day");
        nameDiv.textContent="No meeting today";
      } else {
        cell.classList.add("taken");
        nameDiv.textContent=reservations[dateKey];
      }
    }

    cell.addEventListener("click",()=>{
      if(reservations[dateKey]){
        activeDateKey=dateKey;
        modalDayLabel.textContent=`${monthNames[month]} ${day}`;
        entryModal.classList.remove("hidden");
        return;
      }

      if(selectedDates.includes(dateKey)){
        selectedDates=selectedDates.filter(d=>d!==dateKey);
        cell.classList.remove("selected");
      } else {
        selectedDates.push(dateKey);
        cell.classList.add("selected");
      }

      updateConfirmButton();
    });

    calendar.appendChild(cell);
  }
}

/* ====================== CONFIRM ====================== */
confirmBtn.onclick=()=>{
  const name = prompt("Enter your name:");
  if(!name) return;

  const cleaned = name.trim();
  const finalValue = cleaned.toLowerCase()==="off" ? OFF_VALUE : cleaned;

  selectedDates.forEach(d => reservations[d] = finalValue);
  saveReservations();

  pendingCalendarData = { name: finalValue, dates:[...selectedDates] };

  renderCalendar();
  calendarModal.classList.remove("hidden");
};

/* ====================== MODALS ====================== */
addToCalendarBtn.onclick = () => {
  if (pendingCalendarData) {
    generateMultiICS(
      pendingCalendarData.name,
      pendingCalendarData.dates
    );
  }

  calendarModal.classList.add("hidden");
  pendingCalendarData = null;
};

skipCalendarBtn.onclick=()=>{
  calendarModal.classList.add("hidden");
  pendingCalendarData=null;
};

editEntryBtn.onclick = () => {
  const val = prompt("Edit name or type OFF:", reservations[activeDateKey]);
  if (!val) return;

  reservations[activeDateKey] =
    val.trim().toLowerCase() === "off"
      ? OFF_VALUE
      : val.trim();

  saveReservations();
  renderCalendar();

  entryModal.classList.add("hidden");
};

removeEntryBtn.onclick = () => {
  delete reservations[activeDateKey];
  saveReservations();
  renderCalendar();

  entryModal.classList.add("hidden");
};

cancelEntryBtn.onclick = () => {
  entryModal.classList.add("hidden");
};

/* ====================== NAVIGATION ====================== */
prevBtn.onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()-1);
  renderCalendar();
};

nextBtn.onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()+1);
  renderCalendar();
};

renderCalendar();