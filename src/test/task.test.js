const supertest = require("supertest");
const app = require("../app");
const { logger } = require("../logging");
const prismaClient = require("../prisma-client");
const {
  createTestUser,
  removeTestUser,
  removeTestTask,
} = require("./test-utils");

beforeAll(async () => {
  await prismaClient.$connect();
});

afterAll(async () => {
  await prismaClient.$disconnect();
});

describe("POST /api/v1/project/task/", function async() {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    try {
      await removeTestUser();
      await removeTestTask("test");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("should can create project", async () => {
    const result = await supertest(app)
      .post("/api/v1/project/task/")
      .set("Authorization", "test")
      .send({
        title: "test",
        description: "test",
        status: "COMPLETED",
        priority: "LOW",
        projectId: "",
        assigneeId: "",
        expiresAt: "05 October 2025 14:48 UTC",
      });

    logger.info(result.body);
    expect(result.status).toBe(201);
    expect(result.body.data.title).toBe("test");
    expect(result.body.data.description).toBe("test");
    expect(result.body.data.status).toBe("COMPLETED")
    expect(result.body.data.priority).toBe("LOW")
    expect(result.body.data.projectId).toBe(null)
    expect(result.body.data.assigneeId).toBe(undefined)
    expect(result.body.data.expiresAt).toBe("2025-10-05T14:48:00.000Z");
  });
});

describe("GET /project/task/:taskId", function async(){
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    try {
      await removeTestUser();
      await removeTestTask("test");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("should can get task by id ", async() => {
    let taskId
    const createData = await supertest(app)
      .post("/api/v1/project/task/")
      .set("Authorization", "test")
      .send({
        title: "test",
        description: "test",
        status: "COMPLETED",
        priority: "LOW",
        projectId: "",
        assigneeId: "",
        expiresAt: "05 October 2025 14:48 UTC",
      });
    
    taskId = createData.body.data.task_id;

    const getData = await supertest(app)
      .get(`/api/v1/project/task/${taskId}`)
      .set("Authorization", "test");
    
    logger.info(getData.body);
    expect(getData.status).toBe(200);
    expect(getData.body.data.title).toBe("test");
    expect(getData.body.data.description).toBe("test");
    expect(getData.body.data.status).toBe("COMPLETED")
    expect(getData.body.data.priority).toBe("LOW")
    expect(getData.body.data.projectId).toBe(null)
    expect(getData.body.data.assigneeId).toBe(undefined)
    expect(getData.body.data.expiresAt).toBe("2025-10-05T14:48:00.000Z");
  })

  it("shouldn't can found the task",  async () => {
    let taskId
    const createData = await supertest(app)
      .post("/api/v1/project/task/")
      .set("Authorization", "test")
      .send({
        title: "test",
        description: "test",
        status: "COMPLETED",
        priority: "LOW",
        projectId: "",
        assigneeId: "",
        expiresAt: "05 October 2025 14:48 UTC",
      });
    
    taskId = createData.body.data.task_id;

    const getData = await supertest(app)
      .get(`/api/v1/project/task/${taskId}1`)
      .set("Authorization", "test");
    
    logger.info(getData.body);
    expect(getData.status).toBe(404);
    expect(getData.body.errors).toBe("Task Not Found");
  })

  it("if the task id is empty", async()=> {
    const result = await supertest(app)
     .get(`/api/v1/project/task/`)
     .set("Authorization", "test");
    
    expect(result.status).toBe(400);
    expect(result.body.errors).toBe("Task ID is required");
  })
})

describe("PUT /project/task/:taskId?", function async() {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    try {
      await removeTestUser();
      await removeTestTask("test");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("should can update task", async () => {
    
  })
})
 