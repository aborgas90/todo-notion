const express = require("express");
const { authenticationMiddleware } = require("../middleware/auth-middleware");
const {
  createProjectHandler,
  getProjectByIdHandler,
  editProjectHandler,
  deleteProjectHandler,
  createTaskHandler,
  getTaskByIdHandler,
  editTaskHandler,
  deleteTaskHandler,
  getAllProjectHandler,
} = require("../controller/todo-controller");
const todoRouter = express.Router();

todoRouter.use(authenticationMiddleware);

//task
//new task clearing the rout path with bestpractice 
todoRouter.post("/project/task/", createTaskHandler);
todoRouter.get("/project/task/:taskId?", getTaskByIdHandler);
todoRouter.put("/project/task/:taskId?", editTaskHandler);
todoRouter.delete("/project/task/:taskId?", deleteTaskHandler);


//project
//new project clearing the rout path with bestpractice 
todoRouter.post("/project", createProjectHandler);
todoRouter.get("/project/",getAllProjectHandler)
todoRouter.get("/project/:projectId?", getProjectByIdHandler);
todoRouter.put("/project/:projectId?", editProjectHandler);
todoRouter.delete("/project/:projectId", deleteProjectHandler);
module.exports = todoRouter;
