const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8082;

app.use(express.static('public'));

/** API sample reference for later */
/************************************************************************
// init sqlite db
const fs = require('fs');
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');

    // insert default dreams
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
*********************************************************************** */

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

/** API sample reference for later */
// app.get('/getDreams', function(request, response) {
//   db.all('SELECT * from Dreams', function(err, rows) {
//     response.send(JSON.stringify(rows));
//   });
// });

const server = require('http').Server(app);
const listener = server.listen(PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

const SOCKET_MAP = {};
const PLAYER_MAP = {};

// TODO: should be a class? and imported
const Player = (id) => {
  const self = {
    x: 250,
    y: 250,
    id:id,
    number: "" + Math.floor(10 * Math.random()),
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpeed: 10
  };
  self.updatePosition = () => {
    if (self.pressingRight) {
      self.x += self.maxSpeed;
    }
    if (self.pressingLeft) {
      self.x -= self.maxSpeed;
    }
    if (self.pressingUp) {
      self.y -= self.maxSpeed;
    }
    if (self.pressingDown) {
      self.y += self.maxSpeed;
    }
  };
  return self
};

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.id = Math.random();
  SOCKET_MAP[socket.id] = socket;
  const player = Player(socket.id);
  PLAYER_MAP[socket.id] = player;
  console.log(`a user connected (${socket.id})`);

  socket.on('disconnect', () => {
    // Note: disconnect doesn't accept "socket" argument
    console.log(`user disconnected (${socket.id})`);
    delete SOCKET_MAP[socket.id];
    delete PLAYER_MAP[socket.id];
  });

  // TODO: switch w/ map?
  socket.on('keyPress', (data) => {
    if (data.inputId == 'right') {
      player.pressingRight = data.state;
    }
    else if (data.inputId == 'left') {
      player.pressingLeft = data.state;
    }
    else if (data.inputId == 'up') {
      player.pressingUp = data.state;
    }
    else if (data.inputId == 'down') {
      player.pressingDown = data.state;
    }
  });
})

setInterval(() => {
  const pack = [];
  for (let id in PLAYER_MAP) {
    let player = PLAYER_MAP[id];
    player.updatePosition();
    pack.push({
      number: player.number,
      x: player.x,
      y: player.y
    })
  }
  // Looks like you can emit to all sockets directly (https://socket.io/get-started/chat/)
  // io.emit('some event', { for: 'everyone' });
  for (let id in SOCKET_MAP) {
    let socket = SOCKET_MAP[id];
    socket.emit('newPosition', pack);
  }
}, 1000/25);