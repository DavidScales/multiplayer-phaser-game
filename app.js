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

const io = require('socket.io')(server, {});
io.sockets.on('connection', socket => {

  socket.id = Math.random();
  socket.number = "" + Math.floor(10 * Math.random());
  socket.x = 0;
  socket.y = 0;
  SOCKET_LIST[socket.id] = socket;

  console.log(`socket connection, id: ${socket.id}`);

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
  });
});

setInterval(() => {
  let pack = [];
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number
    });
  }
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPosition', pack);
  }

}, 1000/25); // 25 FPS