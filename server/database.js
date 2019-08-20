
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// init sqlite db
const dataFolder = path.join(__dirname, '..', '.data');
if (!fs.existsSync(dataFolder)) { fs.mkdirSync(dataFolder); }
const dbFile = path.join(dataFolder, 'sqlite.db');
const DB_EXISTS = fs.existsSync(dbFile);
const DATABASE = new sqlite3.Database(dbFile);

class Database {
    constructor() {
        // TODO: probably learn more about SQL
        // TODO: learn about all the async/timing going on here with serialize
        // and different operations
        Database.db.serialize(() => {
            if (!DB_EXISTS) {

                const config = {
                    name: 'account',
                    columns: [
                        'username TEXT PRIMARY KEY UNIQUE NOT NULL',
                        'password TEXT NOT NULL', // TODO: Should be salted hash
                        'created TEXT DEFAULT CURRENT_TIMESTAMP'
                    ]
                };
                Database.createTable(config);

                const tableName = 'account';
                const mockUsers = [
                    { username: 'dave', password: 'cool' },
                    { username: 'skip', password: 'neat' },
                ];
                Database.insertItems(tableName, mockUsers);
            }
            else {
                console.log('Database "account" already exists');
                Database.getAll('account');
            }
        });
    }
    static createTable(config) {
        Database.db.run(`CREATE TABLE ${config.name} (${config.columns.join(', ')});`);
        console.log(`New table "${config.name}" created`);
    }
    // TODO: fancy comments on all these like in other game
    static insertItems(tableName, items) {
        // TODO: insertItemS should use batch insert
        Database.db.serialize(() => {
            items.forEach(item => {
                const columns = Object.keys(item);
                const columnStr = columns.join(', ');
                const valuesStr = columns.map(key => item[key])
                                        .map(str => `'${str}'`)
                                        .join(', ');
                console.log(`INSERT INTO ${tableName} (${columnStr}) VALUES (${valuesStr});`);
                Database.db.run(`INSERT INTO ${tableName} (${columnStr}) VALUES (${valuesStr});`);
            });
        });
    }
    static getAll(tableName) {
        // TODO: Should be an actual GET, and should return instead of logging
        Database.db.each(`SELECT * from ${tableName};`, (err, row) => {
            if ( row ) {
                console.log('record:', row);
            }
        });
    }
    isUserNameTaken(username, cb) {
        setTimeout(() => {
            cb(this.users[username]);
        }, 10);
    }
    addUser(username, password, cb) {
        setTimeout(() => {
            this.users[username] = password;
            cb();
        }, 10);
    }
    isValidUser(username, password, cb) {
        setTimeout(() => {
          cb(this.users[username] == password);
        }, 10);
      }
}
Database.db = DATABASE; // ;)

module.exports = {
    Database: Database
};