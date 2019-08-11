const expect = require('chai').expect;
const request = require('request-promise-native');
var io = require('socket.io-client');

const baseUrl_debug = 'http://localhost:8082';
const socketURL = 'http://0.0.0.0:8082';
const socketOptions = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Site status and smoketests', () => {
    it('Home page loads', async () => {
        homepageResponse = await request(baseUrl_debug);
        expect(homepageResponse).to.include(`Dave's Game`);
    });
});

// Websocket tests are pretty tough!
describe('Web sockets', (done) => {
    it('all clients recieve all player coordinates', async () => {
        expect.fail('TODO');
    });
    /** Examples
     * http://liamkaufman.com/blog/2012/01/28/testing-socketio-with-mocha-should-and-socketio-client/
     * https://alexzywiak.github.io/testing-socket-io-with-mocha-and-chai/index.html
     * */
});

describe('Player', (done) => {
    it('new player is added to players object on connect', async () => {
        expect.fail('TODO');
    });
    it('player is removed from players object on disconnect', () => {
        expect.fail('TODO');
    });
    it('player coordinates are updated on key press', () => {
        expect.fail('TODO');
    });
});
