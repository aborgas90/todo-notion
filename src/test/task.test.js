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

describe("POST /api/v1/task/", function async() {
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
