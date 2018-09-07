function update() {

  if (cursors.left.isDown) {
    self.player.setVelocityX(-160);
  }
  else if (cursors.right.isDown) {
    self.player.setVelocityX(160);
  }
  else {
    self.player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    self.player.setVelocityY(-160);
  }
  else if (cursors.down.isDown) {
    self.player.setVelocityY(160);
  }
  else {
    self.player.setVelocityY(0);
  }

}