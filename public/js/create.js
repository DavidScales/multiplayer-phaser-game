const worldSize = 1920;

function create() {

  // World
  this.cameras.main.setBounds(0, 0, worldSize, worldSize);
  this.physics.world.setBounds(0, 0, worldSize, worldSize);
  this.add.tileSprite(0, 0, worldSize, worldSize, 'misc', 64)
    .setScale(2);

  // Animations
  this.createAnimations();

  // Player
  this.player = this.spawnPlayer();
  this.cameras.main.startFollow(this.player, true);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();

  // Grid for obstacles, enemies, etc.
  this.randomGrid = this.generateRandomGrid(worldSize);
  // Enemies
  this.enemies = this.generateEnemies();
  // Obstacles
  this.obstacles = this.generateObstacles();

  // Text
  this.text = this.add.text(32, 32).setScrollFactor(0).setFontSize(32).setColor('#ffffff');
}

function createAnimations() {
  const spriteSheet = {
    key: 'characters',
    frames: {
      player_down: { start: 0, end: 2 },
      player_left: { start: 12, end: 14 },
      player_right: { start: 24, end: 26 },
      player_up: { start: 36, end: 38 },
      enemy_down: { start: 9, end: 11 },
      enemy_left: { start: 21, end: 23 },
      enemy_right: { start: 33, end: 35 },
      enemy_up: { start: 45, end: 47 },
    }
  }
  Object.keys(spriteSheet.frames).forEach(direction => {
    this.anims.create({
      key: direction,
      frames: this.anims.generateFrameNumbers(spriteSheet.key, spriteSheet.frames[direction]),
      frameRate: 10,
      repeat: -1
    });
  })
}

function spawnPlayer() {
  const player = this.physics.add.sprite(worldSize / 2, worldSize / 2, 'characters')
    .setScale(2);
  player.setCollideWorldBounds(true);
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
function generateObstacle(obstacles, location, spriteFrame) {
  obstacles.create(location.x, location.y, 'misc', spriteFrame)
    .setScale(2).refreshBody();
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
  this.physics.add.collider(this.enemies, obstacles);
  return obstacles;
}

//
function generateEnemy(enemies, location) {
  console.log(`generating enemy @ ${location.x}, ${location.y}`);
  enemies.create(location.x, location.y, 'characters')
    .setScale(2);
  // enemies.setCollideWorldBounds(true); // TODO: Do I need this?
}

//
function generateEnemies() {

  // TODO: randomGrid will be smaller now after generateObstacles
  // so these constants should be pulled out before randomGrid is consumed
  const numEnemies = Math.floor(this.randomGrid.length * 0.01);
  const enemies = this.physics.add.group();
  for (let i = 0; i < numEnemies; i++) {
    let randomLocation = this.randomGrid.pop();
    this.generateEnemy(enemies, randomLocation);
  }
  // TODO: custom callback for damage too
  // TODO: adding collision detection in the generation functions makes
  // them depend on the order in which the generation functions run
  // this.physics.add.collider(enemies, this.obstacles);
  this.physics.add.collider(enemies, this.player, collideEnemy, null, this);
  return enemies;
}

//
function collideEnemy() {
  console.log('ouch!');
}




