### episode 1
* set up project file structure
* install express, socket.io
* configure server app.js to hello-world level using express

### episode 2 & 3
* basic web sockets and socket.io API

### episode 4
* keyboard controls

### episode 5
* bullets

### episode 6
* chat
* debug server

## Notes

Want to create a "real time" (is that the right term?)

Learning to use websockets

> The WebSocket API is an advanced technology that makes it possible to open a two-way interactive communication session between the user's browser and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply.
https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

because its faster... esp for games, chat apps, no need to poll/re-establish...

Using Socket.IO, which is

> a library that enables real-time, bidirectional and event-based communication between the browser and the server.
https://socket.io/docs/

using the underlying browser WebSockets API.

First I got started with a very basic (hello-world) express app:

```
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
```

One thing that I found interesting is that I normally set up express servers with the following:

```
const express = require('express');
const app = express();
app.listen(port);
```

Which I had never actually bothered to understand. But the [Socket.IO docs](https://socket.io/docs/) describe creating the example express server with Node's http module, before eventually incorporating the socket.io module itself:

```
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
```
https://socket.io/docs/

After an unsuccessful search of the documentation I found a stack overflow https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen

explaining that the express instantiation

const express = require('express');
const app = express();

or shorthand

```
var app = require('express')();
```

simply creates a function that an http (or https) server can use as a callback for handling requests.

> The app returned by express() is in fact a JavaScript Function, designed to be passed to Node’s HTTP servers as a callback to handle requests. This makes it easy to provide both HTTP and HTTPS versions of your app with the same code base, as the app does not inherit from these (it is simply a callback)
https://expressjs.com/en/api.html#app.listen

so an http (or https) server still needs to be created, with the express app used as its request handling function. In the socket.io docs, this happens here:

var server = require('http').Server(app);

Where the express app is passed into the http Server instantiation. But it less obvious in the typical express setup, where

app.listen(port);

implicitly creates and returns an http.Server object, and is just shorthand for

app.listen = function() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
https://expressjs.com/en/api.html#app.listen

The socket.io docs recommend the explicit technique because the socket.io library needs to access the http.Server object like this

var io = require('socket.io')(server);

Of course, since I now know that app.listen returns the server instance, the socket.io docs code could be re-written to look more like the express docs:

var express   = require('express');
var app       = express();
// app.use/routes/etc...
var server    = app.listen(3033);
var io        = require('socket.io').listen(server);

WAIT THIS LAST LINE IS STILL DIFFERENT. WHY NOT JUST
require('socket.io')(server)?

In my case I finish the express server:

```
const port = 8087;

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
})
app.use('/client', express.static(`${__dirname}/client`));

console.log(`Server listening on localhost:${port}`);
server.listen(port);
```

which just listens on a port, working like a static file server for the files in client/


Before instantiting the socket.io module like so:

```
const io = require('socket.io')(server, {});
```
REMOVE THIS EMPTY OPTIONS OBJECT

Which i believe creates a new WebSocket server. So overall I have
* an http express server handles serving files and the initial client-server handshake process
* a websocket server that handles data passed through websocket events

heres what that looks like in server code example

io.sockets.on('connection', socket => {
  console.log('socket connection');
});

basically use the library to establish a listener for connection events, which will happen when a client (browser) requests /. The express server will serve index.html and then the socket server will take over and establish a connection.

socket.io also has a client lib to abstract socket connections & events on the client side. here's how that looks

import
<script src="/socket.io/socket.io.js"></script>
this script call got me for a second because I don't have a socket.io/socket.io.js file on my server, but of course the socket.io library must establish /socket.io/socket.io.js as a route & serve the appropriate client library to it.

instantiate lib
    const socket = io();

listen for arbitrary events

    socket.on('someEvent', data => {
      console.log(data);
    });

Thats pretty much it conceptually for the basics.

The CURRENT example use is that on each connection, create some random data associated with the connection (like representing the coordinates of a player in a game), and to keep track of the connections in a global object.

  const SOCKET_LIST = {};
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

Then I loop over the connections at some interval, and emit the data...

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

On the client I could listen for this event and do a thing

    socket.on('newPosition', data => {
      console.log('newPosition');
      console.log(data);
      ctx.clearRect(0, 0, 500, 500);
      for (let i = 0; i < data.length; i++) {
        let player = data[i];
        console.log('player');
        console.log(player);
        ctx.fillText(player.number, player.x, player.y);
      }
    });


UPDATED EXAMPLE:

on the client, listen for keyup & keydown events, and send those as keyPress socket events to the server

    document.onkeydown = event => {
      if (event.keyCode === 68) { // d key
        socket.emit('keyPress', { inputId: 'right', state: true });
      }
      else if (event.keyCode === 83) { // s key
        socket.emit('keyPress', { inputId: 'down', state: true });
      }
      else if (event.keyCode === 65) { // a key
        socket.emit('keyPress', { inputId: 'left', state: true });
      }
      else if (event.keyCode === 87) { // w key
        socket.emit('keyPress', { inputId: 'up', state: true });
      }
    };

    document.onkeyup = event => {
      if (event.keyCode === 68) { // d key
        socket.emit('keyPress', { inputId: 'right', state: false });
      }
      else if (event.keyCode === 83) { // s key
        socket.emit('keyPress', { inputId: 'down', state: false });
      }
      else if (event.keyCode === 65) { // a key
        socket.emit('keyPress', { inputId: 'left', state: false });
      }
      else if (event.keyCode === 87) { // w key
        socket.emit('keyPress', { inputId: 'up', state: false });
      }
    };

these keyPress events are heard on the server by a new listener, and used to modify the "state" of the keys for each player.

io.sockets.on('connection', socket => {
  //...

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

Then in the "game loop", each players position is updated before being sent out to all the clients like before

setInterval(() => {
  let pack = [];
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePosition(); // NEW THING
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

using the new Player objects updatePosition method

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

from here is mostly more of the same to add more objects and events to the game, like bullets that the player can shoot or obstacles they can run into, etc.

### adding chat using sockets

pretty easy, just like the above game type stuff

on the client
add a UI

  <div id="chat-text" style="width: 500px; height: 100px; overflow-y: scroll">
    <div>Hello!</div>
  </div>
  <form id="chat-form" action="">
    <input id="chat-input" type="text" style="width: 500px;">
  </form>

then emit message events on button clicks...
show messages on recieve event...

    const chatText = document.getElementById('chat-text');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    socket.on('addToChat', data => {
      // THIS BETTER BE SANITIZED :O
      chatText.innerHTML += '<div>' + data + '</div>';
    });
    chatForm.onsubmit = event => {
      event.preventDefault();
      socket.emit('sendMsgToServer', chatInput.value);
    };

in server similar, when get message, send to all clients

  socket.on('sendMsgToServer', data => {
    const playerName = ("" + socket.id).slice(2,7);
    for (let i in SOCKET_LIST) {
      let socket = SOCKET_LIST[i];
      socket.emit('addToChat', `${playerName}: ${data}`);
    }
  });

just using socket id as id for example.


### debug server

pretty cool! modify client side chat so that a message starting with "/" is emits a new event with the remaining characters to be evaluated on the server:

    chatForm.onsubmit = event => {
      event.preventDefault();
      if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1));
      } else {
        socket.emit('sendMsgToServer', chatInput.value);
      }
    };

Then the server listens for this event and directly evalutes the content

    const DEBUG = true;
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

and emits it back to the client, which listens and gets the response and logs it

    socket.on('evalAnswer', data => {
      console.log(data);
    });

This lets me check the values on the server easily and dynamically, rather that like putting lots of console logs everywhere in the server that log constantly

example - in chat on client i could type "/Player.list", which would evalutate the player list on the server and log it for me in the client.

Sidenote & shown above about security risk of executing arbitrary content from the client - use DEBUG variable.

### auth

can use websockets for auth as well, e.g. use socket events for sign-in/sign-up instead of the normal http post requests:

  socket.on('signIn', data => {
    if (isValidUser(data)) {
      Player.onConnect(socket);
      socket.emit('signInResponse', { success: true });
    } else {
      socket.emit('signInResponse', { success: false });
    }
  });

where isValidUser is something basic and sync like

  function isValidUser(data) {
    return USERS[data.username] === data.password;
  };

for real code tho, gonna be checking a DB, which is async, so this isn't going to work of course. the tutorial recommends callbacks like this:

  socket.on('signIn', data => {
    isValidUser(data, res => {
      if (res) {
        Player.onConnect(socket);
        socket.emit('signInResponse', { success: true });
      } else {
        socket.emit('signInResponse', { success: false });
      }
    });
  });

along with rewriting isValidUser to something like:

  function isValidUser(data, cb) {
    // async user lookup
    cb(user && user.password === data.password);
  };

but with Promises + async/await! even bettuh!

  async function isValidUser(data) {
    return new Promise((resolve, reject) => {
      // async user lookup
      resolve(user && user.password === data.password);
    });
  };

  socket.on('signIn', async data => {
    if (await isValidUser(data)) {
      Player.onConnect(socket);
      socket.emit('signInResponse', { success: true });
    } else {
      socket.emit('signInResponse', { success: false });
    }
  });

...etc. explain

also alt with fat arrows because I like those:

  const isValidUser = async data => {
    return new Promise((resolve, reject) => {
      // async user lookup
      resolve(user && user.password === data.password);
    });
  };

TODO: come back to the above post-DB

### user persistence with databases



NOTE: possibly add notes about the socket vs client session issues I had with Nick

Ridiculously good tutorial covering multiplayer web games with Node.js & Socket.IO for anyone with even basic-intermediate web/JS experience
https://rainingchain.com/tutorial/nodejs