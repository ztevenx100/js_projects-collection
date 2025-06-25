// Calendario interactivo con eventos y recordatorios
const calendar = document.getElementById('calendar');
const eventsList = document.getElementById('events-list');
const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const eventForm = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventTitleInput = document.getElementById('event-title');
const eventDescInput = document.getElementById('event-desc');
const modalTitle = document.getElementById('modal-title');

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');

function renderCalendar(date) {
  calendar.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Nombres de los días
  dayNames.forEach(dn => {
    const dayName = document.createElement('div');
    dayName.className = 'day-name';
    dayName.textContent = dn;
    calendar.appendChild(dayName);
  });

  // Días vacíos antes del primer día
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day';
    empty.style.visibility = 'hidden';
    calendar.appendChild(empty);
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement('div');
    day.className = 'day';
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    if (isToday) day.classList.add('today');
    day.textContent = d;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (events[dateStr]) {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event';
      eventDiv.textContent = events[dateStr][0].title;
      day.appendChild(eventDiv);
    }
    day.onclick = () => openModal(dateStr);
    calendar.appendChild(day);
  }
}

function openModal(dateStr) {
  modal.classList.remove('hidden');
  eventDateInput.value = dateStr;
  eventTitleInput.value = '';
  eventDescInput.value = '';
  modalTitle.textContent = 'Agregar Evento';
}

closeModal.onclick = () => {
  modal.classList.add('hidden');
};

window.onclick = (e) => {
  if (e.target === modal) modal.classList.add('hidden');
};

eventForm.onsubmit = (e) => {
  e.preventDefault();
  const date = eventDateInput.value;
  const title = eventTitleInput.value;
  const desc = eventDescInput.value;
  if (!events[date]) events[date] = [];
  events[date].push({ title, desc });
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  modal.classList.add('hidden');
  renderCalendar(currentDate);
  renderEvents();
};

function renderEvents() {
  eventsList.innerHTML = '<h3>Eventos</h3>';
  const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
  let found = false;
  Object.keys(events).forEach(date => {
    events[date].forEach((ev, idx) => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `<div><b>${date}</b>: ${ev.title}</div>`;
      const actions = document.createElement('div');
      actions.className = 'event-actions';
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.onclick = () => deleteEvent(date, idx);
      actions.appendChild(delBtn);
      item.appendChild(actions);
      eventsList.appendChild(item);
      if (date === todayStr) found = true;
    });
  });
  if (!found) {
    eventsList.innerHTML += '<div>No hay eventos para hoy.</div>';
  }
}

function deleteEvent(date, idx) {
  events[date].splice(idx, 1);
  if (events[date].length === 0) delete events[date];
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  renderCalendar(currentDate);
  renderEvents();
}

// Inicialización
renderCalendar(currentDate);
renderEvents();
