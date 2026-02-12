const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*', // Evvaraina access cheyochu ani permission
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // JSON data ni handle cheyadaniki

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    user: 'root',      // Nee MySQL username (usually root)
    password: 'XfTKFMFQoLkvSZKHzUbSGpiBhCIHyjXe', // Nee MySQL password ikkada ivvu
    database: 'railway',
    port:'24969'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database mama!');
});

// Basic Route (Check cheyadaniki)
// app.get('/', (req, res) => {
//     res.send('Server ready ga undi mama!');
// });
// 1. Database nundi tasks anni techukovadaniki (READ)
app.get('/get-tasks', (req, res) => {
    const sql = "SELECT * FROM tasks";
    db.query(sql, (err, results) => {
        if (err) return res.json(err);
        return res.json(results);
    });
});

// 2. Kotha task database lo add cheyadaniki (CREATE)
app.post('/add-task', (req, res) => {
    const sql = "INSERT INTO tasks (task_name) VALUES (?)";
    const values = [req.body.task];

    db.query(sql, values, (err, result) => {
        if (err) return res.json(err);
        return res.json({ message: "Task added successfully!" });
    });
});
// Task status update cheyadaniki (UPDATE)
// Task Update with History (Time)
app.put('/update-task/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Task complete ayithe current time, lekapothe null
    const completedAt = (status === 'completed') ? new Date() : null;

    const sql = "UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?";
    db.query(sql, [status, completedAt, id], (err, result) => {
        if (err) return res.json(err);
        res.json({ message: "Updated successfully" });
    });
});

// 3. Task delete cheyadaniki (DELETE)
app.delete('/delete-task/:id', (req, res) => {
    const sql = "DELETE FROM tasks WHERE id = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, result) => {
        if (err) return res.json(err);
        return res.json({ message: "Task deleted!" });
    });
});

// Port listen
const PORT = process.env.PORT || 5000; // Ee line marchu
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' pettadam valla external connection open avthundi
    console.log(`Server running on port ${PORT}`);
});