const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();

// Create Ticket Route
router.get('/create', (req, res) => {
    res.render('create_ticket'); // Render create ticket form
});

router.post('/create', (req, res) => {
    const { issue } = req.body;
    const userId = req.session.user.id; // Assuming user ID is stored in session

    const sql = 'INSERT INTO tickets (userId, issue) VALUES (?, ?)';
    db.query(sql, [userId, issue], (err, result) => {
        if (err) throw err;
        res.redirect('/tickets'); // Redirect to tickets page after creation
    });
});

// View Tickets Route
router.get('/', (req, res) => {
    const userId = req.session.user.id;

    const sql = 'SELECT * FROM tickets WHERE userId = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) throw err;
        res.render('tickets', { tickets: results }); // Render tickets page
    });
});

// More ticket-related routes can be added here

module.exports = router;
