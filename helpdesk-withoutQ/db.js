// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Change as necessary
    database: 'helpdesk_system'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

module.exports = db;
