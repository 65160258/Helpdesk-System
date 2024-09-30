// app.js
const express = require('express');
const session = require('express-session');
const userRoutes = require('./routes/user'); // Ensure this path is correct
const app = express();
const port = 3000;

// Set the view engine
app.set('view engine', 'ejs');

// Middleware for sessions
app.use(session({
    secret: 'your-secret-key', // Change to a strong secret key
    resave: false,
    saveUninitialized: true
}));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static('public'));

// Route for the root URL
app.get('/', (req, res) => {
    res.redirect('/user/login'); // Redirect to the login page
});

// Use user routes
app.use('/user', userRoutes); // Prefixing with /user

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
