const supertest = require("supertest");
const {
  createTestUser,
  removeTestUser,
  removeTestProject,
  getTestUserID,
  createTestProject,
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
    const userID = await getTestUserID();
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [userID],
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
  it("it shouldn`t create a project user id not found", async () => {
    const invalidUserID = "nonexistent-user-id";
    const result = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [{ user_id: invalidUserID }],
      });
    logger.info(result.body);
    expect(result.status).toBe(404);
    expect(result.body.errors).toBe("User Id not found");
  });
});

describe("GET /api/v1/project/:projectId?", function () {
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
    let projectId;
    const createProject = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [{}],
      });

    projectId = createProject.body.data.project_id;
    const result = await supertest(app)
      .get(`/api/v1/project/${projectId}`)
      .set("Authorization", "test");

    logger.info(result.body);

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("projectname", "test project");
    expect(result.body).toHaveProperty("description", "test description");
    expect(result.body).toHaveProperty("expiresAt", "2025-10-05T14:48:00.000Z");
  });

  it("should cant get data returning error with not found projectid", async () => {
    let projectId = "412";
    const result = await supertest(app)
      .get(`/api/v1/project/${projectId}`)
      .set("Authorization", "test");

    logger.info(result.body);
    expect(result.status).toBe(404);
    expect(result.body.errors).toBe("Project not found");
    expect(result.body.message).toBe("No project found for the given owner ID");
  });
});

//PUT /project/:projectId?
describe("PUT /api/v1/project/:projectId?", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    try {
      await removeTestUser();
      await removeTestProject("test project");
      await removeTestProject("test update project");
      await removeTestProject("");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("should update value on data project", async () => {
    const userID = await getTestUserID();
    const createProject = await supertest(app)
      .post("/api/v1/project/")
      .set("Authorization", "test")
      .send({
        projectname: "test project",
        description: "test description",
        expiresAt: "05 October 2025 14:48 UTC",
        owner: [userID],
      });

    const projectId = createProject.body.data.project_id;
    const updateData = await supertest(app)
      .put(`/api/v1/project/${projectId}`)
      .set("Authorization", "test")
      .send({
        projectname: "test update project",
        description: "test update description",
        expiresAt: "06 October 2025 14:48 UTC",
        owner: [userID],
      });
    
    expect(updateData.status).toBe(201)
    expect(updateData.body).toHaveProperty("message", "Project Succesfully to Update");
    expect(updateData.body.updateProject).toHaveProperty("projectname", "test update project");
    expect(updateData.body.updateProject).toHaveProperty("description", "test update description");
    expect(updateData.body.updateProject).toHaveProperty("expiresAt", "2025-10-05T14:48:00.000Z");
  })

  //error case

});

//DELETE /project/:projectId?
describe("DELETE /project/:projectId", function () {
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

  it("should delete a project by projectid",  async () => {
    let projectId;
    // Create a test project using the createTestProject function
    const createdProject = await createTestProject();

    // Log project ID for debugging
    projectId = createdProject.project_id; // Assuming project_id is returned from the createTestProject

    console.log("Created Project ID:", projectId);
    
    const result = await supertest(app)
    .delete(`/api/v1/project/${projectId}`)
    .set("Authorization", "test")

    logger.info(result)
    expect(result.status).toBe(204)
  })

  //error case
  it("should'nt delete a project by projectid bcs project not found",  async () => {
    let projectId;
    // Create a test project using the createTestProject function
    const createdProject = await createTestProject();

    // Log project ID for debugging
    projectId = createdProject.project_id; // Assuming project_id is returned from the createTestProject

    console.log("Created Project ID:", projectId);
    
    const result = await supertest(app)
    .delete(`/api/v1/project/${projectId}+1`)
    .set("Authorization", "test")

    logger.info(result)
    expect(result.status).toBe(404)
    expect(result.body.errors).toBe("Invalid Project ID")
    expect(result.body.message).toBe("Project not found")
  })
})
