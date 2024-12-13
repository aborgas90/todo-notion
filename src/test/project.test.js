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
    const userID = await getTestUserID()
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [
          userID,
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
  it('it shouldn`t create a project user id not found', async () => {
    const invalidUserID = "nonexistent-user-id";
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [
          {user_id : invalidUserID},
        ],
      });
    logger.info(result.body);
    expect(result.status).toBe(404);
    expect(result.body.errors).toBe("User Id not found");
  })
});

describe("GET /api/v1/project/:projectId?", function(){
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


  it("should can get data project by id ", async () => {
    let projectId
    const createProject = await supertest(app)
    .post("/api/v1/project/")
    .set("Authorization", "test")
    .send({
      projectname: "test project",
      description: "test description",
      expiresAt: "05 October 2025 14:48 UTC",
      owner: [
        {}
      ],
    })

    projectId = createProject.body.data.project_id
    const result = await supertest(app)
    .get(`/api/v1/project/${projectId}`)
    .set("Authorization", "test");

    logger.info(result.body)

    expect(result.status).toBe(200)
    expect(result.body).toHaveProperty("projectname", "test project");
    expect(result.body).toHaveProperty("description", "test description");
    expect(result.body).toHaveProperty("expiresAt", "2025-10-05T14:48:00.000Z");
  })

  //error case
  it("should cant get data returning error with empty projectid", async () => {
    let projectId = ''
    const result = await supertest(app)
    .get(`/api/v1/project/${projectId}`)
    .set("Authorization", "test");

    logger.info(result.body)
    expect(result.status).toBe(400)
    expect(result.body.errors).toBe("Invalid project ID");
    expect(result.body.message).toBe("Invalid Request")
  })

  it("should cant get data returning error with not found projectid", async () => {
    let projectId = '412'
    const result = await supertest(app)
    .get(`/api/v1/project/${projectId}`)
    .set("Authorization", "test");

    logger.info(result.body)
    expect(result.status).toBe(404)
    expect(result.body.errors).toBe("Project not found");
    expect(result.body.message).toBe("No project found for the given owner ID")
  })
})



//PUT /project/:projectId?
//DELETE /project/:projectId?