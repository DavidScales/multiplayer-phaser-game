
class Database {
    constructor() {
        this.users = {
            'dave': 'admin'
        }
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

// // init sqlite db
// const fs = require('fs');
// const path = require('path');
// const dataFolder = path.join(__dirname, '.data');
// if (!fs.existsSync(dataFolder)) { fs.mkdirSync(dataFolder); }
// const dbFile = path.join(dataFolder, 'sqlite.db');
// const dbExists = fs.existsSync(dbFile);
// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(dbFile);

// // TODO: probably learn more about SQL
// db.serialize(function(){
//   if (!dbExists) {
//     let columns = [
//       'username TEXT PRIMARY KEY UNIQUE NOT NULL',
//       'password TEXT NOT NULL', // TODO: Should be hash
//       'created TEXT DEFAULT CURRENT_TIMESTAMP'
//     ];
//     db.run(`CREATE TABLE account (${columns.join(', ')});`);
//     console.log('New table "account" created');

//     const mockUsers = [
//       { username: 'dave', password: 'cool' },
//       { username: 'skip', password: 'neat' },
//     ];
//     db.serialize(function() {
//       mockUsers.forEach(user => {
//         const columns = Object.keys(user);
//         const columnStr = columns.join(', ');
//         const valuesStr = columns.map(key => user[key])
//                                  .map(str => `'${str}'`)
//                                  .join(', ');
//         console.log(`INSERT INTO account (${columnStr}) VALUES (${valuesStr});`);
//         db.run(`INSERT INTO account (${columnStr}) VALUES (${valuesStr});`);
//       });
//     });
//   }
//   else {
//     console.log('Database "account" already exists');
//     db.each('SELECT * from account;', function(err, row) {
//       if ( row ) {
//         console.log('record:', row);
//       }
//     });
//   }
// });

module.exports = {
    Database: Database
    // Player: Player,
    // Bullet: Bullet
};