const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const authRoutes = require('./src/routes/authRoutes');
const workspaceRoutes = require('./src/routes/workspaceRoutes'); // We will use this file!
const taskRoutes = require('./src/routes/taskRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes); 
app.use('/api/tasks', taskRoutes);

app.get('/debug-users', (req, res) => {
    db.all("SELECT * FROM Users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Ruta kryesore që të mos dalë "Cannot GET /"
app.get('/', (req, res) => {
    res.send('Mirësevini në Serverin e Student Task Manager! API është aktiv. 🚀');
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});