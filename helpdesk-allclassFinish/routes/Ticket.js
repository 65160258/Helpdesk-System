// routes/ticket.js
const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();

// Route to get all tickets
router.get('/', (req, res) => {
    const sql = `
        SELECT tickets.*, users.username, users.role 
        FROM tickets 
        JOIN users ON tickets.userId = users.id`; // Join to get username and role
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            return res.status(500).send('Error fetching tickets');
        }
        res.render('tickets',
             { tickets: results, user: req.session.user });
             
    });
});

// Route to add a new ticket (GET)
router.get('/add_ticket', (req, res) => {
    if (req.session.user) {
        res.render('add_ticket'); // Render add_ticket.ejs
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

// Route to create a new ticket (POST)
router.post('/add_ticket', (req, res) => {
    const { issue } = req.body; // Get issue from form

    // Get userId from session
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not authenticated
    }
    const userId = req.session.user.id; // Assuming user ID is stored in session

    const sql = 'INSERT INTO tickets (issue, status, userId) VALUES (?, "New", ?)';
    db.query(sql, [issue, userId], (err, result) => {
        if (err) {
            console.error('Error adding ticket:', err);
            return res.status(500).send('Error adding ticket');
        }
        res.redirect('/tickets'); // Redirect back to tickets management after adding
    });
});

// Edit Status Route
router.get('/:id/edit', (req, res) => {
    const ticketId = req.params.id;
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching ticket:', err);
            return res.status(500).send('Error fetching ticket');
        }
        if (results.length > 0) {
            const ticket = results[0];
            // Check if the user is staff or the owner of the ticket
            if (req.session.user && (req.session.user.role === 'staff' || ticket.userId === req.session.user.id)) {
                res.render('edit_ticket', { ticket }); // Render edit form
            } else {
                res.status(403).send('Access denied'); // Deny access if not staff or owner
            }
        } else {
            res.status(404).send('Ticket not found');
        }
    });
});

// Update Status Route
router.post('/:id/edit', (req, res) => {
    const ticketId = req.params.id;
    const newStatus = req.body.status; // Assuming you have a status input in the form
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching ticket:', err);
            return res.status(500).send('Error fetching ticket');
        }
        if (results.length > 0) {
            const ticket = results[0];
            // Check if the user is staff or the owner of the ticket
            if (req.session.user && (req.session.user.role === 'staff' || ticket.userId === req.session.user.id)) {
                const updateSql = 'UPDATE tickets SET status = ? WHERE id = ?';
                db.query(updateSql, [newStatus, ticketId], (err) => {
                    if (err) {
                        console.error('Error updating ticket status:', err);
                        return res.status(500).send('Error updating ticket status');
                    }

                    // After updating the status to 'Assigned', insert into queues
                    if (newStatus === 'Assigned') {
                        const queueSql = 'INSERT INTO queues (ticketId, priority) VALUES (?, ?)';
                        const priority = ticket.priority || 'Normal'; // Default priority if not set
                        db.query(queueSql, [ticketId, priority], (err) => {
                            if (err) {
                                console.error('Error adding ticket to queue:', err);
                                return res.status(500).send('Error adding ticket to queue');
                            }
                            console.log(`Ticket ${ticketId} added to queue with priority ${priority}`);
                            res.redirect('/tickets'); // Redirect to tickets page after update
                        });
                    } else {
                        res.redirect('/tickets'); // Redirect if status is not 'Assigned'
                    }
                });
            } else {
                res.status(403).send('Access denied'); // Deny access if not staff or owner
            }
        } else {
            res.status(404).send('Ticket not found');
        }
    });
});



// Route to delete ticket
router.post('/:id/delete', (req, res) => {
    const ticketId = req.params.id;
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching ticket:', err);
            return res.status(500).send('Error fetching ticket');
        }
        if (results.length > 0) {
            const ticket = results[0];
            // Check if the user is staff or the owner of the ticket
            if (req.session.user && (req.session.user.role === 'staff' || ticket.userId === req.session.user.id)) {
                const deleteSql = 'DELETE FROM tickets WHERE id = ?';
                db.query(deleteSql, [ticketId], (err) => {
                    if (err) {
                        console.error('Error deleting ticket:', err);
                        return res.status(500).send('Error deleting ticket');
                    }
                    res.redirect('/tickets'); // Redirect to tickets list after delete
                });
            } else {
                res.status(403).send('Access denied'); // Deny access if not staff or owner
            }
        } else {
            res.status(404).send('Ticket not found');
        }
    });
});


module.exports = router;
