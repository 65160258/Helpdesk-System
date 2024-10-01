// routes/queue.js
const express = require('express');
const db = require('../db'); // Database connection
const router = express.Router();


router.get('/', (req, res) => {
    const queuesSql = 'SELECT * FROM queues';
    db.query(queuesSql, (err, queues) => {
        if (err) {
            console.error('Error fetching queues:', err);
            return res.status(500).send('Error fetching queues');
        }

        const ticketsSql = 'SELECT * FROM tickets';
        db.query(ticketsSql, (err, tickets) => {
            if (err) {
                console.error('Error fetching tickets:', err);
                return res.status(500).send('Error fetching tickets');
            }

            res.render('queues', { queues, tickets });
        });
    });
});



// Assign staff to a queue
router.post('/:queueId/assign', async (req, res) => {
    const { staffId } = req.body;
    const { queueId } = req.params;
    
    try {
        await db.promise().query('UPDATE queues SET assigned_staff_id = ? WHERE id = ?', [staffId, queueId]);
        res.redirect('/queues');
    } catch (err) {
        console.error('Error assigning staff to queue:', err);
        res.status(500).send('Error assigning staff to queue');
    }
});

// routes/queue.js

// Get the edit page for a specific queue
router.get('/:id/edit', (req, res) => {
    const queueId = req.params.id;

    const queueSql = 'SELECT * FROM queues WHERE id = ?';
    const ticketsSql = 'SELECT * FROM tickets';

    db.query(queueSql, [queueId], (err, queueResults) => {
        if (err) {
            console.error('Error fetching queue:', err);
            return res.status(500).send('Error fetching queue');
        }

        if (queueResults.length === 0) {
            return res.status(404).send('Queue not found');
        }

        const queue = queueResults[0];

        db.query(ticketsSql, (err, tickets) => {
            if (err) {
                console.error('Error fetching tickets:', err);
                return res.status(500).send('Error fetching tickets');
            }

            res.render('editQueue', { queue, tickets });
        });
    });
});

// Update queue priority
router.post('/:id/update', async (req, res) => {
    const { priority } = req.body; // Get the priority from the form
    const { id } = req.params; // Get the queue ID from the URL parameters

    try {
        // Update the queue priority in the database
        await db.promise().query('UPDATE queues SET priority = ? WHERE id = ?', [priority, id]);
        res.redirect('/queues'); // Redirect to the queues page after updating
    } catch (err) {
        console.error('Error updating queue priority:', err);
        res.status(500).send('Error updating queue priority'); // Handle errors
    }
});


module.exports = router;
