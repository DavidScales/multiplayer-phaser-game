function update() {
  handlerPlayerMovement();
  debug();
}

function debug() {
  game.text.setText([
    'ScrollX: ' + game.camera.scrollX,
    'ScrollY: ' + game.camera.scrollY,
    'MidX: ' + Math.round(game.player.x),
    'MidY: ' + Math.round(game.player.y)
  ])
}

function handlerPlayerMovement() {

  function move(animation, xVelocity, yVelocity) {
    game.player.anims.play(animation, true);
    game.player.setVelocity(xVelocity, yVelocity);
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
    move('right', 160, 160);
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
    game.player.anims.stop();
    game.player.setVelocity(0, 0);
  }
}