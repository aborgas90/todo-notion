const express = require('express')
const { handleLogout, handleGetUserData, handleGetUserDataById, handleDeleteUserById} = require('../controller/user-controller');
const { authenticationMiddleware } = require('../middleware/auth-middleware');
const router = express.Router();

// Apply authentication middleware for all routes that require it
router.use(authenticationMiddleware);

// Define the more specific logout route first
router.delete("/users/logout", handleLogout);

// Public routes that do not require authentication
router.get("/users", handleGetUserData);
router.get("/users/:userId", handleGetUserDataById);
router.delete("/users/:userId", handleDeleteUserById);
module.exports = router;