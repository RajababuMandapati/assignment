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
              WHERE search_q LIKE '%${search_q}%'
              AND 
              status='${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
              SELECT * FROM todo WHERE search_q LIKE '%${search_q}%'
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
              SELECT * FROM todo WHERE search_q = '%${search_q}%'
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
      getTodosQuery = `SELECT * FROM todo WHERE search_q LIKE '%${search_q}%';
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
  const { search_q = "", date } = request.query;

  const getTodoDate = `
    SELECT * FROM todo WHERE search_q LIKE '%${search_q}%' AND 
    dueDate = ${date};`;
  const todo = await database.all(getTodoDate);
  response.send(todo);
});

module.exports = app;
