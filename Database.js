const USE_DB = true;

// TODO: try/catch to these

let dbPromise;
let assert;
if (USE_DB) {
  const MongoClient = require('mongodb').MongoClient;
  assert = require('assert');
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
  dbPromise = initDb(url, dbName);
}

// account = { username: string, password: string }
// progress = { username: string, items: [
//     {id: string, amount: number },
//     {id: string, amount: number },
//     ...
//   ]
// }
Database = {};

// TODO: sanitization and potential security issues
// TODO: passwords should be salted hashes
Database.isValidUser = async data => {
  if (!USE_DB) { return true; }
  const db = await dbPromise;
  const users = await db.collection('account')
    .find(data).limit(1).toArray();
  return users.length === 1;
};
Database.isUsernameTaken = async data => {
  if (!USE_DB) { return false; }
  const db = await dbPromise;
  const users = await db.collection('account')
    .find({username: data.username }).limit(1).toArray();
  return users.length === 1;
};
Database.addUser = async data => {
  if (!USE_DB) { return; }
  const db = await dbPromise;
  const users = await db.collection('account')
    .insertOne(data) // does this allow duplicate data?
  assert.equal(1, users.insertedCount);
  await Database.savePlayerProgress({
    username: data.username,
    items: [],
  });
};
Database.getPlayerProgress = async username => {
  if (!USE_DB) {
    return {
      items: [],
      // ... etc.
    };
  }
  const db = await dbPromise;
  const playersProgress = await db.collection('progress')
    .find({ username: username }).limit(1).toArray();
  const playerProgress = playersProgress[0];
  return {
    items: playerProgress.items,
    // ... etc.
  };
};
Database.savePlayerProgress = async data => {
  if (!USE_DB) { return; };
  console.log(data);
  const db = await dbPromise;
  const playerProgress = await db.collection('progress')
    .updateOne({ username: data.username }, { $set: data }, { upsert: true });

    // updated only
    // assert.equal(1, playerProgress.matchedCount);
    // assert.equal(1, playerProgress.modifiedCount);

    // new only
    // assert.equal(0, playerProgress.matchedCount);
    // assert.equal(1, playerProgress.upsertedCount);
    // upserted is only for new - https://stackoverflow.com/questions/41724610/can-modifiedcount-and-upsertedcount-both-be-0
};