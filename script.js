// --- Переключение темы ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

function setTheme(theme) {
  // Удаляем все классы тем
  body.classList.remove('light', 'pink');
  
  if (theme === 'light') {
    body.classList.add('light');
    themeToggleBtn.textContent = '🌞';
  } else if (theme === 'pink') {
    body.classList.add('pink');
    themeToggleBtn.textContent = '🌸';
  } else {
    // dark theme
    themeToggleBtn.textContent = '🌙';
  }
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  let currentTheme = 'dark';
  if (body.classList.contains('light')) {
    currentTheme = 'light';
  } else if (body.classList.contains('pink')) {
    currentTheme = 'pink';
  }
  
  // Циклическое переключение: dark -> light -> pink -> dark
  if (currentTheme === 'dark') {
    setTheme('light');
  } else if (currentTheme === 'light') {
    setTheme('pink');
  } else {
    setTheme('dark');
  }
});

// --- Меню-бургер ---
const burger = document.getElementById('burger');
const navMenu = document.getElementById('nav-menu');

burger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// --- Задачи ---
const tasksContainer = document.getElementById('tasks');
const addBtn = document.getElementById('add-btn');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const categorySelect = document.getElementById('category');
const prioritySelect = document.getElementById('priority');
const timeInput = document.getElementById('time');
const filterSelect = document.getElementById('filter');
const sortSelect = document.getElementById('sort');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const activeTimers = {};

// Сохранение
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Запуск и остановка таймера
function startTimer(index) {
  if (activeTimers[index]) return;

  activeTimers[index] = setInterval(() => {
    tasks[index].time--;
    if (tasks[index].time <= 0) {
      tasks[index].time = 0;
      tasks[index].completed = true;
      stopTimer(index);
    }
    saveTasks();
    renderTasks();
  }, 60000);
}

function stopTimer(index) {
  clearInterval(activeTimers[index]);
  delete activeTimers[index];
}

// Рендер задач
function renderTasks() {
  tasksContainer.innerHTML = '';

  let filtered = filterSelect.value === 'all'
    ? tasks
    : tasks.filter(t => t.category === filterSelect.value);

  if (sortSelect.value === 'time') {
    filtered.sort((a, b) => a.time - b.time);
  } else if (sortSelect.value === 'priority') {
    const priorityOrder = { 'Высокий': 1, 'Средний': 2, 'Низкий': 3 };
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  filtered.forEach((task, index) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.priority = task.priority;
    if (task.completed) div.classList.add('completed');

    div.innerHTML = `
      <h3>
        <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" />
        <span contenteditable="true" data-type="title" data-index="${index}">${task.title}</span>
      </h3>
      <p contenteditable="true" data-type="desc" data-index="${index}">${task.description}</p>
      <p><b>Категория:</b> ${task.category}</p>
      <p><b>Приоритет:</b> ${task.priority}</p>
      <p>
        <b>Время (мин):</b> 
        <span contenteditable="true" data-type="time" data-index="${index}">${task.time}</span>
        <button class="timer-btn" data-index="${index}">${activeTimers[index] ? '⏸' : '▶'}</button>
      </p>
      <button data-index="${index}" class="delete-btn">Удалить</button>
    `;

    tasksContainer.appendChild(div);
  });
}

// Добавление задачи
addBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  if (!title) {
    alert('Нужно ввести название задачи!');
    return;
  }

  const newTask = {
    title,
    description: descInput.value.trim(),
    category: categorySelect.value,
    priority: prioritySelect.value,
    time: parseInt(timeInput.value) || 30,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  titleInput.value = '';
  descInput.value = '';
  timeInput.value = 30;
});

// Обработка кликов
tasksContainer.addEventListener('click', e => {
  const index = e.target.dataset.index;

  if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
    tasks[index].completed = e.target.checked;
    saveTasks();
    renderTasks();
  }

  if (e.target.classList.contains('delete-btn')) {
    stopTimer(index);
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }

  if (e.target.classList.contains('timer-btn')) {
    if (activeTimers[index]) {
      stopTimer(index);
    } else {
      startTimer(index);
    }
    renderTasks();
  }
});

// Обработка редактирования
tasksContainer.addEventListener('input', e => {
  const target = e.target;
  const idx = target.dataset.index;
  const type = target.dataset.type;

  if (!idx || !type) return;

  if (type === 'title') tasks[idx].title = target.textContent.trim();
  else if (type === 'desc') tasks[idx].description = target.textContent.trim();
  else if (type === 'time') {
    const val = parseInt(target.textContent.trim());
    tasks[idx].time = isNaN(val) ? 30 : val;
  }

  saveTasks();
});

// Обработка фильтров
filterSelect.addEventListener('change', renderTasks);
sortSelect.addEventListener('change', renderTasks);

// Первый рендер
renderTasks();
