const worldSize = 2000;
// TODO: better scoping
const self = {};

function create() {
  this.physics.world.setBounds(0, 0, worldSize, worldSize);

  self.player = spawnPlayer(this);
  this.cameras.main.startFollow(self.player);

  // this.add.tileSprite()

  cursors = this.input.keyboard.createCursorKeys();
}

function spawnPlayer(game) {

  const spriteSheet = {
    key: 'characters',
    frames: {
      down: { start: 0, end: 2 },
      left: { start: 12, end: 14 },
      right: { start: 24, end: 26 },
      up: { start: 36, end: 38 },
    }
  }

  const player = game.physics.add.sprite(width / 2, height / 2, spriteSheet.key)
    .setScale(2);

  player.setCollideWorldBounds(true);

  Object.keys(spriteSheet.frames).forEach(direction => {
    game.anims.create({
      key: direction,
      frames: game.anims.generateFrameNumbers(spriteSheet.key, spriteSheet.frames[direction]),
      frameRate: 10,
      repeat: -1
    });
  })

  return player;
}