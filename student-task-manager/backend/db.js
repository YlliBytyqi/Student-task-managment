const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// This creates a file called 'database.sqlite' in your backend folder
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Connection Error:', err.message);
    } else {
        console.log('✅ SQLite CONNECTED! (No more 1433 errors)');

        // This creates your Users table automatically if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE
        )`);
    }
});

module.exports = db;