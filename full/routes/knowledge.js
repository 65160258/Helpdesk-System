const express = require('express');
const router = express.Router();
const db = require('../db'); // ใช้เชื่อมต่อฐานข้อมูล

router.get('/', (req, res) => {
    const sql = "SELECT * FROM knowledge_base ORDER BY created_at DESC";
    
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('knowledge_list', { knowledge: results }); // ส่งผลลัพธ์ไปยังหน้า view
    });
});


// Route สำหรับค้นหาข้อมูลใน knowledge_base
router.get('/search', (req, res) => {
    const query = req.query.query; // ดึงคำค้นหาจาก query string
    const sql = "SELECT * FROM knowledge_base WHERE question LIKE ? OR answer LIKE ?";
    const searchTerm = '%' + query + '%'; // เตรียมคำค้นหา

    db.query(sql, [searchTerm, searchTerm], (err, results) => {
        if (err) throw err;
        res.render('knowledge_list', { knowledge: results }); // ส่งผลลัพธ์การค้นหาไปที่หน้า knowledge_list
    });
});



// Route สำหรับแสดงฟอร์มเพิ่มข้อมูลใหม่
router.get('/add', (req, res) => {
    res.render('add_knowledge'); // แสดงหน้าเพิ่มข้อมูล
});

// Route สำหรับการเพิ่มข้อมูลใหม่
router.post('/add', (req, res) => {
    const { question, answer } = req.body;
    const user_id = req.session.user.id; // ดึง user_id จาก session ของผู้ใช้ที่ล็อกอิน

    const sql = "INSERT INTO knowledge_base (question, answer, user_id) VALUES (?, ?, ?)";
    db.query(sql, [question, answer, user_id], (err, result) => {
        if (err) throw err;
        res.redirect('/knowledge');
    });
});


// Route สำหรับแสดงฟอร์มแก้ไขข้อมูล
router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM knowledge_base WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.render('edit_knowledge', { knowledge: result[0] }); // ส่งข้อมูลไปที่หน้าแก้ไข
        } else {
            res.redirect('/knowledge'); // หากไม่มีข้อมูล ให้กลับไปที่หน้าหลัก
        }
    });
});


// อัปเดตข้อมูลที่มีอยู่
router.post('/update/:id', (req, res) => {
    const { question, answer } = req.body;
    const id = req.params.id;
    const sql = "UPDATE knowledge_base SET question = ?, answer = ? WHERE id = ?";
    
    db.query(sql, [question, answer, id], (err, result) => {
        if (err) throw err;
        res.redirect('/knowledge'); // เปลี่ยนเส้นทางไปยังหน้า Knowledge Base
    });
});

router.get('/', (req, res) => {
    const sql = "SELECT * FROM knowledge_base"; // Query เพื่อดึงข้อมูล
    db.query(sql, (err, results) => {
        if (err) throw err;

        // ส่งข้อมูลไปยัง EJS พร้อมกับ user
        res.render('knowledge_list', { knowledge: results, user: req.session.user });
    });
});

// Route สำหรับลบคำถาม
router.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const user = req.session.user; // เก็บค่าผู้ใช้ในตัวแปร user

    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    if (!user) {
        return res.status(403).send(`
            <p1>You must be logged in to delete information</p1>
            <button onclick="window.location.href='/login'">Login</button>
        `); // ส่งข้อความหากไม่ล็อกอิน
    }

    const sqlCheck = "SELECT user_id FROM knowledge_base WHERE id = ?";
    db.query(sqlCheck, [id], (err, result) => {
        if (err) throw err;

        // ตรวจสอบว่ามีข้อมูลใน result หรือไม่
        if (result.length > 0) {
            // ตรวจสอบว่า user_id ของคำถามตรงกับ user_id ของผู้ใช้ที่ล็อกอินหรือไม่
            if (result[0].user_id === user.id) {
                const sqlDelete = "DELETE FROM knowledge_base WHERE id = ?";
                db.query(sqlDelete, [id], (err, result) => {
                    if (err) throw err;
                    res.redirect('/knowledge'); // Redirect ไปยังหน้ารายการคำถาม
                });
            } else {
                res.status(403).send(`
                    <p1>You do not have permission to delete this question.</p1>
                    <button onclick="window.location.href='/knowledge'">Back</button>
                `);
            }
        } else {
            res.status(404).send(`
                <p1>Question not found</p1>
                <button onclick="window.location.href='/knowledge'">Back</button>
            `);
        }
    });
});

// Route แสดงรายการข้อมูล
router.get('/', (req, res) => {
    const sql = "SELECT * FROM knowledge_base";
    db.query(sql, (err, results) => {
        if (err) throw err;

        // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
        if (req.session.user) {
            res.render('knowledge_list', { knowledge: results, user: req.session.user }); // ส่งข้อมูล user ไปที่ ejs
        } else {
            res.redirect('/login'); // หากไม่ได้ล็อกอิน ให้ redirect ไปที่หน้า login
        }
    });
});


module.exports = router;
