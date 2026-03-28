const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const db = require('./db'); 
const workspaceController = require('./src/controllers/workspaceController');
const taskRoutes = require('./src/routes/taskRoutes'); 

const app = express();

app.post('/api/workspaces', workspaceController.createWorkspace);
app.get('/api/workspaces/:userId', workspaceController.getUserWorkspaces);
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/debug-users', (req, res) => {
    db.all("SELECT * FROM Users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.post('/workspaces', (req, res) => {
    const { name, description, ownerId } = req.body;
    const sql = `INSERT INTO Workspaces (name, description, ownerId) VALUES (?, ?, ?)`;
    
    db.run(sql, [name, description, ownerId], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Workspace created!" });
    });
});


app.use('/tasks', taskRoutes);