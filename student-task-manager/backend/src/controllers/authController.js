const db = require('../../db'); 
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!password) return res.status(400).json({ error: "Password is required" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (fullName, email, passwordHash) VALUES (?, ?, ?)`;
        
        db.run(sql, [fullName, email, hashedPassword], function(err) {
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