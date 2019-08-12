/** Express server */

const express = require('express');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const app = express();

// Port cannot be hard-coded for Glitch
const args = minimist(process.argv.slice(2));
const PORT = args.port || process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const server = require('http').Server(app);
const listener = server.listen(PORT, () => {
  console.log('App is listening on port ' + listener.address().port);
});

/** Websockets and game logic */

const SOCKETS = {};

const { Player, Bullet } = require('./server/entities');
const { generateId } = require('./server/util');
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.id = generateId();
  SOCKETS[socket.id] = socket;
  console.log(`A user connected (${socket.id})`);

  Player.onConnect(socket);

  socket.on('disconnect', () => {
    // Note: disconnect event doesn't accept "socket" argument
    console.log(`User disconnected (${socket.id})`);
    delete SOCKETS[socket.id];
    Player.onDisconnect(socket);
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