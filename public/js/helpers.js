//
function generateGrid(worldSize) {
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
  return grid;
}

//
function getUniqueRandomLocation(game) {
  const randomIndex = Math.floor(Math.random() * game.grid.length);
  const location = game.grid[randomIndex];
  game.grid.splice(randomIndex, 1);
  return location;
}

function generateObstacles(game, numObstacles) {

  // const spriteSheet = {
  //   key: 'misc',
  //   frames: {
  //     down: { start: 0, end: 2 },
  //     left: { start: 12, end: 14 },
  //     right: { start: 24, end: 26 },
  //     up: { start: 36, end: 38 },
  //   }
  // }

  const obstacles = game.physics.add.staticGroup();
  for (let i = 0; i < numObstacles; i++) {
    let location = getUniqueRandomLocation(game.game);
    // let spriteIndex = Math.floor(Math.random() * 10);
    generateObstacle(location);
  }
  return obstacles;
}

function generateObstacle(location) {
  game.obstacles.add(location.x, location.y, 'misc');

  // obstacle.anims.play(animation, true);
}

