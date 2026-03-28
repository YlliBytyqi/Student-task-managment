const db = require('../../db');

//Create a new Workspace
exports.createWorkspace = (req, res) => {
    const { name, description, ownerId } = req.body;

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