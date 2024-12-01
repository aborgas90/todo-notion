const supertest = require("supertest");
const {
  createTestUser,
  removeTestUser,
  removeTestProject,
  getTestUserID,
} = require("./test-utils");
const app = require("../app");
const { logger } = require("../logging");
const prismaClient = require("../prisma-client");

beforeAll(async () => {
  await prismaClient.$connect();
});

afterAll(async () => {
  await prismaClient.$disconnect();
});

describe("POST /api/v1/project/", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    try {
      await removeTestUser();
      await removeTestProject("test project");
      await removeTestProject("");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("should can create project", async () => {
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [
          {
            user_id: getTestUserID,
          },
        ],
      });
    logger.info(result.body);
    expect(result.status).toBe(201);
    expect(result.body.data.projectname).toBe("test project");
    expect(result.body.data.description).toBe("test description");
    expect(result.body.data.expiresAt).toBe("2025-10-05T14:48:00.000Z");
  });

  it("it should create with empty value on optional field ", async () => {
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "",
        description: "",
        expiresAt: "",
        owner: [{}],
      });
    logger.info(result.body);
    expect(result.status).toBe(201);
    expect(result.body.data.projectname).toBe("");
    expect(result.body.data.description).toBe("");
    expect(result.body.data.expiresAt).toBe(null);
  });

  //errors case
});

//GET project/task/:taskId?
//PUT /project/task/:taskId?
//DELETE /project/task/:taskId?