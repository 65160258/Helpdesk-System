const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

// Middleware to check if user is staff
const checkStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'staff') {
        next(); // Allow access to next middleware/route
    } else {
        res.status(403).send('Access denied'); // Deny access if not staff
    }
};

// Route to get all reports
router.get('/', checkStaff, (req, res) => {
    db.query('SELECT * FROM reports', (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.render('adminReports', { reports: results });
    });
});

// Route to get edit report page
router.get('/edit/:id', checkStaff, (req, res) => {
    const reportId = req.params.id;

    db.query('SELECT * FROM reports WHERE id = ?', [reportId], (error, results) => {
        if (error) return res.status(500).send(error);
        if (results.length > 0) {
            const report = results[0];
            res.render('editReport', { report: report }); // Render edit form
        } else {
            return res.status(404).send('Report not found');
        }
    });
});

// Route to update report
router.post('/edit/:id', checkStaff, (req, res) => {
    const reportId = req.params.id;
    const { title, usageData } = req.body;

    db.query('UPDATE reports SET title = ?, usageData = ? WHERE id = ?', [title, usageData, reportId], (error) => {
        if (error) {
            return res.status(400).send(error);
        }
        res.redirect('/report'); // Redirect to report list after update
    });
});

// Route to create a new report
router.post('/', checkStaff, (req, res) => {
    const { title, usageData } = req.body;
    const date = new Date();

    const report = { title, date, usageData };
    
    db.query('INSERT INTO reports SET ?', report, (error) => {
        if (error) {
            return res.status(400).send(error);
        }
        res.redirect('/report'); // Redirect to report list after creation
    });
});

module.exports = router;
