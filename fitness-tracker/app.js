// ...existing code...

// Fitness Goal Tracker App
document.addEventListener('DOMContentLoaded', function () {
  const goalForm = document.getElementById('goal-form');
  const goalInput = document.getElementById('goal-input');
  const goalList = document.getElementById('goal-list');
  const calendarDiv = document.getElementById('calendar');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const monthLabel = document.getElementById('month-label');

  // Local Storage Keys
  const GOALS_KEY = 'fitness_goals';
  const TRACK_KEY = 'fitness_tracking';

  // State for calendar navigation
  let calendarState = (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  })();

  function getGoals() {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
  }

  function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  function getTracking() {
    return JSON.parse(localStorage.getItem(TRACK_KEY)) || {};
  }

  function saveTracking(tracking) {
    localStorage.setItem(TRACK_KEY, JSON.stringify(tracking));
  }

  function renderGoals() {
    const goals = getGoals();
    goalList.innerHTML = '';
    goals.forEach((goal, idx) => {
      const li = document.createElement('li');
      li.textContent = goal;
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => {
        goals.splice(idx, 1);
        saveGoals(goals);
        renderGoals();
        renderCalendar();
      };
      li.appendChild(delBtn);
      goalList.appendChild(li);
    });
  }

  goalForm.onsubmit = (e) => {
    e.preventDefault();
    const val = goalInput.value.trim();
    if (val) {
      const goals = getGoals();
      goals.push(val);
      saveGoals(goals);
      goalInput.value = '';
      renderGoals();
      renderCalendar();
    }
  };

  function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getMonthName(year, month) {
    return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function renderCalendar() {
    const goals = getGoals();
    const tracking = getTracking();
    const { year, month } = calendarState;
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfWeek(year, month); // 0=Sunday

    // Set month label
    if (monthLabel) monthLabel.textContent = getMonthName(year, month);

    // Build calendar header (days of week)
    let html = '<table class="calendar-table"><thead><tr><th>Goal</th>';
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d = 0; d < 7; d++) {
      html += `<th>${daysOfWeek[d]}</th>`;
    }
    html += '</tr></thead><tbody>';

    goals.forEach(goal => {
      html += `<tr><td>${goal}</td>`;
      let dayCell = 0;
      // Fill empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        html += '<td></td>';
        dayCell++;
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${month+1}-${d}`;
        const tracked = tracking[key]?.[goal];
        html += `<td class="${tracked ? 'tracked' : ''}" style="cursor:pointer" data-goal="${goal}" data-date="${key}">${tracked ? '✔️' : ''}</td>`;
        dayCell++;
        if (dayCell % 7 === 0 && d !== daysInMonth) html += '</tr><tr><td></td>';
      }
      // Fill empty cells after last day
      while (dayCell % 7 !== 0) {
        html += '<td></td>';
        dayCell++;
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    calendarDiv.innerHTML = html;

    // Add click handlers for tracking
    document.querySelectorAll('.calendar-table td[data-goal]').forEach(td => {
      td.onclick = () => {
        const goal = td.getAttribute('data-goal');
        const date = td.getAttribute('data-date');
        const tracking = getTracking();
        if (!tracking[date]) tracking[date] = {};
        tracking[date][goal] = !tracking[date][goal];
        saveTracking(tracking);
        renderCalendar();
      };
    });
  }

  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.onclick = () => {
      calendarState.month--;
      if (calendarState.month < 0) {
        calendarState.month = 11;
        calendarState.year--;
      }
      renderCalendar();
    };
    nextMonthBtn.onclick = () => {
      calendarState.month++;
      if (calendarState.month > 11) {
        calendarState.month = 0;
        calendarState.year++;
      }
      renderCalendar();
    };
  }

  // Initial render
  renderGoals();
  renderCalendar();
});
