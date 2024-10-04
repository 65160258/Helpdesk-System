const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Add Staff Route
router.get('/add', (req, res) => {
    res.render('add_staff'); // Render the add staff page
});

router.post('/add', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, 'staff'], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating staff user');
        }
        res.redirect('/index'); // Redirect to index or staff list page
    });
});

module.exports = router;
