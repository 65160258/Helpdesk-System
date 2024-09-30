// routes/user.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Ensure this points to your database connection
const router = express.Router();

// Route to serve the signup page
router.get('/signup', (req, res) => {
    res.render('signup'); // signup.ejs form for user registration
});

// Handle user registration
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    // Check for existing username or email
    const checkSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkSql, [username, email], async (err, results) => {
        if (err) throw err;
        
        if (results.length > 0) {
            return res.send('Username or Email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
        db.query(sql, [username, hashedPassword, email, 'user'], (err) => {
            if (err) throw err;
            res.redirect('/user/login');
        });
    });
});

// Route to serve the login page
router.get('/login', (req, res) => {
    res.render('login'); // login.ejs form for user login
});

// Handle user login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.user = user; // Store user info in session
                res.redirect('/user/index'); // Redirect to index.ejs upon successful login
            } else {
                res.send('Invalid credentials');
            }
        } else {
            res.send('User not found');
        }
    });
});

// Route to serve the index page
router.get('/index', (req, res) => {
    if (req.session.user) {
        res.render('index', { user: req.session.user }); // Pass user data to the view
    } else {
        res.redirect('/user/login'); // Redirect to login if not authenticated
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user/index'); // Redirect to index if error occurs
        }
        res.redirect('/user/login'); // Redirect to login after logout
    });
});

module.exports = router;
