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

  self.getDistance = point => {
    return Math.sqrt(Math.pow(self.x - point.x, 2) + Math.pow(self.y - point.y, 2));
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
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.maxSpeed = 10;

  const superUpdate = self.update;
  self.update = () => {
    self.updateSpeed();
    superUpdate();

    if (self.pressingAttack) {
      self.shootBullet(self.mouseAngle);
    }
  };

  self.shootBullet = (angle) => {
    const bullet = Bullet(self.id, angle);
    bullet.x = self.x;
    bullet.y = self.y;
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
    else if (data.inputId === 'attack') {
      player.pressingAttack = data.state;
    }
    else if (data.inputId === 'mouseAngle') {
      player.mouseAngle = data.state;
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

const Bullet = (parent, angle) => {
  const self = Entity();
  self.id = Math.random();
  self.speedX = Math.cos(angle / 180 * Math.PI) * 10;
  self.speedY = Math.sin(angle / 180 * Math.PI) * 10;
  self.timer = 0;
  self.parent = parent;
  self.toRemove = false;
  const superUpdate = self.update;
  self.update = () => {
    if (self.timer++ > 100) {
      self.toRemove = true;
    }
    superUpdate();

    for (let i in Player.list) {
      let player = Player.list[i];
      if (self.getDistance(player) < 32 && self.parent !== player.id) {
        // TODO handle collision damage
        self.toRemove = true;
      }
    }
  };
  Bullet.list[self.id] = self;
  return self;
};
Bullet.list = {};
Bullet.update = () => {
  const pack = [];
  for (let i in Bullet.list) {
    let bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove) {
      delete Bullet.list[i];
    } else {
      pack.push({
        x: bullet.x,
        y: bullet.y,
      });
    }
  }
  return pack;
};

const DEBUG = true;

// TODO: sanitization and potential security issues
const USERS = {
  // username: password
  'admin': 'password',
  'david': 'isCool',
};
const isValidUser = async data => {
  return USERS[data.username] === data.password;
};
const isUsernameTaken = async data => {
  return USERS[data.username];
};
const addUser = async data => {
  USERS[data.username] = data.password;
};

const io = require('socket.io')(server, {});
io.sockets.on('connection', socket => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  console.log(`socket connection, id: ${socket.id}`);

  socket.on('signIn', async data => {
    if (await isValidUser(data)) {
      Player.onConnect(socket);
      socket.emit('signInResponse', { success: true });
    } else {
      socket.emit('signInResponse', { success: false });
    }
  });

  socket.on('signUp', async data => {
    if (await isUsernameTaken(data)) {
      socket.emit('signUpResponse', { success: false });
    } else {
      await addUser(data);
      socket.emit('signUpResponse', { success: true });
    }
  });

  socket.on('sendMsgToServer', data => {
    const playerName = ("" + socket.id).slice(2,7);
    for (let i in SOCKET_LIST) {
      let socket = SOCKET_LIST[i];
      socket.emit('addToChat', `${playerName}: ${data}`);
    }
  });

  socket.on('evalServer', data => {
    if (!DEBUG) {
      // Letting arbitrary content from the client execute with eval
      // is super dangerous, so the DEBUG variable is used to prevent
      // execution in production
      return;
    }
    const res = eval(data);
    socket.emit('evalAnswer', res);
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