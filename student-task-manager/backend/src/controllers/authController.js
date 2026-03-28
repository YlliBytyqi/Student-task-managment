const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // shtojme JWT per te krijuar tokenin e sesionit

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!password) return res.status(400).json({ error: "Password is required" });

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

// Login (POST /login)
// Kontrollon nëse email ekziston, verifikon fjalëkalimin dhe kthen një token
exports.login = (req, res) => {
    const { email, password } = req.body;

    // 1. Kontrollojmë nëse përdoruesi ka dhënë të dhënat e plota
    if (!email || !password) {
        return res.status(400).json({ error: "Email dhe fjalëkalimi janë të detyrueshëm." });
    }

    // 2. Kontrollojmë nëse ekziston përdoruesi me këtë email në db
    const sql = `SELECT * FROM Users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        // Përdoruesi nuk u gjet
        if (!user) return res.status(404).json({ error: "Përdoruesi me këtë email nuk u gjet!" });

        // 3. Verifikojmë që fjalëkalimi i dërguar përputhet me atë të hash-uar në db
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: "Fjalëkalimi është i pasaktë!" });

        // 4. Krijojmë një token për t'ia kthyer klientit
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'sekret_per_zhvillim_123',
            { expiresIn: '1d' } // Tokeni skadon për 1 ditë
        );

        // Kthejmë një përgjigje të plotë me tokenin dhe të dhënat baze të përdoruesit
        res.json({
            message: "Kycja u krye me sukses!",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    });
};

// Profile / Users (GET /users)
// Kthen një listë të të gjithë përdoruesve. 
// E rëndësishme për Personin B (psh. kur i shton një Task ose Workspace të dijë cilat IDs ekzistojnë)
exports.getUsers = (req, res) => {
    // Zgjedhim vetëm fushat e nevojshme (nuk duhet të kthejmë passwordHash për siguri)
    const sql = `SELECT id, fullName, email, role, createdAt FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Kthen listën (array) me profilet e përdoruesve
    });
};

// Merr një profil përdoruesi specifik (GET /users/:id)
exports.getUserById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT id, fullName, email, role, createdAt FROM Users WHERE id = ?`;

    db.get(sql, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "Ky përdorues nuk ekziston!" });

        res.json(user); // Kthen të dhënat e përdoruesit (Personit B mund t'i duhet për të verifikuar pronarin)
    });
};