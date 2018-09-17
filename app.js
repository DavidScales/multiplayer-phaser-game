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

const Entity = () => {
  const self = {
    x: 250,
    y: 250,
    speedX: 0,
    speedY: 0,
    id:"",
  }

  self.update = () => {
    self.updatePosition();
  };

  self.updatePosition = () => {
    self.x += self.speedX;
    self.y += self.speedY;
  };

  return self;
};

const Player = id => {
  const self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpeed = 10;

  const superUpdate = self.update;
  self.update = () => {
    self.updateSpeed();
    superUpdate();
  };

  self.updateSpeed = () => {
    if (self.pressingRight) {
      self.speedX = self.maxSpeed;
    }
    else if (self.pressingLeft) {
      self.speedX = -self.maxSpeed;
    }
    else {
      self.speedX = 0;
    }

    if (self.pressingDown) {
      self.speedY = self.maxSpeed;
    }
    else if (self.pressingUp) {
      self.speedY = -self.maxSpeed;
    }
    else {
      self.speedY = 0;
    }
  };
  Player.list[id] = self;
  return self;
};
Player.list = {};
Player.onConnect = socket => {
  const player = Player(socket.id);

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
};
Player.onDisconnect = socket => {
  delete Player.list[socket.id];
};
Player.update = () => {
  const pack = [];
  for (let i in Player.list) {
    let player = Player.list[i];
    player.update();
    pack.push({
      x: player.x,
      y: player.y,
      number: player.number
    });
  }
  return pack;
};

const Bullet = angle => {
  const self = Entity();
  self.id = Math.random();
  self.speedX = Math.cos(angle / 180 * Math.PI) * 10;
  self.speedY = Math.sin(angle / 180 * Math.PI) * 10;
  self.timer = 0;
  self.toRemove = false;
  const superUpdate = self.update;
  self.update = () => {
    if (self.timer++ > 100) {
      self.toRemove = true;
    }
    superUpdate();
  };
  Bullet.list[self.id] = self;
  return self;
};
Bullet.list = {};
Bullet.update = () => {

  if (Math.random() < 0.1) {
    Bullet(Math.random()*360);
  }

  const pack = [];
  for (let i in Bullet.list) {
    let bullet = Bullet.list[i];
    bullet.update();
    pack.push({
      x: bullet.x,
      y: bullet.y,
    });
  }
  return pack;
};

const io = require('socket.io')(server, {});
io.sockets.on('connection', socket => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  console.log(`socket connection, id: ${socket.id}`);
  Player.onConnect(socket);

  socket.on('sendMsgToServer', data => {
    const playerName = ("" + socket.id).slice(2,7);
    for (let i in SOCKET_LIST) {
      let socket = SOCKET_LIST[i];
      socket.emit('addToChat', `${playerName}: ${data}`);
    }
  });

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
});

setInterval(() => {
  const pack = {
    players: Player.update(),
    bullets: Bullet.update(),
  };
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPositions', pack);
  }
}, 1000/25); // 25 FPS