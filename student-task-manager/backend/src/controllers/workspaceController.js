const db = require('../../db');

//Create a new Workspace
exports.createWorkspace = (req, res) => {
    // We allow ownerId from body (our frontend) or req.user.id (middleware)
    const { name, description } = req.body;
    const ownerId = req.body.ownerId || (req.user && req.user.id);

    if (!name || !ownerId) {
        return res.status(400).json({ error: "Name and ownerId are required" });
    }

    const sql = `INSERT INTO Workspaces (name, description, ownerId) VALUES (?, ?, ?)`;
    
    db.run(sql, [name, description, ownerId], function(err) {
        if (err) {
            console.error("❌ Workspace Error:", err.message);
            return res.status(500).json({ error: "Could not create workspace" });
        }
        res.status(201).json({ 
            message: "Workspace created!", 
            workspaceId: this.lastID 
        });
    });
};

//Get all Workspaces for a specific user
exports.getUserWorkspaces = (req, res) => {
    const { userId } = req.params;

    const sql = `SELECT * FROM Workspaces WHERE ownerId = ?`;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};

//Get a specific Workspace by id
exports.getWorkspaceById = (req, res) => {
    const { id } = req.params;

    const sql = `SELECT * FROM Workspaces WHERE id = ?`;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ error: "Workspace not found" });
        res.status(200).json(row);
    });
};

//Delete a Workspace
exports.deleteWorkspace = (req, res) => {
    const { id } = req.params;
    
    const sql = `DELETE FROM Workspaces WHERE id = ?`;

    db.run(sql, [id], function(err) {
        if (err) {
            console.error("❌ Workspace Delete Error:", err.message);
            return res.status(500).json({ error: "Could not delete workspace" });
        }
        res.status(200).json({ message: "Workspace deleted successfully!" });
    });
};