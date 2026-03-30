const db = require('../../db');

exports.createWorkspace = (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user?.id;

    if (!name) {
        return res.status(400).json({ error: 'Workspace name is required' });
    }

    if (!ownerId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `INSERT INTO Workspaces (name, description, ownerId) VALUES (?, ?, ?)`;

    db.run(sql, [name, description || null, ownerId], function (err) {
        if (err) {
            console.error('Create Workspace Error:', err.message);
            return res.status(500).json({ error: 'Could not create workspace' });
        }

        res.status(201).json({
            message: 'Workspace created!',
            workspaceId: this.lastID,
        });
    });
};

exports.getAllWorkspaces = (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `
        SELECT DISTINCT Workspaces.*
        FROM Workspaces
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Workspaces.ownerId = ?
           OR WorkspaceMembers.userId = ?
        ORDER BY Workspaces.id DESC
    `;

    db.all(sql, [userId, userId], (err, rows) => {
        if (err) {
            console.error('Get Workspaces Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
};

// Get single workspace by id if user has access
exports.getWorkspaceById = (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `
        SELECT DISTINCT Workspaces.*
        FROM Workspaces
        LEFT JOIN WorkspaceMembers ON Workspaces.id = WorkspaceMembers.workspaceId
        WHERE Workspaces.id = ?
          AND (
              Workspaces.ownerId = ?
              OR WorkspaceMembers.userId = ?
          )
    `;

    db.get(sql, [id, userId, userId], (err, row) => {
        if (err) {
            console.error('Get Workspace By Id Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Workspace not found or access denied' });
        }

        res.status(200).json(row);
    });
};

// Delete workspace (owner or admin only)
exports.deleteWorkspace = (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const checkSql = `SELECT * FROM Workspaces WHERE id = ?`;

    db.get(checkSql, [id], (checkErr, workspace) => {
        if (checkErr) {
            console.error('Delete Workspace Check Error:', checkErr.message);
            return res.status(500).json({ error: checkErr.message });
        }

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (role !== 'admin' && workspace.ownerId !== userId) {
            return res.status(403).json({ error: 'Forbidden. Only owner or admin can delete this workspace.' });
        }

        db.run(`DELETE FROM Workspaces WHERE id = ?`, [id], function (err) {
            if (err) {
                console.error('Delete Workspace Error:', err.message);
                return res.status(500).json({ error: 'Could not delete workspace' });
            }

            res.status(200).json({ message: 'Workspace deleted successfully!' });
        });
    });
};

// Get workspace members INCLUDING owner
exports.getWorkspaceMembers = (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

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

    db.get(accessSql, [id, userId, userId], (accessErr, workspace) => {
        if (accessErr) {
            console.error('Get Members Access Error:', accessErr.message);
            return res.status(500).json({ error: accessErr.message });
        }

        if (!workspace) {
            return res.status(403).json({ error: 'Access denied or workspace not found' });
        }

        const sql = `
            SELECT Users.id, Users.fullName, Users.email
            FROM Users
            JOIN Workspaces ON Workspaces.ownerId = Users.id
            WHERE Workspaces.id = ?

            UNION

            SELECT Users.id, Users.fullName, Users.email
            FROM WorkspaceMembers
            JOIN Users ON WorkspaceMembers.userId = Users.id
            WHERE WorkspaceMembers.workspaceId = ?
        `;

        db.all(sql, [id, id], (err, rows) => {
            if (err) {
                console.error('Get Workspace Members Error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        });
    });
};

// Add workspace member by email
exports.addWorkspaceMember = (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get(`SELECT * FROM Workspaces WHERE id = ?`, [id], (workspaceErr, workspace) => {
        if (workspaceErr) {
            console.error('Add Member Workspace Check Error:', workspaceErr.message);
            return res.status(500).json({ error: workspaceErr.message });
        }

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (role !== 'admin' && workspace.ownerId !== userId) {
            return res.status(403).json({ error: 'Only the workspace owner or admin can add members' });
        }

        db.get(`SELECT id FROM Users WHERE email = ?`, [email], (err, user) => {
            if (err) {
                console.error('Find User By Email Error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (user.id === workspace.ownerId) {
                return res.status(400).json({ error: 'Owner is already part of the workspace' });
            }

            const insertSql = `INSERT INTO WorkspaceMembers (workspaceId, userId) VALUES (?, ?)`;

            db.run(insertSql, [id, user.id], function (err2) {
                if (err2) {
                    console.error('Insert Member Error:', err2.message);
                    return res.status(400).json({ error: 'User is already a member' });
                }

                res.status(201).json({ message: 'Member added successfully' });
            });
        });
    });
};

// Remove workspace member
exports.removeWorkspaceMember = (req, res) => {
    const { id, userId: targetUserId } = req.params;
    const requesterId = req.user?.id;
    const role = req.user?.role;

    if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.get(`SELECT * FROM Workspaces WHERE id = ?`, [id], (workspaceErr, workspace) => {
        if (workspaceErr) {
            console.error('Remove Member Workspace Check Error:', workspaceErr.message);
            return res.status(500).json({ error: workspaceErr.message });
        }

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (Number(targetUserId) === workspace.ownerId) {
            return res.status(400).json({ error: 'Workspace owner cannot be removed' });
        }

        if (role !== 'admin' && workspace.ownerId !== requesterId) {
            return res.status(403).json({ error: 'Only the workspace owner or admin can remove members' });
        }

        db.run(
            `DELETE FROM WorkspaceMembers WHERE workspaceId = ? AND userId = ?`,
            [id, targetUserId],
            function (err) {
                if (err) {
                    console.error('Remove Member Error:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                res.json({ message: 'Member removed successfully' });
            }
        );
    });
};
//edit workspace
exports.updateWorkspace = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Workspace name is required' });
    }

    db.get(`SELECT * FROM Workspaces WHERE id = ?`, [id], (findErr, workspace) => {
        if (findErr) {
            console.error('Find Workspace Error:', findErr.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (role !== 'admin' && workspace.ownerId !== userId) {
            return res.status(403).json({ error: 'Only the workspace owner or admin can edit this workspace' });
        }

        db.run(
            `UPDATE Workspaces SET name = ? WHERE id = ?`,
            [name.trim(), id],
            function (updateErr) {
                if (updateErr) {
                    console.error('Update Workspace Error:', updateErr.message);
                    return res.status(500).json({ error: 'Could not update workspace' });
                }

                res.json({
                    message: 'Workspace updated successfully',
                    workspace: {
                        id: Number(id),
                        name: name.trim()
                    }
                });
            }
        );
    });
};
// Admin only: Get ALL workspaces in the system
exports.getAllSystemWorkspaces = (req, res) => {
    const role = req.user?.role;

    if (role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view all workspaces' });
    }

    const sql = `
        SELECT Workspaces.*, Users.fullName as ownerName, Users.email as ownerEmail
        FROM Workspaces
        LEFT JOIN Users ON Workspaces.ownerId = Users.id
        ORDER BY Workspaces.id DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Get All System Workspaces Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
};