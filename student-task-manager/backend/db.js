const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('SQLite connected');
    }
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            passwordHash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Workspaces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            ownerId INTEGER NOT NULL,
            FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS WorkspaceMembers (
            workspaceId INTEGER NOT NULL,
            userId INTEGER NOT NULL,
            joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (workspaceId, userId),
            FOREIGN KEY (workspaceId) REFERENCES Workspaces(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            workspaceId INTEGER NOT NULL,
            assignedToId INTEGER,
            FOREIGN KEY (workspaceId) REFERENCES Workspaces(id) ON DELETE CASCADE,
            FOREIGN KEY (assignedToId) REFERENCES Users(id) ON DELETE SET NULL
        )
    `);
});

module.exports = db;