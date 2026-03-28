const express = require('express');
const router = express.Router();
const db = require('../../db'); // Adjust path to your db.js

//Create a Task
router.post('/', (req, res) => {
    const { title, description, status, priority, workspaceId, createdById } = req.body;
    const sql = `INSERT INTO Tasks (title, description, status, priority, workspaceId, createdById) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, description, status, priority, workspaceId, createdById], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Task added!" });
    });
});

//Get All Tasks
router.get('/', (req, res) => {
    db.all("SELECT * FROM Tasks", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;