import * as Phaser from 'phaser';

export default class RayBullet extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 30, 4, 0x00ffff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.hitEnemies = new Set();
    this.startX = 0;
    this.startY = 0;
    this.maxRange = 500; 
  }

  fire(x, y, velocityX, velocityY, angle, range) {
    this.body.reset(x, y); 
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocity(velocityX, velocityY);
    this.rotation = angle; 
    this.hitEnemies.clear(); 
    
    this.startX = x;
    this.startY = y;
    this.maxRange = range; 
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
  }

  preUpdate(time, delta) {
    if (!this.active) return;
    
    const distanceTraveled = Phaser.Math.Distance.Between(this.x, this.y, this.startX, this.startY);
    
    if (distanceTraveled >= this.maxRange || this.x < 0 || this.x > 1600 || this.y < 0 || this.y > 1200) {
      this.die();
    }
  }
}