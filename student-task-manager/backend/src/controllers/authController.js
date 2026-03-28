const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mysecretkey';

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (fullName, email, passwordHash) VALUES (?, ?, ?)`;

        db.run(sql, [fullName, email, hashedPassword], function (err) {
            if (err) {
                console.error("DB Error:", err.message);
                return res.status(400).json({ error: "User already exists" });
            }
            res.status(201).json({
                message: "User created successfully!",
                userId: this.lastID
            });
        });
    } catch (error) {
        console.error("Catch Error:", error.message);
        res.status(500).json({ error: "Server error" });
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