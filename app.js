const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const path = require("path");

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

initilizeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initilizeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasSearc_qProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestAnimationFrame.category !== undefined &&
    requestQuery.status !== undefined
  );
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `
              SELECT *
              FROM todo
              WHERE todo LIKE '%${search_q}%'
              AND 
              status='${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
              SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
              AND priority = '${priority}';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasCategoryAndProrityProperty(request.query):
      getTodosQuery = `
              SELECT * FROM todo WHERE todo = '%${search_q}%'
              AND category = '${category}' AND priority = '${priority}';`;
      break;
    case hasCategoryAndStatusProperty(request.query):
      getTodosQuery = `
              SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE category = '${category}';`;
      break;
    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';
              `;
      break;
  }
  data = await database.all(getTodosQuery);
  response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.get("/agenda/", async (request, response) => {
  const date = format(new Date(2021, 03, 16), "yyyy-MM-dd");
  const getTodoDate = `
    SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND 
    due_date = ${date};`;
  const todo = await database.get(getTodoDate);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const insertTodo = `INSERT INTO
         todo (id, todo, priority, status, category, due_date)
        VALUES 
            (${id}, '${todo}', '${priority}', '${status}', '${category}',
             '${dueDate}');`;
  await database.run(insertTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const updatedColumn = "";

  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updatedColumn = "Category";
      break;
    case requestBody.due_date !== undefined:
      updatedColumn = "Due Date";
      break;
  }

  const previousTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    status = previousTodo.status,
    priority = previousTodo.priority,
    todo = previousTodo.todo,
    category = previousTodo.category,
    due_date = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${due_date}',
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
     DELETE FROM
        todo
    WHERE
        id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
