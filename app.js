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

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myGame';
const initDb = async (url, dbName) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    console.log('Connected successfully to database');
    return client.db(dbName);
  } catch (err) {
    console.log(err);
  }
};
const dbPromise = initDb(url, dbName);

// const dbPromise = MongoClient.connect(url, { useNewUrlParser: true })
//   .then(client => {
//     console.log("Connected successfully to server");
//     return client.db(dbName);
//   }).catch(err => {
//     console.log(err);
//   });

const SOCKET_LIST = {};

const Entity = (override) => {
  const self = {
    x: 250,
    y: 250,
    speedX: 0,
    speedY: 0,
    map: 'forest',
    id:'',
  }
  if (override) {
    if (override.x) {
      self.x = override.x;
    }
    if (override.y) {
      self.y = override.y;
    }
    if (override.map) {
      self.map = override.map;
    }
    if (override.id) {
      self.id = override.id;
    }
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

const Player = config => {
  const self = Entity(config);
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.maxSpeed = 10;
  self.hp = 10;
  self.hpMax = 10;
  self.score = 0;

  const superUpdate = self.update;
  self.update = () => {
    self.updateSpeed();
    superUpdate();

    if (self.pressingAttack) {
      self.shootBullet(self.mouseAngle);
    }
  };

  self.shootBullet = (angle) => {
    Bullet({
      parent: self.id,
      angle: angle,
      x: self.x,
      y: self.y,
    });
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

  self.getUpdatePack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      hp: self.hp,
      score: self.score,
    };
  };

  self.getInitPack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      number: self.number,
      hp: self.hp,
      hpMax: self.hpMax,
      score: self.score,
    };
  };
  Player.list[id] = self;
  initPack.players.push(self.getInitPack());
  return self;
};
Player.list = {};
Player.onConnect = socket => {
  const player = Player({
    id: socket.id,
    //x, y, etc. from db
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
    else if (data.inputId === 'attack') {
      player.pressingAttack = data.state;
    }
    else if (data.inputId === 'mouseAngle') {
      player.mouseAngle = data.state;
    }
  });

  socket.emit('init', {
    selfId: socket.id,
    players: Player.getAllInitPack(),
    bullets: Bullet.getAllInitPack(),
  });
};
Player.getAllInitPack = () => {
  const existingPlayers = [];
  for (let i in Player.list) {
    existingPlayers.push(Player.list[i].getInitPack());
  }
  return existingPlayers;
};
Player.onDisconnect = socket => {
  delete Player.list[socket.id];
  removePack.players.push(socket.id);
};
Player.update = () => {
  const pack = [];
  for (let i in Player.list) {
    let player = Player.list[i];
    player.update();
    pack.push(player.getUpdatePack());
  }
  return pack;
};

const Bullet = (config) => {
  const self = Entity(config);
  self.id = Math.random();
  self.angle = config.angle;
  self.speedX = Math.cos(config.angle / 180 * Math.PI) * 10;
  self.speedY = Math.sin(config.angle / 180 * Math.PI) * 10;
  self.timer = 0;
  self.parent = config.parent;
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
        player.hp--;
        if (player.hp <= 0) {
          player.hp = player.hpMax;
          player.x = Math.random() * 500;
          player.y = Math.random() * 500;

          const shooter = Player.list[self.parent];
          if (shooter) {
            shooter.score++;
          }
        }
        self.toRemove = true;
      }
    }
  };

  self.getInitPack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
    };
  };

  self.getUpdatePack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
    };
  };

  Bullet.list[self.id] = self;
  initPack.bullets.push(self.getInitPack());
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
      removePack.bullets.push(bullet.id);
    } else {
      pack.push(bullet.getUpdatePack());
    }
  }
  return pack;
};
Bullet.getAllInitPack = () => {
  const existingBullets = [];
  for (let i in Bullet.list) {
    existingBullets.push(Bullet.list[i].getInitPack());
  }
  return existingBullets;
};

const DEBUG = true;

// TODO: sanitization and potential security issues
// TODO: passwords should be salted hashes
const isValidUser = async data => {
  const db = await dbPromise;
  const users = await db.collection('account')
    .find(data)
    .toArray();
  return users.length === 1;
};
const isUsernameTaken = async data => {
  const db = await dbPromise;
  const users = await db.collection('account')
    .find({username: data.username })
    .toArray();
  return users.length === 1;
};
const addUser = async data => {
  const db = await dbPromise;
  const users = await db.collection('account')
    .insertOne(data)
  assert.equal(1, users.insertedCount);
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

const initPack = { players: {}, bullets: {} };
const removePack = { players: {}, bullets: {} };

setInterval(() => {
  const pack = {
    players: Player.update(),
    bullets: Bullet.update(),
  };
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    // could probably optimize only sending init & remove when they occur
    socket.emit('init', initPack);
    socket.emit('update', pack);
    socket.emit('remove', removePack);
  }
  initPack.players = [];
  initPack.bullets = [];
  removePack.players = [];
  removePack.bullets = [];
}, 1000 / 25); // 25 FPS