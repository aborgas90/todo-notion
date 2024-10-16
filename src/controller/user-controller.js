const {
  findUser,
  getUser,
  createUser,
  authentication,
  getUserById,
  logoutUser,
  deleteUserByID,
} = require("../services/user-services");

const { validationResult } = require("express-validator");

const handleRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, username, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({message: "Missing required fields",
        errors: {
          email: email ? null : "Email is required",
          username: username ? null : "Username is required",
          password: password ? null : "Password is required",
        },});
    }
    
    const userEmail = await findUser({ email });
    const userName = await findUser({ username });

    if (userEmail) {
      return res.status(400).json({
        errors: {
          email: "Email already registered",
        },
      });
    } else if (userName) {
      return res.status(400).json({
        errors: {
          username: "Username already registered",
        },
      });
    }

    await createUser({ username, email, password });
    res.status(201).json({
      status: 201,
      message: "Registration Successful",
      data: {
        username,
        email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        errors: "Unable to login",
        message: "Username and password are required!",
      });
    }

    const user = await findUser({ username });
    if (!user || !user.email || !user.password) {
      return res.status(401).json({
        errors : "Unable to login",
        message: "Invalid username or password!",
      });
    }

    const loginUser = await authentication({ username, password });
    const { token } = loginUser;
    res.status(200).json({ status : 200,message: "Login Successful", token });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    const username = req.user.username;
    console.log('username ::',username)
    // const finder = await findUser(username)
    await logoutUser({ username });
    res.status(200).json({ data: "Logout Succesfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleGetUserData = async (req, res, next) => {
  try {
    const User = await getUser();
    res.status(200).json({ User });
  } catch (error) {
    next(error);
  }
};

const handleGetUserDataById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Invalid User ID", message: "Invalid Request" });
    }
    const user = await getUserById(userId);
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ error: "user not found", message: "invalid user ID" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const handleDeleteUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Invalid User ID", message: "User Id required!" });
    }

    await deleteUserByID(userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetUserData,
  handleGetUserDataById,
  handleDeleteUserById,
};
