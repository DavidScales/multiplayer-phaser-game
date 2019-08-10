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

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10 * Math.random());
  SOCKET_MAP[socket.id] = socket;
  console.log(`a user connected (${socket.id})`);

  socket.on('disconnect', () => {
    // Note: disconnect doesn't accept "socket" argument
    console.log(`user disconnected (${socket.id})`);
    delete SOCKET_MAP[socket.id];
  });
})

setInterval(() => {
  const pack = [];
  for (let id in SOCKET_MAP) {
    let socket = SOCKET_MAP[id];
    socket.x++;
    socket.y++;
    pack.push({
      number: socket.number,
      x: socket.x,
      y: socket.y
    })
  }
  // Looks like you can emit to all sockets directly (https://socket.io/get-started/chat/)
  // io.emit('some event', { for: 'everyone' });
  for (let id in SOCKET_MAP) {
    let socket = SOCKET_MAP[id];
    socket.emit('newPosition', pack);
  }
}, 1000/25);