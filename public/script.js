const apiUrl = "/todos";
let todos = [];

// Load todos
async function loadTodos() {
  const res = await fetch(apiUrl);
  todos = await res.json();
  renderTodos();
}

function renderTodos() {
  const list = document.getElementById("todoList");
  const counter = document.getElementById("counter");

  list.innerHTML = "";
  counter.textContent = `${todos.length} tasks`;

  todos.forEach(todo => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.id = todo.id;
    if (todo.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = todo.task;
    span.onclick = () => toggleComplete(todo);

    const btn = document.createElement("button");
    btn.textContent = "✖";
    btn.className = "delete-btn";
    btn.onclick = () => deleteTodo(todo.id);

    li.appendChild(span);
    li.appendChild(btn);
    addDragEvents(li);
    list.appendChild(li);
  });
}

// Toggle complete
async function toggleComplete(todo) {
  todo.completed = !todo.completed;
  await fetch(`${apiUrl}/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: todo.completed })
  });
  loadTodos();
}

// Add todo
async function addTodo() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  if (!task) return;

  await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task })
  });

  input.value = "";
  loadTodos();
}

// Delete
async function deleteTodo(id) {
  await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  loadTodos();
}

document.getElementById("taskInput")
  .addEventListener("keypress", e => {
    if (e.key === "Enter") addTodo();
  });

/* 🔥 Drag & Drop Logic */

let dragItem = null;

function addDragEvents(li) {
  li.addEventListener("dragstart", () => {
    dragItem = li;
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    updateOrder();
  });

  li.addEventListener("dragover", e => {
    e.preventDefault();
    const list = li.parentNode;
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
      list.appendChild(dragItem);
    } else {
      list.insertBefore(dragItem, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll("li:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    return offset < 0 && offset > closest.offset
      ? { offset, element: child }
      : closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Save new order
async function updateOrder() {
  const items = [...document.querySelectorAll("#todoList li")];
  const updated = items.map((li, index) => {
    const todo = todos.find(t => t.id == li.dataset.id);
    return { ...todo, order: index };
  });

  todos = updated;

  await fetch(apiUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });
}

loadTodos();