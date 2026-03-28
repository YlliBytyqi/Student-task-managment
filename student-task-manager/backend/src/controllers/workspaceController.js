const db = require('../../db');

exports.createWorkspace = (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const sql = `
        INSERT INTO Workspaces (name, description, ownerId)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, description || null, ownerId], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            message: 'Workspace created successfully'
        });
    });
};

exports.getAllWorkspaces = (req, res) => {
    const sql = `
        SELECT Workspaces.*, Users.fullName AS ownerName, Users.email AS ownerEmail
        FROM Workspaces
        JOIN Users ON Workspaces.ownerId = Users.id
        ORDER BY Workspaces.id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
};

exports.getWorkspaceById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT Workspaces.*, Users.fullName AS ownerName, Users.email AS ownerEmail
        FROM Workspaces
        JOIN Users ON Workspaces.ownerId = Users.id
        WHERE Workspaces.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.json(row);
    });
};

exports.updateWorkspace = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const sql = `
        UPDATE Workspaces
        SET name = ?, description = ?
        WHERE id = ?
    `;

    db.run(sql, [name, description || null, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.json({ message: 'Workspace updated successfully' });
    });
};

exports.deleteWorkspace = (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM Workspaces WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.json({ message: 'Workspace deleted successfully' });
    });
};