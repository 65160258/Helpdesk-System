// routes/ticket.js
const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();
const sendEmail = require('./sendEmail'); // Import the sendEmail function

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
                            res.redirect('/queues'); // Redirect to tickets page after update
                        });
                    } else {
                        res.redirect('/queues'); // Redirect if status is not 'Assigned'
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

router.post('/:id/update-status', async (req, res) => {
    const ticketId = req.params.id;
    const newStatus = req.body.status;

    try {
        // ดึงข้อมูลตั๋วและผู้ใช้
        const ticket = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        const user = await db.query('SELECT * FROM users WHERE id = ?', [ticket[0].userId]);

        // อัปเดตสถานะในฐานข้อมูล
        await db.query('UPDATE tickets SET status = ? WHERE id = ?', [newStatus, ticketId]);

        // ส่งอีเมลแจ้งเตือนผู้ใช้
        await sendStatusChangeEmail(user[0].email, ticketId, newStatus);

        // เปลี่ยนเส้นทางกลับไปที่หน้าตั๋ว
        res.redirect(`/tickets/${ticketId}`);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/:id/message', async (req, res) => {
    const ticketId = req.params.id;
    const message = req.body.message;

    // Check if message is not empty
    if (!message) {
        return res.status(400).send('Message cannot be empty');
    }

    // Update the ticket with the staff message
    const sql = `UPDATE tickets SET messages = CONCAT(IFNULL(messages, ''), '\nStaff: ', ?) WHERE id = ?`;
    db.query(sql, [message, ticketId], async (err, result) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).send('Error sending message');
        }

        // Fetch staff email (assuming you have it stored in the session)
        const staffEmail = req.session.user.email; // Get staff email from session (or adjust as needed)

        // Send email notification
        try {
            await sendEmail(
                staffEmail, // Recipient email address
                `ticket ID : ${ticketId}`, // Subject of the email
                `${message}` // Email body
            );
        } catch (error) {
            console.error('Failed to send email:', error);
            return res.status(500).send('Error sending email notification');
        }

        // Fetch the ticket details for rendering
        const ticketDetailsSql = 'SELECT * FROM tickets WHERE id = ?';
        db.query(ticketDetailsSql, [ticketId], (err, ticketResults) => {
            if (err) {
                console.error('Error fetching ticket details:', err);
                return res.status(500).send('Error fetching ticket details');
            }
            if (ticketResults.length === 0) {
                return res.status(404).send('Ticket not found');
            }

            // Render the reply_ticket.ejs page with ticket details
            res.render('reply_ticket', {
                ticket: ticketResults[0], // ส่งข้อมูลตั๋ว
                message: message, // ส่งข้อความไปด้วย
                user: req.session.user // ส่งข้อมูลผู้ใช้ไปด้วย
            });
        });
    });
});



router.post('/:id/reply', (req, res) => {
    const ticketId = req.params.id; // Get the ticket ID from the URL
    const message = req.body.message; // Get the message from the request body
    const userId = req.session.userId; // Get the user ID from the session

    if (!message) {
        return res.status(400).send('Message cannot be empty');
    }

    // Fetch user's email based on userId from the session
    const userSql = 'SELECT email FROM users WHERE id = ?';
    db.query(userSql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user email:', err);
            return res.status(500).send('Error fetching user email');
        }
        if (results.length === 0) {
            console.error('No user found with ID:', userId);
            return res.status(404).send('User not found');
        }

        const userEmail = results[0].email; // Get the user's email

        // Update the ticket with the user's reply
        const sql = `UPDATE tickets SET messages = CONCAT(IFNULL(messages, ''), '\nUser: ', ?) WHERE id = ?`;
        db.query(sql, [message, ticketId], (err, result) => {
            if (err) {
                console.error('Error sending reply:', err);
                return res.status(500).send('Error sending reply');
            }

            // Send email notification using user's email as sender
            sendEmail(userEmail, 
                `ticket ID : ${ticketId}`, 
                `${message}`)
                .then(() => {
                    // Fetch the ticket details for rendering
                    const ticketDetailsSql = 'SELECT * FROM tickets WHERE id = ?';
                    db.query(ticketDetailsSql, [ticketId], (err, ticketResults) => {
                        if (err) {
                            console.error('Error fetching ticket details:', err);
                            return res.status(500).send('Error fetching ticket details');
                        }
                        if (ticketResults.length === 0) {
                            return res.status(404).send('Ticket not found');
                        }

                        // Render the reply_ticket.ejs page with ticket details
                        res.render('reply_ticket', {
                            ticket: ticketResults[0], // ส่งข้อมูลตั๋ว
                            message: message,
                            user: req.session.user // ส่งข้อมูลผู้ใช้ไปด้วย
                        });
                    });
                })
                .catch(error => {
                    console.error('Failed to send email:', error);
                    res.status(500).send('Error sending email notification');
                });
        });
    });
});



// Route to display the reply page for a specific ticket
router.get('/:id/reply', (req, res) => {
    const ticketId = req.params.id;

    // Fetch the ticket details from the database
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error('Error fetching ticket:', err);
            return res.status(500).send('Error fetching ticket');
        }

        if (results.length === 0) {
            return res.status(404).send('Ticket not found');
        }

        const ticket = results[0];
        res.render('reply_ticket', { ticket, user: req.session.user }); // Render the reply page with the ticket details and user info
    });
});



module.exports = router;
