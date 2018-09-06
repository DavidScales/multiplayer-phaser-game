
function create() {
  player = this.physics.add.sprite(width/2, height/2, 'ship');
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
}