import * as Phaser from "phaser";

export default class EnemyProjectile extends Phaser.GameObjects.Arc {
  constructor(scene) {
    // Círculo de color lila 
    super(scene, 0, 0, 8, 0, 360, false, 0xaa00ff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.startX = 0;
    this.startY = 0;
    this.range = 500; 
  }

  fire(x, y, vx, vy) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.body.setVelocity(vx, vy);
    
    this.startX = x;
    this.startY = y;
  }

  update() {
    if (!this.active) return;

    // Si se aleja mucho de su punto de origen, se destruye
    if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) > this.range) {
      this.die();
    }
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    this.body.setVelocity(0, 0);
  }
}