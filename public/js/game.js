const QuestGame = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function QuestGame() {
    Phaser.Scene.call(this, { key: 'questgame' });
  },
  preload: preload,
  create: create,
  update: update,
  spawnPlayer: spawnPlayer,
  handlerPlayerMovement: handlerPlayerMovement,
  debug: debug,
  generateRandomGrid: generateRandomGrid,
  generateObstacle: generateObstacle,
  generateObstacles: generateObstacles,
  generateEnemies: generateEnemies,
  generateEnemy: generateEnemy,
  handleEnemies: handleEnemies
});

const width = 800;
const height = 600;

const config = {
  type: Phaser.AUTO,
  // TODO: specify parent container
  parent: 'phaser-example',
  width: width,
  height: height,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [ QuestGame ]
};

const game = new Phaser.Game(config);
