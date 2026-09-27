const STORAGE_KEY = 'zhuri-todos-v1';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyNote = document.querySelector('#empty-note');
const filterButtons = document.querySelectorAll('[data-filter]');
const liveMessage = document.querySelector('#live-message');

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved)
      ? saved.filter((todo) => todo && typeof todo.id === 'string' && typeof todo.text === 'string' && typeof todo.completed === 'boolean')
      : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = todos.length - completed;
  const percentage = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  list.replaceChildren();
  for (const todo of visibleTodos) {
    const item = document.createElement('li');
    item.className = `task-item${todo.completed ? ' is-complete' : ''}`;

    const toggle = document.createElement('input');
    toggle.className = 'task-toggle';
    toggle.type = 'checkbox';
    toggle.checked = todo.completed;
    toggle.dataset.action = 'toggle';
    toggle.dataset.id = todo.id;
    toggle.setAttribute('aria-label', `${todo.completed ? '标记为未完成' : '标记为已完成'}：${todo.text}`);

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = todo.text;

    const remove = document.createElement('button');
    remove.className = 'delete-task';
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = todo.id;
    remove.setAttribute('aria-label', `删除：${todo.text}`);
    remove.title = '删除任务';

    item.append(toggle, text, remove);
    list.append(item);
  }

  document.querySelector('#task-count').textContent = String(todos.length);
  document.querySelector('#remaining-count').textContent = todos.length
    ? `还有 ${remaining} 项未完成`
    : '还没有待办';
  document.querySelector('#completion-fraction').textContent = `${completed} / ${todos.length}`;
  document.querySelector('#open-total').textContent = String(remaining);
  document.querySelector('#done-total').textContent = String(completed);
  document.querySelector('#progress-value').textContent = `${percentage}%`;
  document.querySelector('#progress-note').textContent = todos.length === 0
    ? '刚刚开始'
    : remaining === 0 ? '今天做得真好' : '稳稳向前';
  document.querySelector('#progress-bar').setAttribute('aria-valuenow', String(percentage));
  document.querySelector('#progress-fill').style.width = `${percentage}%`;
  document.querySelector('#clear-completed').hidden = completed === 0;

  const isEmpty = visibleTodos.length === 0;
  emptyState.hidden = !isEmpty;
  if (isEmpty) {
    emptyTitle.textContent = currentFilter === 'completed' && todos.length
      ? '还没有完成的事项。'
      : currentFilter === 'active' && todos.length ? '待办都完成啦。' : '这里还很清静。';
    emptyNote.textContent = currentFilter === 'all' ? '写下第一件想做的事吧。' : '试试其他筛选，或添加一项新任务。';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const todo = { id: crypto.randomUUID(), text, completed: false };
  todos.unshift(todo);
  currentFilter = 'all';
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  saveTodos();
  render();
  form.reset();
  input.focus();
  liveMessage.textContent = `已添加：${text}`;
});

list.addEventListener('change', (event) => {
  const toggle = event.target.closest('[data-action="toggle"]');
  if (!toggle) return;

  const todo = todos.find((item) => item.id === toggle.dataset.id);
  if (!todo) return;
  todo.completed = toggle.checked;
  saveTodos();
  render();
  liveMessage.textContent = `${todo.text}，${todo.completed ? '已完成' : '已标记为未完成'}`;
});

list.addEventListener('click', (event) => {
  const remove = event.target.closest('[data-action="delete"]');
  if (!remove) return;

  const todo = todos.find((item) => item.id === remove.dataset.id);
  todos = todos.filter((item) => item.id !== remove.dataset.id);
  saveTodos();
  render();
  if (todo) liveMessage.textContent = `已删除：${todo.text}`;
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle('is-selected', selected);
      filterButton.setAttribute('aria-pressed', String(selected));
    });
    render();
  });
});

document.querySelector('#clear-completed').addEventListener('click', () => {
  const removed = todos.filter((todo) => todo.completed).length;
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
  liveMessage.textContent = `已清除 ${removed} 项已完成任务`;
});

const now = new Date();
document.querySelector('#topbar-date').textContent = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(now);
document.querySelector('#full-date').textContent = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(now);

render();