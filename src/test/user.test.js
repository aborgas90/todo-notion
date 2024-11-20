const supertest = require("supertest");
const app = require("../app.js");
const prismaClient = require("../prisma-client.js");
const { logger } = require("../logging.js");
const {
  removeTestUser,
  createTestUser,
  getTestUser,
} = require("./test-utils.js");

beforeAll(async () => {
  await prismaClient.$connect();
});

afterAll(async () => {
  await prismaClient.$disconnect();
});

describe("POST /api/v1/users/register", function () {
  afterEach(async () => {
    await removeTestUser();
  });

  it("should can register new user", async () => {
    const result = await supertest(app).post("/api/v1/users/register").send({
      email: "test@gmail.com",
      username: "test",
      password: "test",
    });

    logger.info(result.body);

    expect(result.status).toBe(201);
    expect(result.body.data.email).toBe("test@gmail.com");
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.password).toBeUndefined();
  });

  it("should reject if request is invalid", async () => {
    const result = await supertest(app).post("/api/v1/users/register").send({
      email: "",
      username: "",
      password: "",
    });

    logger.info(result.body);

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if username already registered", async () => {
    let result = await supertest(app).post("/api/v1/users/register").send({
      username: "test",
      email: "test@gmail.com",
      password: "test",
    });

    logger.info(result.body);

    expect(result.status).toBe(201);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.email).toBe("test@gmail.com");
    expect(result.body.data.password).toBeUndefined();

    result = await supertest(app).post("/api/v1/users/register").send({
      username: "test",
      email: "test@gmail.com",
      password: "test",
    });

    logger.info(result.body);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("POST /api/v1/users/login", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it("should can login ", async () => {
    const result = await supertest(app).post("/api/v1/users/login").send({
      username: "test",
      password: "test",
    });

    logger.info(result.body);
    expect(result.status).toBe(200);
    expect(result.body.token).toBeDefined();
    expect(result.body.token).not.toBe("test");
  });

  it("should reject login if request is invalid", async () => {
    const result = await supertest(app).post("/api/v1/users/login").send({
      username: "",
      password: "",
    });

    logger.info(result.body);
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should reject login if password wrong", async () => {
    const result = await supertest(app).post("/api/v1/users/login").send({
      username: "test",
      password: "salah",
    });

    logger.info(result.body);
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });

  it("should reject login if username wrong", async () => {
    const result = await supertest(app).post("/api/v1/users/login").send({
      username: "salah",
      password: "test",
    });

    logger.info(result.body);
    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("DELETE /api/v1/users/logout", function () {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  it("should be logout", async () => {
    const result = await supertest(app)
      .delete("/api/v1/users/logout")
      .set("Authorization", "test");

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("Logout Succesfully");

    const user = await getTestUser();
    console.log("where's tokens :: ", user);
    expect(user.token).toBeNull();
  });
});
