function update() {

  if (cursors.left.isDown && cursors.up.isDown) {
    self.player.anims.play('left', true);
    self.player.setVelocityX(-160);
    self.player.setVelocityY(-160);
  }
  else if (cursors.left.isDown && cursors.down.isDown) {
    self.player.anims.play('left', true);
    self.player.setVelocityX(-160);
    self.player.setVelocityY(160);
  }
  else if (cursors.right.isDown && cursors.up.isDown) {
    self.player.anims.play('right', true);
    self.player.setVelocityX(160);
    self.player.setVelocityY(-160);
  }
  else if (cursors.right.isDown && cursors.down.isDown) {
    self.player.anims.play('right', true);
    self.player.setVelocityX(160);
    self.player.setVelocityY(160);
  }
  else if (cursors.left.isDown) {
    self.player.anims.play('left', true);
    self.player.setVelocityX(-160);
    self.player.setVelocityY(0);
  }
  else if (cursors.right.isDown) {
    self.player.anims.play('right', true);
    self.player.setVelocityX(160);
    self.player.setVelocityY(0);
  }
  else if (cursors.up.isDown) {
    self.player.anims.play('up', true);
    self.player.setVelocityX(0);
    self.player.setVelocityY(-160);
  }
  else if (cursors.down.isDown) {
    self.player.anims.play('down', true);
    self.player.setVelocityX(0);
    self.player.setVelocityY(160);
  }
  else {
    self.player.anims.stop();
    self.player.setVelocityY(0);
    self.player.setVelocityX(0);
  }

}