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

  const player = game.physics.add.sprite(width / 2, height / 2, 'characters')
    .setScale(2);

  player.setCollideWorldBounds(true);

  game.anims.create({
    key: 'down',
    frames: game.anims.generateFrameNumbers('characters', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1
  });
  game.anims.create({
      key: 'left',
      frames: game.anims.generateFrameNumbers('characters', { start: 12, end: 14 }),
      frameRate: 10,
      repeat: -1
  });
  game.anims.create({
      key: 'right',
      frames: game.anims.generateFrameNumbers('characters', { start: 24, end: 26 }),
      frameRate: 10,
      repeat: -1
  });
  game.anims.create({
    key: 'up',
    frames: game.anims.generateFrameNumbers('characters', { start: 36, end: 38 }),
    frameRate: 10,
    repeat: -1
  });

  return player;
}