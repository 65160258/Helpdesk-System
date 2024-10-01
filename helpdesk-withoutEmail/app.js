const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db'); // Database connection
const userRoutes = require('./routes/user'); // User routes
const { sendEmail } = require('./emailService'); // นำเข้าฟังก์ชัน


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

const ticketRoutes = require('./routes/ticket'); // Ticket routes
app.use('/tickets', ticketRoutes); // Ticket management routes

const reportRoutes = require('./routes/report'); // Report routes
app.use('/report', reportRoutes);

const queueRoutes = require('./routes/queue'); // Queue Management routes
app.use('/queues', queueRoutes);

// Redirect to the correct page based on authentication status
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/index'); // Redirect to index page if logged in
    } else {
        res.redirect('/login'); // Redirect to login page if not authenticated
    }
});

// Index Route
app.get('/index', (req, res) => {
    if (req.session.user) {
        res.render('index', { user: req.session.user }); // Render the index page if user is logged in
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

const knowledgeRoutes = require('./routes/knowledge'); // Knowledge Base routes
app.use('/knowledge', knowledgeRoutes);

const staffRoutes = require('./routes/staff'); // Staff routes
app.use('/staff', staffRoutes); // Use staff routes

// Route for staff_index page
app.get('/staff_index', (req, res) => {
    if (req.session.user && req.session.user.role === 'staff') {
        res.render('staff_index', { user: req.session.user }); // Render the staff index page if staff
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated as staff
    }
});

require('dotenv').config(); // นำเข้า dotenv
app.post('/tickets/:id/message', async (req, res) => {
    try {
        const ticketId = req.params.id;
        const staffMessage = req.body.message;

        // ดึงข้อมูล ticket และ user ที่เกี่ยวข้อง
        const ticket = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        const user = await db.query('SELECT * FROM users WHERE id = ?', [ticket[0].userId]);

        // เช็คว่าพบ user หรือไม่
        if (!user || user.length === 0) {
            return res.status(404).send('User not found.');
        }

        // ส่งอีเมลไปยัง user
        await sendEmail(user[0].email, 'New Message from Staff', `Staff has responded to your ticket: ${staffMessage}`);

        // เก็บข้อความในฐานข้อมูล
        await db.query('INSERT INTO messages (ticketId, username, message) VALUES (?, ?, ?)', [ticketId, 'staff', staffMessage]);

        res.redirect(`/tickets/${ticketId}`);
    } catch (error) {
        console.error('Error handling ticket message:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
