const bcrypt = require("bcrypt");
const prismaClient = require("../prisma-client");
const {ResponseError} = require("../error/error-response");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const authentication = async ({ username, password }) => {
  try {
    const userFinding = await findUser({ username });
    const User = await prismaClient.user.findUnique({
      where: {
        username: userFinding.username,
      },
      select: {
        username: true,
        password: true,
      },
    });
    if (!User) {
      throw new ResponseError(401, "User Not Found");
    }
    const isPassworrdvalid = await bcrypt.compare(
      password,
      userFinding.password
    );

    if (!isPassworrdvalid) {
      throw new ResponseError(401, "Username or Password wrong");
    }

    const token = uuidv4().toString();

    const updatedUser = await prismaClient.user.update({
      data: {
        token: token,
      },
      where: {
        username: userFinding.username,
      },
      select: {
        token: true,
      },
    });


    return updatedUser;
  } catch (error) {
    if (error instanceof ResponseError) {
      throw error; // Re-throw custom errors
    }
    throw new ResponseError(500, "Internal Server Error");
  }
};

const createUser = async ({ user_id, username, email, password }) => {
  try {
    const passwordHashed = await bcrypt.hash(password, 10);
    const createUser = await prismaClient.user.create({
      data: {
        user_id,
        username,
        email,
        password: passwordHashed,
      },
    });

    console.log("Buat User Register ::",createUser)

    return createUser;
  } catch (error) {
    console.log("Error Creating User", error);
    throw error; //500
  }
};

const findUser = async ({ user_id, username, email }) => {
  try {
    if (user_id) {
      return await prismaClient.user.findUnique({
        where: { user_id },
      });
    } else if (username) {
      return await prismaClient.user.findUnique({
        where: { username },
      });
    } else if (email) {
      return await prismaClient.user.findUnique({
        where: { email },
      });
    } else {
      throw new Error("Invalid parameters. Specify either id, username, or email");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const getUser = async () => {
  try {
    const user = await prismaClient.user.findMany({});
    return user;
  } catch (error) {
    throw new Error("Gagal mendapatkan data Users", error);
  }
};

const getUserById = async (user_id) => {
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        user_id: user_id,
      },
      select: {
        email: true,
        username: true,
        password: true,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
};

const logoutUser = async({username}) => {
  try {
    const userFinding = await findUser({ username });

    if (!userFinding) {
      throw new ResponseError(404, "User not found");
    }

    const user = await prismaClient.user.findUnique({
      where: {
          username: userFinding.username
      }
  });
    if(!user){
      throw  ResponseError(404,"user not found")
    }

    const logoutUser = await prismaClient.user.update({
      where : {
        username : userFinding.username
      },
      data : {
        token : null
      },
      select : {
        username: true
      }
    })

    return logoutUser
  } catch (error) {
    console.log(error)
  }
}

const deleteUserByID = async(user_id) => {
  try {
    const deleteUser = await prismaClient.user.deleteMany({
      where : {
        user_id
      }
    })

    return deleteUser
  } catch (error) {
    console.log("Cannot delete User",error)
  }
}

module.exports = {
  createUser,
  findUser,
  getUser,
  getUserById,
  authentication,
  logoutUser,
  deleteUserByID
};
