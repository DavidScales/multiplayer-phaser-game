const initPack = { players: {}, bullets: {} };
const removePack = { players: {}, bullets: {} };

Entity = (override) => {
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
Entity.getFrameUpdateData = () => {
  const packs = {
    initPack: {
      players: initPack.players,
      bullets: initPack.bullets,
    },
    removePack: {
      players: removePack.players,
      bullets: removePack.bullets,
    },
    updatePack: {
      players: Player.update(),
      bullets: Bullet.update(),
    }
  }
  initPack.players = [];
  initPack.bullets = [];
  removePack.players = [];
  removePack.bullets = [];
  return packs;
};

Player = config => {
  const self = Entity(config);
  self.number = "" + Math.floor(10 * Math.random());
  self.username = config.username;
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
  self.inventory = Inventory(config.progress.items, config.socket, true); // boolean is "server"

  const superUpdate = self.update;
  self.update = () => {
    self.updateSpeed();
    superUpdate();

    if (self.pressingAttack) {
      self.shootBullet(self.mouseAngle);
    }
  };

  self.shootBullet = (angle) => {
    // just for testing
    if (Math.random() < 0.1) {
      self.inventory.addItem('potion', 1);
    }

    Bullet({
      parent: self.id,
      angle: angle,
      x: self.x,
      y: self.y,
      map: self.map,
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
      map: self.map,
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
      map: self.map,
      // username: self.username,
    };
  };
  Player.list[self.id] = self;
  initPack.players.push(self.getInitPack());
  return self;
};
Player.list = {};
Player.onConnect = (socket, username, progress) => {
  let map = 'forest'; // this is also hard coded in Entity. abstract.
  if (Math.random() < 0.5) {
    map = 'field';
  }
  const player = Player({
    id: socket.id,
    map: map,
    username: username,
    socket: socket,
    progress: progress,
    //x, y, etc. from db
  });

  player.inventory.refreshRender();

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

  socket.on('changeMap', data => {
    if (player.map === 'field') {
      player.map = 'forest';
    } else {
      player.map = 'field';
    }
  });

  socket.on('sendMsgToServer', data => {
    // const playerName = ("" + socket.id).slice(2,7);
    for (let i in SOCKET_LIST) {
      let socket = SOCKET_LIST[i];
      socket.emit('addToChat', `${player.username} to all: ${data}`);
    }
  });

  socket.on('sendPrivateMsgToServer', data => { // data {username & message}
    let recipientSocket = null;
    for (let i in Player.list) {
      if (Player.list[i].username === data.username) {
        recipientSocket = SOCKET_LIST[i]; // or SOCKET_LIST[Player.list[i].id]
      }
    }
    if (!recipientSocket) {
      socket.emit('addToChat', `${data.username} is not online`);
    } else {
      recipientSocket.emit('addToChat', `PM from ${player.username}: ${data.message}`);
      socket.emit('addToChat', `PM to ${data.username}: ${data.message}`);
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
  let player = Player.list[socket.id];
  if (!player) { return; }
  Database.savePlayerProgress({
    username: player.username,
    items: player.inventory.items,
  });
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

Bullet = (config) => {
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
      if (self.map === player.map && self.getDistance(player) < 32 && self.parent !== player.id) {
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
      map: self.map,
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

// module.exports = {
//   Entity: Entity,
//   Player: Player,
//   Bullet: Bullet,
// };

