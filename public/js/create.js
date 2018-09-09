const worldSize = 1920;

function create() {

  // World
  this.cameras.main.setBounds(0, 0, worldSize, worldSize);
  this.physics.world.setBounds(0, 0, worldSize, worldSize);
  this.add.tileSprite(0, 0, worldSize, worldSize, 'misc', 64)
    .setScale(2);

  // Player
  this.player = this.spawnPlayer();
  this.cameras.main.startFollow(this.player, true);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();

  // Text
  this.text = this.add.text(32, 32).setScrollFactor(0).setFontSize(32).setColor('#ffffff');
}

function spawnPlayer() {

  const spriteSheet = {
    key: 'characters',
    frames: {
      down: { start: 0, end: 2 },
      left: { start: 12, end: 14 },
      right: { start: 24, end: 26 },
      up: { start: 36, end: 38 },
    }
  }

  const player = this.physics.add.sprite(worldSize / 2, worldSize / 2, spriteSheet.key)
    .setScale(2);

  player.setCollideWorldBounds(true);

  Object.keys(spriteSheet.frames).forEach(direction => {
    this.anims.create({
      key: direction,
      frames: this.anims.generateFrameNumbers(spriteSheet.key, spriteSheet.frames[direction]),
      frameRate: 10,
      repeat: -1
    });
  })

  return player;
}


  // Obstacles
  // game.grid = generateGrid(worldSize);

  // const numObstacles = Math.floor(game.grid.length * 0.1);
  // game.obstacles = generateObstacles(this, numObstacles);

