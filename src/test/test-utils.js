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

const createTestUser = async()=> {
    await prismaClient.user.create({
        data: {
            email  : "test@gmail.com",
            username: "test",
            password: await bcrypt.hash("test", 10),
            token: "test"
        }
    })
}

const getTestUser = async () => {
  return prismaClient.user.findUnique({
      where: {
          username: "test"
      }
  });
}

module.exports = {
  removeTestUser,
  createTestUser,
  getTestUser
};
