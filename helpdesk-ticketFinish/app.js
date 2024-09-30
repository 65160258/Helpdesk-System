const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db'); // Database connection
const userRoutes = require('./routes/user'); // User routes
const ticketRoutes = require('./routes/ticket'); // Ticket routes

const app = express();
const port = 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Directory for your EJS templates

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key', // Change this to a strong secret in production
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Routes
app.use('/', userRoutes); // User-related routes
app.use('/tickets', ticketRoutes); // Ticket management routes

// Redirect to login page on root
app.get('/', (req, res) => {
    res.redirect('/login'); 
});

// Index Route (Add this route)
app.get('/index', (req, res) => {
    if (req.session.user) {
        res.render('index', { user: req.session.user }); // Render the index page if user is logged in
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


