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

//Get all Workspaces for a specific user (Owned or Assigned to)
exports.getUserWorkspaces = (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT DISTINCT Workspaces.* 
        FROM Workspaces 
        LEFT JOIN Tasks ON Workspaces.id = Tasks.workspaceId 
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Workspaces.ownerId = ? 
           OR Tasks.assignedToId = ?
           OR WorkspaceMembers.userId = ?
    `;
    
    db.all(sql, [userId, userId, userId], (err, rows) => {
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

// --- WORKSPACE MEMBERS MANAGEMENT ---

exports.getWorkspaceMembers = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT Users.id, Users.fullName, Users.email 
        FROM WorkspaceMembers 
        JOIN Users ON WorkspaceMembers.userId = Users.id 
        WHERE WorkspaceMembers.workspaceId = ?
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.addWorkspaceMember = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Validate if the requestor is the owner
    const checkOwnerSql = `SELECT ownerId FROM Workspaces WHERE id = ?`;
    db.get(checkOwnerSql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Workspace not found" });

        // Proceed to insert the member
        const insertSql = `INSERT INTO WorkspaceMembers (workspaceId, userId) VALUES (?, ?)`;
        db.run(insertSql, [id, userId], function(err2) {
            if (err2) {
                // If it's a UNIQUE constraint error, they are already a member
                if (err2.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "User is already a member" });
                }
                return res.status(500).json({ error: err2.message });
            }
            res.status(201).json({ message: "Member added successfully" });
        });
    });
};

exports.removeWorkspaceMember = (req, res) => {
    const { id, userId } = req.params;
    
    // Remove member from WorkspaceMembers
    const deleteSql = `DELETE FROM WorkspaceMembers WHERE workspaceId = ? AND userId = ?`;
    db.run(deleteSql, [id, userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Edge Case Handling: Unassign tasks and leave a Progress Note trail
        const updateTasksSql = `
            UPDATE Tasks 
            SET assignedToId = NULL, 
                progressNotes = COALESCE(progressNotes, '') || char(10) || char(10) || '[Sistemi]: Përdoruesi u përjashtua nga projekti. Kjo detyrë ka ngelur jetime (Unassigned).'
            WHERE workspaceId = ? AND assignedToId = ?
        `;
        db.run(updateTasksSql, [id, userId], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            
            res.json({ message: "Member removed and tasks unassigned successfully" });
        });
    });
};