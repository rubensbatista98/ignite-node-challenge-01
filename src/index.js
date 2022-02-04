const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    response.status(400).json({ error: "username's header must be provided." });
    return
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    response.status(404).json({ error: "user doesn't exists." });
    return
  }

  request.user = user;
  next();
} 

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (!name) {
    response.status(400).json({ error: "'name' must be provived." });
    return;
  }

  if (!username) {
    response.status(400).json({ error: "'username' must be provived." });
    return;
  }

  const alreadyExistsUserWithUsername = users.some(user => user.username === username);

  if (alreadyExistsUserWithUsername) {
    response.status(400).json({ error: 'user already exists.' });
    return;
  }

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (!title) {
    response.status(400).json({ error: "'title' must be provived." });
    return;
  }

  if (!deadline) {
    response.status(400).json({ error: "'deadline' must be provived." });
    return;
  }

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { user } = request;
  const { title, deadline } = request.body;

  const userTodo = user.todos.find(todo => todo.id === todoId);

  if (!userTodo) {
    response.status(404).json({ error: 'todo not found.' });
    return
  }

  if (title) {
    userTodo.title = title;
  }

  if (deadline) {
    userTodo.deadline = new Date(deadline);
  }

  response.json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { user } = request;
  const userTodo = user.todos.find(todo => todo.id === todoId);

  if (!userTodo) {
    response.status(404).json({ error: 'todo not found.' });
    return
  }

  userTodo.done = true;

  response.json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { user } = request;
  const todoIndex = user.todos.findIndex(todo => todo.id === todoId);

  if (todoIndex === -1) {
    response.status(404).json({ error: 'todo not found.' });
    return
  }

  user.todos.splice(todoIndex, 1)

  response.status(204).send();
});

module.exports = app;