function update() {

  handlerPlayerMovement();

}

function handlerPlayerMovement() {

  function move(animation, xVelocity, yVelocity) {
    self.player.anims.play(animation, true);
    self.player.setVelocity(xVelocity, yVelocity);
  }

  if (cursors.left.isDown && cursors.up.isDown) {
    move('left', -160, -160);
  }
  else if (cursors.left.isDown && cursors.down.isDown) {
    move('left', -160, 160);
  }
  else if (cursors.right.isDown && cursors.up.isDown) {
    move('right', 160, -160);
  }
  else if (cursors.right.isDown && cursors.down.isDown) {
    move('right', 60, 160);
  }
  else if (cursors.left.isDown) {
    move('left', -160, 0);
  }
  else if (cursors.right.isDown) {
    move('right', 160, 0);
  }
  else if (cursors.up.isDown) {
    move('up', 0, -160);
  }
  else if (cursors.down.isDown) {
    move('down',0, 160);
  }
  else {
    self.player.anims.stop();
    self.player.setVelocity(0, 0);
  }
}