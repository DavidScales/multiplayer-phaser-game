const worldSize = 2000;
const self = {};

function create() {
  // TODO: use center property instead?
  self.player = this.physics.add.sprite(width / 2, height / 2, 'ship');
  self.player.setCollideWorldBounds(true);

  this.physics.world.setBounds(0, 0, worldSize, worldSize);
  this.cameras.main.startFollow(self.player);

  cursors = this.input.keyboard.createCursorKeys();
}