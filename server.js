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
    port:'24969',
    timezone: '+05:30'
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
// 1. User Registration (Signup)
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ error: "User already exists or DB error" });
        res.json({ message: "Signup success!" });
    });
});

// 2. User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT id FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
        res.json({ userId: results[0].id, username: username });
    });
});

// 3. Get Tasks (Only for logged-in user)
app.get('/get-tasks/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM tasks WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.json(err);
        res.json(results);
    });
});

// 4. Add Task with Reminder
app.post('/add-task', (req, res) => {
    const { task, userId, reminderTime } = req.body;
    // reminderTime ni format chesi save cheddam
    const sql = "INSERT INTO tasks (task_name, user_id, reminder_time, status) VALUES (?, ?, ?, 'pending')";
    db.query(sql, [task, userId, reminderTime], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Task added!" });
    });
});
// 3. Task delete cheyadaniki (DELETE
app.delete('/delete-task/:id', (req, res) => {
    const sql = "DELETE FROM tasks WHERE id = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, result) => {
        if (err) return res.json(err);
        return res.json({ message: "Task deleted!" });
    });
});
// Task ni History ki pampadaniki (Complete)
app.put('/complete-task/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE tasks SET status = 'completed', completed_at = NOW() WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Task moved to history!" });
    });
});

// Port listen
const PORT = process.env.PORT || 5000; // Ee line marchu
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' pettadam valla external connection open avthundi
    console.log(`Server running on port ${PORT}`);
});