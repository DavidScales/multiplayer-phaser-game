function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('star', 'assets/star_gold.png');

  this.load.spritesheet('characters', 'assets/temp_characters.png', {
    frameWidth: 16, frameHeight: 16
  });
  this.load.spritesheet('misc', 'assets/temp_misc.png', {
    frameWidth: 16, frameHeight: 16
  });
}