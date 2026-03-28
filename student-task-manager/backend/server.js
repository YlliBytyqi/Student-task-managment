const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const db = require('./db'); 
const workspaceController = require('./src/controllers/workspaceController');
const taskRoutes = require('./src/routes/taskRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth
app.use('/api/auth', authRoutes);

// Workspaces
app.post('/api/workspaces', workspaceController.createWorkspace);
app.get('/api/workspaces/:userId', workspaceController.getUserWorkspaces);
app.get('/api/workspaces/single/:id', workspaceController.getWorkspaceById);
app.delete('/api/workspaces/:id', workspaceController.deleteWorkspace);

// Tasks
app.use('/api/tasks', taskRoutes);

// Utilities
app.get('/debug-users', (req, res) => {
    db.all("SELECT * FROM Users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/', (req, res) => {
    res.send('Mirësevini në Serverin e Student Task Manager! API është aktiv. 🚀');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});