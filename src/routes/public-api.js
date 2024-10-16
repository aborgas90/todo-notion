const express = require('express');
const {handleRegister,handleLogin,} = require('../controller/user-controller');
const publicApi = express.Router()

publicApi.post("/users/register", handleRegister);
publicApi.post("/users/login", handleLogin)

module.exports = publicApi