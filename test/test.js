const expect = require('chai').expect;
const request = require('request-promise-native');

const baseUrl_debug = 'http://localhost:8082';

describe('Site status and smoketests', () => {
    it('Home page loads', async () => {
        homepageResponse = await request(baseUrl_debug);
        expect(homepageResponse).to.include(`Dave's Game`);
    });
});