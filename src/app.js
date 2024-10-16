const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user-api.js')
const publicRouter = require('../src/routes/public-api.js')
const connectDatabase = require('../src/database/database.js')
const { errorMiddleware } = require('./middleware/error-middleware.js')
const todoRouter = require('./routes/api.js')
const app = express()
const port = 3000

// dbConnect()
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/", publicRouter)
app.use("/api/v1/", userRouter);
app.use("/api/v1/", todoRouter)
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`App listening on port ${port}`), connectDatabase
})

// Export the app, not the server
module.exports = app;