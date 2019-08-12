const expect = require('chai').expect;
const request = require('supertest');
var io = require('socket.io-client');

const socketOptions = {
    transports: ['websocket'],
    'force new connection': true
};

// Not sure if this is an ideal approach for importing server variables like Player
let server;
let baseUrl;
let Player;
/* beforeEach and afterEach aren't working as expected when called at the describe
level if they are defined at the global level. Could be scoping or closure issue.
For now, defining and calling at the global level works, since there is an implicit
global describe */
beforeEach(() => {
    // Cache bust previously loaded module
    const path = require.resolve('../server');
    delete require.cache[path];

    // This starts up a new server for each test
    const app = require('../server');
    server = app.server;
    Player = app.Player;
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

});
afterEach((done) => {
    server.close(done);
});

describe('Site status and smoketests', () => {

    it('Home page loads', async () => {
        const req = await request(server).get('/');
        expect(req.status).to.equal(200);
        expect(req.text).to.include(`Dave's Game`);
    });

    it('Fake page does not load', async () => {
        const req = await request(server).get('/fake');
        expect(req.status).to.equal(404);
    });
});

// Websocket tests are pretty tough!
describe.skip('Web sockets tests', () => {

    it('all clients recieve all player coordinates', async () => {
        expect.fail('TODO');
    });
});

describe('Player tests', () => {

    it('new player is added to players object on connect', (done) => {
        expect(Player.getNumPlayers()).to.equal(0);

        const client1 = io.connect(baseUrl, socketOptions);
        client1.on('connect', () => {
            expect(Player.getNumPlayers()).to.equal(1);
            client1.disconnect();
            done();
        });
    });

    it.skip('player is removed from players object on disconnect', () => {
        expect.fail('TODO');
    });

    it.skip('player coordinates are updated on key press', () => {
        expect.fail('TODO');
    });
});

describe.skip('Bullets tests', () => {

    it('bullets are created on user key press', async () => {
        expect.fail('TODO');
    });

    it('bullets are removed after X frames', () => {
        expect.fail('TODO');
    });
});
