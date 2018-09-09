const worldSize = 1920;

function create() {
  this.game = {};

  // World
  game.camera = this.cameras.main;
  game.camera.setBounds(0, 0, worldSize, worldSize);
  this.physics.world.setBounds(0, 0, worldSize, worldSize);
  this.add.tileSprite(0, 0, worldSize, worldSize, 'misc', 64)
    .setScale(2);

  // Player
  game.player = spawnPlayer(this);
  game.camera.startFollow(game.player, true);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();

  // Text
  game.text = this.add.text(32, 32).setScrollFactor(0).setFontSize(32).setColor('#ffffff');
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

  const player = game.physics.add.sprite(worldSize / 2, worldSize / 2, spriteSheet.key)
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