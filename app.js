const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let todos = [];
let id = 1;

// Get all todos
app.get("/todos", (req, res) => {
  res.json(todos.sort((a, b) => a.order - b.order));
});

// Add todo
app.post("/todos", (req, res) => {
  const newTodo = {
    id: id++,
    task: req.body.task,
    completed: false,
    order: todos.length
  };
  todos.push(newTodo);
  res.json(newTodo);
});

// Toggle completed
app.put("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (todo) {
    todo.completed = req.body.completed;
  }
  res.json(todo);
});

// Update order after drag
app.put("/todos", (req, res) => {
  todos = req.body;
  res.json({ message: "Order updated" });
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id));
  res.json({ message: "Deleted" });
});


// ✅ REPLACE your old app.listen with this:
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);