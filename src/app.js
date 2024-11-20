// app.js
const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/user-api.js');
const publicRouter = require('./routes/public-api.js');
const { errorMiddleware } = require('./middleware/error-middleware.js');
const dotenv = require('dotenv');
const todoRouter = require('./routes/api.js');

const app = express();

// Load environment variables based on NODE_ENV
switch (process.env.NODE_ENV) {
    case 'test':
        dotenv.config({ path: '.env.test' });
        break;
    case 'development':
    default:
        dotenv.config({ path: '.env.development' });
        break;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/", publicRouter);
app.use("/api/v1/", userRouter);
app.use("/api/v1/", todoRouter);

// Error middleware
app.use(errorMiddleware);

// Test route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Export the app
module.exports = app;
