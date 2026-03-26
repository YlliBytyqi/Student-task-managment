const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db'); // Path to your db.js

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE: Hit http://localhost:5000/users to check
app.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});