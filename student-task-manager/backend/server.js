const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const db = require('./db'); 
const workspaceController = require('./src/controllers/workspaceController');

const app = express();

// Workspace Routes
app.post('/api/workspaces', workspaceController.createWorkspace);
app.get('/api/workspaces/:userId', workspaceController.getUserWorkspaces);
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Simple test route to see all users in your browser
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