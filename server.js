/** Express server */

const express = require('express');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const app = express();

// Port cannot be hard-coded for Glitch
const args = minimist(process.argv.slice(2));
const PORT = args.port || process.env.PORT;
const DEBUG = args.debug;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const server = require('http').Server(app);
const listener = server.listen(PORT, () => {
  console.log('App is listening on port ' + listener.address().port);
});

/** Database */


// init sqlite db
const fs = require('fs');
const path = require('path');
const dataFolder = path.join(__dirname, '.data');
if (!fs.existsSync(dataFolder)) { fs.mkdirSync(dataFolder); }
const dbFile = path.join(dataFolder, 'sqlite.db');
const dbExists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);
db.serialize(function(){
  if (!dbExists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');

    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});


/** Websockets and game logic */

const SOCKETS = {};

const USERS = {
  'dave': 'admin'
};
// TODO: consider promise-based alternatives
const isUserNameTaken = (username, cb) => {
  setTimeout(() => {
    cb(USERS[username]);
  }, 10);

};
const addUser = (username, password, cb) => {
  setTimeout(() => {
    USERS[username] = password;
    cb();
  }, 10);

};
const isValidPassword = (username, password, cb) => {
  setTimeout(() => {
    cb(USERS[username] == password);
  }, 10);
};

const { Player, Bullet } = require('./server/entities');
const { generateId } = require('./server/util');
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.id = generateId();
  SOCKETS[socket.id] = socket;
  console.log(`A user connected (${socket.id})`);

  socket.on('signIn', (data) => {
    isValidPassword(data.username, data.password, (res) => {
      if (res) {
        Player.onConnect(socket);
        socket.emit('signInResponse', { success: true });
      } else {
        socket.emit('signInResponse', { success: false });
      }
    });
  });

  socket.on('signUp', (data) => {
    isUserNameTaken(data.username, (res) => {
      if (res) {
        socket.emit('signUpResponse',
          { success: false, message: 'Username already exists' }
        );
      } else {
        addUser(data.username, data.password, () => {
          socket.emit('signUpResponse', { success: true });
        });
      }
    })
  });

  socket.on('disconnect', () => {
    // Note: disconnect event doesn't accept "socket" argument
    console.log(`User disconnected (${socket.id})`);
    delete SOCKETS[socket.id];
    Player.onDisconnect(socket);
  });

  socket.on('sendMessageToServer', (data) => {
    // TODO: sanitize input & probably store peristently
    const playerName = "" + socket.id; // TODO: change
    const message = `<strong>${playerName}</strong>: ${data}`;
    io.emit('addToChat', message);
  });

  socket.on('evalServer', (data) => {
    if (!DEBUG) { return }
    let result = 'undefined';
    try {
      result = eval(data);
    } catch (error) {
      console.log('Server debug eval failed:', error);
    }
    socket.emit('evalAnswer', result);
  });
})

setInterval(() => {
  // TODO: rename
  const pack = {
    players: Player.updatePlayers(),
    bullets: Bullet.updateBullets()
  }
  io.emit('newPositions', pack);
}, 1000/25);

module.exports = {
  server: listener, // Note
  Player: Player,
};