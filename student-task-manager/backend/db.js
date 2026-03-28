const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Connection Error:', err.message);
    } else {
        console.log('✅ SQLite CONNECTED!');

        db.run("PRAGMA foreign_keys = ON;");

        db.serialize(() => {
            // 1. Users Table
            db.run(`CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                passwordHash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Workspaces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                ownerId INTEGER NOT NULL,
                FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS Tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                workspaceId INTEGER NOT NULL,
                createdById INTEGER NOT NULL,
                FOREIGN KEY (workspaceId) REFERENCES Workspaces(id) ON DELETE CASCADE,
                FOREIGN KEY (createdById) REFERENCES Users(id) ON DELETE CASCADE
            )`);

            console.log('✨ Database Schema Synced.');
        });
    }
});

module.exports = db;