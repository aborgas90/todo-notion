/* eslint-disable no-useless-catch */
const prismaClient = require("../prisma-client");
const { ResponseError } = require("../error/error-response");

const createProject = async ({
  projectname,
  description,
  expiresAt,
  owner,
}) => {
  try {
    const userConnections =
      Array.isArray(owner) && owner.length > 0
        ? owner.filter((o) => o.user_id).map((o) => ({ user_id: o.user_id }))
        : null;

    console.log();

    // Parse the input date string using Date constructor
    // Check if `expiresAt` is provided and is a valid date
    const timestamp = expiresAt ? new Date(expiresAt).toISOString() : null;

    if (expiresAt && isNaN(new Date(expiresAt))) {
      throw new Error("Invalid date format for expiresAt.");
    }

    const data = {
      projectname,
      description,
      ...(timestamp && { expiresAt: timestamp }),
      ...(userConnections.length > 0 && {
        owner: { connect: userConnections },
      }),
    };

    const createdProject = await prismaClient.project.create({
      data,
      include: {
        owner: {
          select: {
            user_id: true,
            username: true,
          },
        }, //
      },
    });

    return createdProject;
  } catch (error) {
    console.log("Error creating project:", error);
    throw error;
  }
};

//getvalueprojectbyownerid
const getProject = async (projectId) => {
  try {
    const project = await prismaClient.project.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        owner: {
          select: {
            user_id: true,
            username: true, // Adjust according to your user model fields
          },
        },
      },
    });
    console.log(project);
    return project;
  } catch (error) {
    console.log(error);
  }
};

//editproject
const editproject = async (project_id, projectname, description, owner) => {
  try {
    const findProject = await findProjectID(project_id);
    console.log(findProject);
    if (!findProject) {
      throw new ResponseError(404,"Project ID not Found");
    }

    const data = {
      projectname,
      description,
    };

    if (Array.isArray(owner)) {
      const connectOwners = owner
        .filter((o) => o.user_id)
        .map((o) => ({ user_id: o.user_id }));

      if (connectOwners.length > 0) {
        data.owner = {
          connect: connectOwners,
        };
      } else {
        const disconnectOwners = findProject.owner.map((o) => ({
          user_id: o.user_id,
        }));
        if (disconnectOwners.length > 0) {
          data.owner = {
            disconnect: disconnectOwners,
          };
        }
      }
    }

    console.log("Data to update:", data);

    const projectUpdate = await prismaClient.project.update({
      where: {
        project_id,
      },
      data,
      include: {
        owner: {
          select: {
            user_id: true,
            username: true,
          },
        },
      },
    });
    return projectUpdate;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update project");
  }
};

//delete todo projectbyid
const deleteProjectById = async (project_id) => {
  try {
    const findProject = await findProjectID(project_id);

    if (!findProject) {
      throw new ResponseError(404, "Project Not Found");
    }
    const deleteProject = await prismaClient.project.delete({
      where: {
        project_id,
      },
    });
    return deleteProject;
  } catch (error) {
    console.log(error);
  }
};

//findProjecID
const findProjectID = async (project_id) => {
  try {
    if (!project_id) {
      throw new Error("Project ID is required");
    }

    const project = await prismaClient.project.findUnique({
      where: { project_id },
      include: { owner: true },
    });

    return project;
  } catch (error) {
    console.error("Error finding a project:", error.message);
    throw new Error(`Failed to find a project: ${error.message}`);
  }
};

//Task
const createTask = async ({
  title,
  description,
  status,
  priority,
  projectId,
  assigneeId,
  expiresAt
}) => {
  try {
    const timestamp = expiresAt ? new Date(expiresAt).toISOString() : null;

    if (expiresAt && isNaN(new Date(expiresAt))) {
      throw new Error("Invalid date format for expiresAt.");
    }
    const createTasks = await prismaClient.task.create({
      data: {
        title : title || null,
        description : description || null,
        status : status || null,
        priority: priority || null,
        project: projectId 
          ? { connect: { project_id: projectId } } 
          : undefined,
        
        Assignee: assigneeId 
          ? { connect: { user_id: assigneeId } } 
          : undefined,                    
          ...(timestamp && { expiresAt: timestamp }),
      },
      include: {
        Assignee: {
          select: {
            user_id: true,
            username: true,
          },
        },
        project: {
          select: {
            project_id: true,
            projectname: true,
          },
        },
      },
    });

    return createTasks;
  } catch (error) {
    console.error("Error creating task:", error.message);
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

const getTaskById = async (task_id) => {
  try {
    if (!task_id) {
      throw new Error("task ID is required");
    }

    const task = await prismaClient.task.findUnique({
      where: { task_id : task_id},
      include : {
        project : {
          select : {
            projectname : true
          }
        },
        Assignee : {
          select : {
            username : true
          }
        }
      },
    });
    return task;
  } catch (error) {
    throw error;
  }
};

const editTask = async (task_id, title, description, status, priority, projectId, assigneeId, expiresAt) => {
  try {
    const findTask = await findTaskById(task_id);
    if (!findTask) {
      throw new ResponseError(404, "Task not found");
    }

    const timestamp = expiresAt ? new Date(expiresAt).toISOString() : null;

    const editedTask = await prismaClient.task.update({
      where: {
        task_id
      },
      data: {
        title: title || null,
        description: description || null,
        status: status || null,
        priority: priority || null,
        project: projectId 
          ? { connect: { project_id: projectId } } 
          : { disconnect: true },
        Assignee: assigneeId 
          ? { connect: { user_id: assigneeId } } 
          : { disconnect: true },
        ...(timestamp && { expiresAt: timestamp }),
      },
      include: {
        Assignee: {
          select: {
            user_id: true,
            username: true,
          },
        },
        project: {
          select: {
            project_id: true,
            projectname: true,
          },
        },
      },
    });

    return editedTask;
  } catch (error) {
    console.error("Error finding a project:", error.message);
    throw new Error("Failed to Edit Task");
  }
};

const deleteTask = async(taskid) => {
  try {
    if(!taskid) {
      throw new ResponseError(404, "task id is required!")
    }
    const findTaskId = await findTaskById(taskid)
    console.log("idne apa :: ",findTaskId)
    if(!findTaskId){
      throw new ResponseError(404, "task id not found")
    }

    const deleteTask = await prismaClient.task.delete({
      where : {
        task_id : taskid
      }
    })

    return deleteTask
  } catch (error) {
    throw error
  }
}


const findTaskById = async (task_id) => {
  try {
    if (!task_id) {
      throw new ResponseError(404,"task Id is required");
    }

    const task = await prismaClient.task.findUnique({
      where: { task_id : task_id},
    });

    if (!task) {
      throw new ResponseError(404,"Task id not found");
    }

    return task;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProject,
  getProject,
  editproject,
  deleteProjectById,
  findProjectID,
  createTask,
  getTaskById,
  editTask,
  deleteTask,
  findTaskById
};
