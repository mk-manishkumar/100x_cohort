/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;
const dataFilePath = path.join(__dirname, "todos.json");
let todoData = loadTodoData();

// This line enables Express to parse incoming JSON data from request bodies.
app.use(bodyParser.json());

// Function to generate a unique ID for a new todo item
function generateUniqueId() {
  const ids = todoData.map((item) => item.id);
  let newId = 1;

  while (ids.includes(newId)) {
    newId++;
  }

  return newId;
}

// Function to load todo data from file
function loadTodoData() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Function to save todo data to file
function saveTodoData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Endpoint to retrieve all todo items
app.get("/todos", (req, res) => {
  res.status(200).json(todoData);
});

// Endpoint to retrieve a specific todo item by ID
app.get("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const todoItem = todoData.find((item) => item.id === todoId);

  if (todoItem) {
    res.status(200).json(todoItem);
  } else {
    res.status(404).send("Not Found");
  }
});

// Endpoint to create a new todo item
app.post("/todos", (req, res) => {
  const newTodo = req.body;
  newTodo.id = generateUniqueId();
  todoData.push(newTodo);

  saveTodoData(todoData);

  res.status(201).json({ id: newTodo.id });
});

// Endpoint to update an existing todo item by ID
app.put("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const updatedTodo = req.body;
  const index = todoData.findIndex((item) => item.id === todoId);

  if (index !== -1) {
    todoData[index] = { ...todoData[index], ...updatedTodo };
    saveTodoData(todoData);
    res.status(200).send("OK");
  } else {
    res.status(404).send("Not Found");
  }
});

// Endpoint to delete a todo item by ID
app.delete("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const index = todoData.findIndex((item) => item.id === todoId);

  if (index !== -1) {
    todoData.splice(index, 1);
    saveTodoData(todoData);
    res.status(200).send("OK");
  } else {
    res.status(404).send("Not Found");
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
