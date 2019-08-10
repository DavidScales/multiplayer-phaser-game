const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8082;

app.use(express.static('public'));

/** API sample reference for later */
/************************************************************************
// init sqlite db
const fs = require('fs');
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');

    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});
*********************************************************************** */

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

/** API sample reference for later */
// app.get('/getDreams', function(request, response) {
//   db.all('SELECT * from Dreams', function(err, rows) {
//     response.send(JSON.stringify(rows));
//   });
// });

const server = require('http').Server(app);
const listener = server.listen(PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

const io = require('socket.io')(server);
// io.sockets.on('connection', (socket) => {
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('greeting', (data) => {
    console.log(`recieved greeting from client: ${data.content}`);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})