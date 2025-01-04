const { ResponseError } = require("../error/error-response");
const prismaClient = require("../prisma-client");
const {
  createProject,
  getProject,
  editproject,
  deleteProjectById,
  findProjectID,
  createTask,
  getTaskById,
  editTask,
  findTaskById,
  deleteTask,
  getAllProject,
} = require("../services/todo-services");

const createProjectHandler = async (req, res, next) => {
  try {
    const { projectname, description, expiresAt, owner } = req.body;
    console.log("Request body:", req.body);

    if (!owner) {
      res.status(400).json({
        errors: "Owner ID is missing",
        message: "User ID is required for connecting an owner.",
      });
    }else if (!Array.isArray(owner) || owner.length === 0) {
      res.status(400).json({
        errors: "Owner ID is missing",
        message: "User ID is required for connecting an owner.",
      });
    }

    const createNewProject = await createProject({
      projectname,
      description,
      expiresAt,
      owner,
    });

    res.status(201).json({ status: 201, data: createNewProject });
  } catch (error) {
    console.error("Error in createProjectHandler:", error);
    next(error);
  }
};

const getProjectByIdHandler = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // if (!projectId) {
    //   return res
    //     .status(400)
    //     .json({ errors: "Invalid project ID", message: "Invalid Request" });
    // }

    const project = await getProject(projectId);

    if (!project)  {
      return res.status(404).json({
        errors: "Project not found",
        message: "No project found for the given owner ID",
      });
    }
    return res.status(200).json(project);
  } catch (error) {
    console.log(error);
    next();
  }
};

const getAllProjectHandler = async (req, res, next) => {
  try {
    const result = await getAllProject()
    return res.status(200).json({status: 200, data: result})
  } catch (error) {
    console.log(error)
    next()
  }
}

const editProjectHandler = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const { projectname, description, owner } = req.body;
    console.log("project ID :: ", projectId);

    if (!projectId) {
      return res
        .status(400)
        .json({ error: "Invalid Project ID", message: "Invalid Request" });
    }
    const updateProject = await editproject(
      projectId,
      projectname,
      description,
      owner
    );
    return res
      .status(201)
      .json({ message: "Project Succesfully to Update", updateProject });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//delete handler project
const deleteProjectHandler = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    // Await the result of findProjectID to ensure it completes
    const findProject = await findProjectID(projectId);
    console.log("idnya paa :::", findProject);
    if (!findProject) {
      return res
        .status(404)
        .json({ errors: "Invalid Project ID", message: "Project not found" });
    }

    // Proceed to delete the project
    await deleteProjectById(projectId);

    // Return 204 No Content status as the deletion was successful
    return res.status(204).send();
  } catch (error) {
    // Log the error for debugging
    console.error("Delete Project Handler Error:", error);

    // Forward the error to the error handling middleware
    next(error);
  }
};

const createTaskHandler = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      expiresAt,
    } = req.body;

    //check a project id is exist or not if not exist return  a null
    if (projectId) {
      const project = await prismaClient.project.findUnique({
        where: { project_id : projectId}
      })

      if (!project) {
        return res.status(404).json({ status: 404, errors : "Invalid Project Id", message: "Project not found." });
      }
    }

    if (assigneeId) {
      const assignee = await prismaClient.user.findUnique({
        where: { user_id: assigneeId },
      });
    
      if (!assignee) {
        return res.status(404).json({ status: 404,errors : "Invalid Assignee Id", message: "Assignee not found." });
      }
    }
    

    const newTask = await createTask({
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      expiresAt,
    });
    console.log("newtask :: ", newTask);
    res.status(201).json({ status: 201, data: newTask });
  } catch (error) {
    next(error);
  }
};

const getTaskByIdHandler = async (req, res, next) => {
  try {
    const task_id = req.params.taskId;
    console.log("task id :: ",task_id)
    // Check if taskId is provided
    if (!task_id) {
      return res
        .status(400)
        .json({ status: 400, errors: "Task ID is required" });
    }
    // Find the task by ID
    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({ status: 404, errors: "Task Not Found" });
    }
    // Return the found task
    res.status(200).json({
      status: 200,
      data: task,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

const editTaskHandler = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    console.log("task id :: ", taskId);
    const {
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      expiresAt,
    } = req.body;

    console.log("body ?? :: ", req.body);
    if (!taskId || taskId.trim() === "") {
      return res.status(404).json({ status: 404, message: "taskid required!" });
    }

    const findTask = await findTaskById(taskId);
    if (!findTask) {
      return res
        .status(404)
        .json({ status: 200, message: "taskid not found!" });
    }

    const editNewTask = await editTask(
      taskId,
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      expiresAt
    );
    res
      .status(200)
      .json({ status: 200, message: "updated successfull!", editNewTask });
  } catch (error) {
    console.error("Error in editTaskHandler:", error.message);
    next(error);
  }
};

const deleteTaskHandler = async (req, res, next) => {
  try {
    const task_id = req.params.taskId;
    console.log("paramsid  ::", req.params.taskId);
    const findTaskId = await findTaskById(task_id);
    console.log("idne apa :: ", findTaskId);
    if (!findTaskId) {
      throw new ResponseError(404, "task id not found");
    }

    if (!task_id) {
      return res.status(404).json({
        status: 404,
        message: "task id is required!",
      });
    }
    await deleteTask(task_id);
    return res.status(204).json().send;
  } catch (error) {
    console.error("Error in editTaskHandler:", error.message);
    next(error);
  }
};

module.exports = {
  createProjectHandler,
  getAllProjectHandler,
  getProjectByIdHandler,
  editProjectHandler,
  deleteProjectHandler,
  createTaskHandler,
  getTaskByIdHandler,
  editTaskHandler,
  deleteTaskHandler,
};
