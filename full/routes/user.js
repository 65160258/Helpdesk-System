const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Database connection
const router = express.Router();

// Registration Route
router.get('/signup', (req, res) => {
    res.render('signup'); // Render signup form
});

router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    // Check for existing username or email
    const existingUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(existingUserQuery, [username, email], async (err, results) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).send('Internal Server Error'); // Handle existing user
        }

        if (results.length > 0) {
            return res.send('Username or email already exists.'); // Handle existing user
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
        db.query(sql, [username, hashedPassword, email, 'user'], (err, result) => {
            if (err) {
                console.error('Error during user registration:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/login');
        });
    });
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login'); // Render login form
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Store user ID and other info in session
                req.session.userId = user.id; // Store user ID for later use
                req.session.user = user; // Store full user info in session
                res.redirect('/index'); // Redirect to index upon successful login
            } else {
                res.send('Invalid credentials');
            }
        } else {
            res.send('User not found');
        }
    });
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.redirect('/index'); 
        }
        res.redirect('/login'); // Redirect to login after logout
    });
});

module.exports = router;
