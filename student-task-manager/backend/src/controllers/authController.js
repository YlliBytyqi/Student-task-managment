const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mysecretkey';

exports.register = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const allowedRoles = ['admin', 'student'];
        const userRole = allowedRoles.includes(role) ? role : 'student';

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)`;

        db.run(sql, [fullName, email, hashedPassword, userRole], function (err) {
            if (err) {
                console.error('DB Error:', err.message);
                return res.status(400).json({ error: 'User already exists' });
            }

            res.status(201).json({
                message: 'User created successfully!',
                userId: this.lastID
            });
        });
    } catch (error) {
        console.error('Catch Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = `SELECT * FROM Users WHERE email = ?`;

    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error('DB Error:', err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.passwordHash);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login Error:', error.message);
            res.status(500).json({ error: 'Server error' });
        }
    });
};

exports.getUsers = (req, res) => {
    const sql = `SELECT id, fullName, email, role, createdAt FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('DB Error:', err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        res.json(rows);
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT id, fullName, email, role, createdAt FROM Users WHERE id = ?`;

    db.get(sql, [id], (err, user) => {
        if (err) {
            console.error('DB Error:', err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    });
};

exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({ error: 'Full name and email are required' });
    }

    const sql = `UPDATE Users SET fullName = ?, email = ? WHERE id = ?`;

    db.run(sql, [fullName, email, id], function (err) {
        if (err) {
            console.error('Update Profile Error:', err.message);
            return res.status(400).json({ error: 'Email already exists on another account' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully!',
            updatedUser: {
                id: parseInt(id),
                fullName,
                email
            }
        });
    });
};

exports.updateUserRole = (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const requesterRole = req.user?.role;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const allowedRoles = ['admin', 'student'];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can change roles' });
    }

    const sql = `UPDATE Users SET role = ? WHERE id = ?`;

    db.run(sql, [role, id], function (err) {
        if (err) {
            console.error('Update Role Error:', err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully!',
            user: {
                id: parseInt(id),
                role
            }
        });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM Users WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) {
            console.error('Delete User Error:', err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User deleted successfully'
        });
    });
};