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

  // Obstacles
  this.randomGrid = this.generateRandomGrid(worldSize);
  this.obstacles = this.generateObstacles();

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

//
function shuffle(array) {
  let currentIndex, randomIndex, tempValue;
  for (currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
      randomIndex = Math.floor(Math.random() * (currentIndex + 1));
      tempValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = tempValue;
  }
  return array;
}

//
function generateRandomGrid(worldSize) {
  const grid = [];
  const gridUnitSize = 32;
  const gridEdge = Math.floor(worldSize / gridUnitSize);
  for (let x = 0; x < gridEdge; x++) {
      for (let y = 0; y < gridEdge; y++) {
          let gridX = x * gridUnitSize;
          let gridY = y * gridUnitSize;
          grid.push({x: gridX, y: gridY});
      }
  }
  return shuffle(grid);
}

//
function generateObstacles() {
  const numObstacles = Math.floor(this.randomGrid.length * 0.05);
  const obstacles = this.physics.add.staticGroup();
  const tempObstacleFrames = [20, 30, 38, 58]; // TODO:

  for (let i = 0; i < numObstacles; i++) {
    let randomLocation = this.randomGrid.pop();
    let randomSpriteFrame = tempObstacleFrames[Math.floor(Math.random() * tempObstacleFrames.length)];
    this.generateObstacle(obstacles, randomLocation, randomSpriteFrame);
  }
  this.physics.add.collider(this.player, obstacles);
  return obstacles;
}

//
function generateObstacle(obstacles, location, spriteFrame) {
  obstacles.create(location.x, location.y, 'misc', spriteFrame)
    .setScale(2).refreshBody();
}



