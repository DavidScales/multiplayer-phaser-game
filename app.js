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

// const { Entity, Player } = require('./Entity.js');
require('./Entity.js');
require('./client/js/Inventory.js'); // see note in Inventory.js about global objects

const SOCKET_LIST = {};

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
      Player.onConnect(socket, data.username);
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

// const initPack = { players: {}, bullets: {} };
// const removePack = { players: {}, bullets: {} };

setInterval(() => {
  const packs = Entity.getFrameUpdateData();
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    // could probably optimize only sending init & remove when they occur
    socket.emit('init', packs.initPack);
    socket.emit('update', packs.updatePack);
    socket.emit('remove', packs.removePack);
  }
}, 1000 / 25); // 25 FPS