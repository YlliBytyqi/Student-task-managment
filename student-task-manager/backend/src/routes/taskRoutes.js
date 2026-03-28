const express = require('express');
const router = express.Router();
const db = require('../../db');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

router.post('/', verifyToken, (req, res) => {
    const { title, description, status, priority, workspaceId } = req.body;
    const createdById = req.user.id;

    if (!title || !workspaceId) {
        return res.status(400).json({ error: 'title and workspaceId are required' });
    }

    const sql = `
        INSERT INTO Tasks (title, description, status, priority, workspaceId, createdById)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [title, description || null, status || 'todo', priority || 'medium', workspaceId, createdById],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Task added successfully' });
        }
    );
});

router.get('/', verifyToken, (req, res) => {
    const sql = `
        SELECT Tasks.*, Workspaces.name AS workspaceName, Users.fullName AS createdByName
        FROM Tasks
        JOIN Workspaces ON Tasks.workspaceId = Workspaces.id
        JOIN Users ON Tasks.createdById = Users.id
        ORDER BY Tasks.id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT Tasks.*, Workspaces.name AS workspaceName, Users.fullName AS createdByName
        FROM Tasks
        JOIN Workspaces ON Tasks.workspaceId = Workspaces.id
        JOIN Users ON Tasks.createdById = Users.id
        WHERE Tasks.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Task not found' });
        res.json(row);
    });
});

router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const sql = `
        UPDATE Tasks
        SET title = ?, description = ?, status = ?, priority = ?
        WHERE id = ?
    `;

    db.run(sql, [title, description || null, status || 'todo', priority || 'medium', id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });

        res.json({ message: 'Task updated successfully' });
    });
});

// Delete Task
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM Tasks WHERE id = ?`, [id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });

        res.json({ message: 'Task deleted successfully!' });
    });
});

module.exports = router;