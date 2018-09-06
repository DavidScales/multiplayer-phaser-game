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
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
