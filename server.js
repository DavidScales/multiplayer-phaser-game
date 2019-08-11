/** Express server */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8082;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const server = require('http').Server(app);
const listener = server.listen(PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

/** Websockets and game logic */

const SOCKET_MAP = {};
const PLAYER_MAP = {};

const Player = require('./server/player.js');
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  const id = Math.random();
  socket.id = id;
  SOCKET_MAP[id] = socket;
  const player = new Player(id);
  PLAYER_MAP[id] = player;
  console.log(`a user connected (${id})`);

  socket.on('disconnect', () => {
    // Note: disconnect doesn't accept "socket" argument
    console.log(`user disconnected (${id})`);
    delete SOCKET_MAP[id];
    delete PLAYER_MAP[id];
  });

  socket.on('keyPress', (data) => {
    if      (data.inputId == 'right') { player.pressingRight = data.state; }
    else if (data.inputId == 'left')  { player.pressingLeft = data.state; }
    else if (data.inputId == 'up')    { player.pressingUp = data.state; }
    else if (data.inputId == 'down')  { player.pressingDown = data.state; }
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
  io.emit('newPosition', pack);
}, 1000/25);