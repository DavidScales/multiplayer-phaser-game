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
  console.log('App is listening on port ' + listener.address().port);
});

/** Websockets and game logic */

const SOCKETS = {};

const { Player } = require('./server/entities');
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
  const pack = Player.updatePlayers();
  io.emit('newPosition', pack);
}, 1000/25);