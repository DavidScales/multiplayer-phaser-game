const expect = require('chai').expect;
const request = require('supertest');
var io = require('socket.io-client');

const socketOptions = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Site status and smoketests', () => {

    let server;
    beforeEach(() => {
        // Cache bust previously loaded module
        const path = require.resolve('../server');
        delete require.cache[path];

        server = require('../server').server;
    });
    afterEach((done) => {
        server.close(done);
    });

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
describe.skip('Web sockets', (done) => {
    it('all clients recieve all player coordinates', async () => {
        expect.fail('TODO');
    });
});


describe.skip('Player', (done) => {
    // it('new player is added to players object on connect', async () => {
    //     let numPlayers = Object.keys(Player.players).length;
    //     expect(numPlayers).to.equal(0);

    //     var client1 = io.connect(socketURL, socketOptions);
    //     client1.on('connect', function(data){
    //         console.log(Player);
    //     });
    // });
    it.skip('player is removed from players object on disconnect', () => {
        expect.fail('TODO');
    });
    it.skip('player coordinates are updated on key press', () => {
        expect.fail('TODO');
    });
});

describe.skip('Bullets', (done) => {
    it('bullets are created on user key press', async () => {
        expect.fail('TODO');
    });
    it('bullets are removed after X frames', () => {
        expect.fail('TODO');
    });
});
