const bcrypt = require("bcrypt");
const prismaClient = require("../prisma-client");
require("dotenv").config();

const removeTestUser = async () => {
  await prismaClient.user.deleteMany({
    where: {
      username: "test",
    },
  });
};

const createTestUser = async () => {
  await prismaClient.user.create({
    data: {
      email: "test@gmail.com",
      username: "test",
      password: await bcrypt.hash("test", 10),
      token: "test",
    },
  });
};

const getTestUser = async () => {
  return prismaClient.user.findUnique({
    where: {
      username: "test",
    },
  });
};

const getTestUserID = async () => {
  return prismaClient.user.findUnique({
    where: {
      username: "test",
    },
    select : {
      user_id : true
    }
  });
};

const createTestProject = async () => {
  const testUser = await getTestUser(); // Ensure this retrieves the user
  if (!testUser) {
    throw new Error("Test user not found, cannot create project.");
  }

  return prismaClient.project.create({
    data: {
      projectname: "test project",
      description: "test decription",
      expiresAt: "05 October 2025 14:48 UTC",
      owner: [
        {
          user_id: testUser.user_id,
        },
      ],
    },
  });
};

const removeTestProject = async (projectName) => {
    await prismaClient.project.deleteMany({
      where: {
        projectname: projectName, // Use a parameter to specify which project to delete
      },
    });
};

const createTestTask = async () => {
  const testUser = await getTestUser(); // Ensure this retrieves the user
  if (!testUser) {
    throw new Error("Test user not found, cannot create project.");
  }

  return prismaClient.task.create({
    data: {
      title: "test",
      description: "test",
      status: "COMPLETED",
      priority: "LOW",
      projectId: "",
      assigneeId: "",
      expiresAt: "05 October 2025 14:48 UTC",
    },
  });
};

const getTestTaskByID =  async (task_id) => {
  if (!task_id) {
    throw new Error("task test ID is required");
  }

  await prismaClient.task.findUnique({
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
}

const removeTestTask = async (titleName) => {
  await prismaClient.task.deleteMany({
    where: {
      title: titleName, // Use a parameter to specify which project to delete
    },
  });
};

module.exports = {
  removeTestUser,
  createTestUser,
  getTestUser,
  getTestUserID,
  createTestProject,
  removeTestProject,
  createTestTask,
  getTestTaskByID,
  removeTestTask
};
