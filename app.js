const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 8087;

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
})
app.use('/client', express.static(`${__dirname}/client`));

console.log(`Server listening on localhost:${port}`);
server.listen(port);

const SOCKET_LIST = {};
const PLAYER_LIST = {};

const Player = id => {
  const self = {
    x: 250,
    y: 250,
    id:id,
    number: "" + Math.floor(10 * Math.random()),
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpeed: 10,
  }

  self.updatePosition = () => {
    if (self.pressingRight) {
      self.x += self.maxSpeed;
    }
    if (self.pressingLeft) {
      self.x -= self.maxSpeed;
    }
    if (self.pressingDown) {
      self.y += self.maxSpeed;
    }
    if (self.pressingUp) {
      self.y -= self.maxSpeed;
    }
  };

  return self;
};

const io = require('socket.io')(server, {});
io.sockets.on('connection', socket => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  console.log(`socket connection, id: ${socket.id}`);

  const player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });

  socket.on('keyPress', data => {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
    }
    else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    }
    else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    }
    else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    }
  });
});

setInterval(() => {
  let pack = [];
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePosition();
    pack.push({
      x: player.x,
      y: player.y,
      number: player.number
    });
  }
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPosition', pack);
  }

}, 1000/25); // 25 FPS