const { generateId } = require('./util');

class Entity {
    constructor() {
        this.id = '';
        this.x = 250;
        this.y = 250;
        this.speedX = 0;
        this.speedY = 0;
    }
    update() {
        this.updatePosition();
    }
    updatePosition() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

class Player extends Entity {
    constructor(id) {
        super();
        this.id = id;
        this.number = "" + Math.floor(10 * Math.random());
        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.maxSpeed = 10;
        // Add player to "global" players object
        Player.players[id] = this;
    }
    update() {
        this.updateSpeed();
        super.update();
    }
    updateSpeed() {
        if      (this.pressingRight) { this.speedX = this.maxSpeed; }
        else if (this.pressingLeft)  { this.speedX = -this.maxSpeed; }
        else                         { this.speedX = 0;              }

        if      (this.pressingUp)    { this.speedY = -this.maxSpeed; }
        else if (this.pressingDown)  { this.speedY = this.maxSpeed; }
        else                         { this.speedY = 0;              }
    }
    setPressingKey(inputId, state) {
        if      (inputId == 'right') { this.pressingRight = state; }
        else if (inputId == 'left')  { this.pressingLeft = state; }
        else if (inputId == 'up')    { this.pressingUp = state; }
        else if (inputId == 'down')  { this.pressingDown = state; }
    }
    static onConnect(socket) {
        const player = new Player(socket.id);
        socket.on('keyPress', (data) => {
            player.setPressingKey(data.inputId, data.state); // e.g. 'right', true
        });
    }
    static onDisconnect(socket) {
        delete Player.players[socket.id];
    }
    static updatePlayers() {
        // TODO: clean up
        const pack = [];
        for (let id in Player.players) {
          let player = Player.players[id];
          player.update();
          pack.push({
            number: player.number,
            x: player.x,
            y: player.y
          });
        }
        return pack;
    }
    static getNumPlayers() {
        return Object.keys(Player.players).length;
    }
}
// Static properties (not available in JavaScript I believe)
Player.players = {};

class Bullet extends Entity {
    constructor(angle) {
        super();
        this.id = generateId();
        this.speedX = Math.cos(angle / 180 * Math.PI) * 10;
        this.speedY = Math.sin(angle / 180 * Math.PI) * 10;
        this.timer = 0;
        this.toRemove = false;
        Bullet.bullets[this.id] = this;
    }
    update() {
        if (this.timer++ > Bullet.durationInFrames) { this.toRemove = true; }
        super.update();
    }
    // TODO: unsure
    static destroy(id) {
        delete Bullet.bullets[id];
    }
    static updateBullets() {
        // TODO: temp
        if (Math.random() < 0.1) {
            new Bullet(Math.random() * 360);
        }

        // TODO: clean up
        const pack = [];
        for (let id in Bullet.bullets) {
            let bullet = Bullet.bullets[id];

            // TODO: unsure
            if (bullet.toRemove) {
                Bullet.destroy(bullet.id);
            }

            bullet.update();
            pack.push({
                x: bullet.x,
                y: bullet.y
            });
        }
        return pack;
    }
}
Bullet.bullets = {};
Bullet.durationInFrames = 100;

module.exports = {
    Player: Player,
    Bullet: Bullet
};