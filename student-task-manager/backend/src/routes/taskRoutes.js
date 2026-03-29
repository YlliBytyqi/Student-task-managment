const express = require('express');
const router = express.Router();
const db = require('../../db');
const verifyToken = require('../middleware/authMiddleware');

const checkWorkspaceAccess = (workspaceId, userId, callback) => {
    const accessSql = `
        SELECT DISTINCT Workspaces.id
        FROM Workspaces
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Workspaces.id = ?
          AND (
              Workspaces.ownerId = ?
              OR WorkspaceMembers.userId = ?
          )
    `;

    db.get(accessSql, [workspaceId, userId, userId], callback);
};

router.get('/workspace/:workspaceId', verifyToken, (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    checkWorkspaceAccess(workspaceId, userId, (accessErr, workspace) => {
        if (accessErr) {
            console.error('Task Access Check Error:', accessErr.message);
            return res.status(500).json({ error: accessErr.message });
        }

        if (!workspace) {
            return res.status(403).json({ error: 'Access denied or workspace not found' });
        }

        db.all(`SELECT * FROM Tasks WHERE workspaceId = ?`, [workspaceId], (err, rows) => {
            if (err) {
                console.error('Get Tasks Error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        });
    });
});

router.get('/:taskId', verifyToken, (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    const sql = `
        SELECT Tasks.*
        FROM Tasks
        JOIN Workspaces ON Tasks.workspaceId = Workspaces.id
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Tasks.id = ?
          AND (
              Workspaces.ownerId = ?
              OR WorkspaceMembers.userId = ?
          )
    `;

    db.get(sql, [taskId, userId, userId], (err, task) => {
        if (err) {
            console.error('Get Single Task Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!task) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        res.json(task);
    });
});

router.post('/', verifyToken, (req, res) => {
    const { title, description, status, priority, workspaceId, assignedToId } = req.body;
    const userId = req.user.id;

    if (!title || !workspaceId) {
        return res.status(400).json({ error: 'Title and workspaceId are required' });
    }

    checkWorkspaceAccess(workspaceId, userId, (accessErr, workspace) => {
        if (accessErr) {
            console.error('Task Create Access Error:', accessErr.message);
            return res.status(500).json({ error: accessErr.message });
        }

        if (!workspace) {
            return res.status(403).json({ error: 'Access denied or workspace not found' });
        }

        const sql = `
            INSERT INTO Tasks (title, description, status, priority, workspaceId, assignedToId)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                title,
                description || null,
                status || 'pending',
                priority || 'medium',
                workspaceId,
                assignedToId || null
            ],
            function (err) {
                if (err) {
                    console.error('Create Task Error:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                    message: 'Task created successfully',
                    id: this.lastID
                });
            }
        );
    });
});

router.put('/:taskId', verifyToken, (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedToId } = req.body;
    const userId = req.user.id;

    const findSql = `
        SELECT Tasks.*
        FROM Tasks
        JOIN Workspaces ON Tasks.workspaceId = Workspaces.id
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Tasks.id = ?
          AND (
              Workspaces.ownerId = ?
              OR WorkspaceMembers.userId = ?
          )
    `;

    db.get(findSql, [taskId, userId, userId], (findErr, task) => {
        if (findErr) {
            console.error('Find Task Error:', findErr.message);
            return res.status(500).json({ error: findErr.message });
        }

        if (!task) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        const updatedTitle = title ?? task.title;
        const updatedDescription = description ?? task.description;
        const updatedStatus = status ?? task.status;
        const updatedPriority = priority ?? task.priority;
        const updatedAssignedToId = assignedToId ?? task.assignedToId;

        const updateSql = `
            UPDATE Tasks
            SET title = ?, description = ?, status = ?, priority = ?, assignedToId = ?
            WHERE id = ?
        `;

        db.run(
            updateSql,
            [
                updatedTitle,
                updatedDescription,
                updatedStatus,
                updatedPriority,
                updatedAssignedToId,
                taskId
            ],
            function (updateErr) {
                if (updateErr) {
                    console.error('Update Task Error:', updateErr.message);
                    return res.status(500).json({ error: updateErr.message });
                }

                res.json({ message: 'Task updated successfully' });
            }
        );
    });
});

router.delete('/:taskId', verifyToken, (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    const findSql = `
        SELECT Tasks.*
        FROM Tasks
        JOIN Workspaces ON Tasks.workspaceId = Workspaces.id
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Tasks.id = ?
          AND (
              Workspaces.ownerId = ?
              OR WorkspaceMembers.userId = ?
          )
    `;

    db.get(findSql, [taskId, userId, userId], (findErr, task) => {
        if (findErr) {
            console.error('Find Task For Delete Error:', findErr.message);
            return res.status(500).json({ error: findErr.message });
        }

        if (!task) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        db.run(`DELETE FROM Tasks WHERE id = ?`, [taskId], function (deleteErr) {
            if (deleteErr) {
                console.error('Delete Task Error:', deleteErr.message);
                return res.status(500).json({ error: deleteErr.message });
            }

            res.json({ message: 'Task deleted successfully' });
        });
    });
});

module.exports = router;