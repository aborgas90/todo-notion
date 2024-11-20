// server.js
const app = require('./app');
const connectDatabase = require('./database/database.js'); // Pastikan path ini benar
const port = process.env.PORT || 3041;

// Connect to the database
connectDatabase();

// Log the current environment
if (process.env.NODE_ENV === 'development') {
    console.log(`Development environment detected. NODE_ENV = ${process.env.NODE_ENV}`, true);
} else if (process.env.NODE_ENV === 'test') {
    console.log(`Test environment detected. NODE_ENV = ${process.env.NODE_ENV}`, true);
}

// Start the server
app.listen(port, () => {
    console.log(`🌍 App listening on port ${port}`);
});
