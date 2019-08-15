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
    getDistanceFrom(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
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
        this.pressingAttack = false;
        this.mouseAngle = 0;
        this.maxSpeed = 10;
        // Add player to "global" players object
        Player.players[id] = this;
    }
    update() {
        this.updateSpeed();
        super.update();
        if (this.pressingAttack) {
            this.shootBullet(this.mouseAngle, this.id);
        }
    }
    shootBullet(angle, parent) {
        const bullet = new Bullet(angle, parent);
        bullet.x = this.x;
        bullet.y = this.y;
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
        if      (inputId == 'right')  { this.pressingRight = state; }
        else if (inputId == 'left')   { this.pressingLeft = state; }
        else if (inputId == 'up')     { this.pressingUp = state; }
        else if (inputId == 'down')   { this.pressingDown = state; }
        else if (inputId == 'attack') { this.pressingAttack = state; }
        else if (inputId == 'mouseAngle')   { this.mouseAngle = state; }
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
    constructor(angle, parent) {
        super();
        this.id = generateId();
        this.speedX = Math.cos(angle / 180 * Math.PI) * 10;
        this.speedY = Math.sin(angle / 180 * Math.PI) * 10;
        this.parent = parent;
        this.timer = 0;
        this.toRemove = false;
        Bullet.bullets[this.id] = this;
    }
    update() {
        if (this.timer++ > Bullet.durationInFrames) { this.toRemove = true; }
        super.update();

        for (let i in Player.players) {
            const player = Player.players[i];
            if (this.getDistanceFrom(player) < 32 && this.parent != player.id) {
                this.toRemove = true;
                // handle collision - hp and such
            }
        }
    }
    // TODO: unsure
    static destroy(id) {
        delete Bullet.bullets[id];
    }
    static updateBullets() {

        // TODO: clean up
        const pack = [];
        for (let id in Bullet.bullets) {
            let bullet = Bullet.bullets[id];
            if (bullet.toRemove) {
                Bullet.destroy(bullet.id);
            } else {
                bullet.update();
                pack.push({
                    x: bullet.x,
                    y: bullet.y
                });
            }
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