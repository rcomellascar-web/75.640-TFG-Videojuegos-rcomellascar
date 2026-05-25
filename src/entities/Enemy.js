import * as Phaser from "phaser";

export default class Enemy extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 32, 32, 0xff0000);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (this.body) {
      // círculo para que resbalen
      this.body.setCircle(20);
      this.body.setOffset(2, 2);
      this.body.setBounce(0.2, 0.2); 
      this.body.setCollideWorldBounds(true);
      
      // Evitar que las fuerzas externas los amontonen
      this.body.setMaxVelocity(200); 
    }

    this.hp = 10;
    this.isStunned = false;
  }

  spawn(x, y) {
    if (this.body) {
        this.body.reset(x, y);
        this.body.setImmovable(false);
    }
    this.setActive(true);
    this.setVisible(true);
    this.isStunned = false;
    this.hp = 10;
    this.setFillStyle(0xff0000);
  }

  separate(enemies) {
    if (!this.active || this.isStunned) return;

    enemies.getChildren().forEach(other => {
      if (other !== this && other.active) {
        let distance = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
        
        if (distance < 30) {
          let angle = Phaser.Math.Angle.Between(other.x, other.y, this.x, this.y);
          this.body.velocity.x += Math.cos(angle) * 20;
          this.body.velocity.y += Math.sin(angle) * 20;
        }
      }
    });
  }

  receiveDamage(amount) {
    this.hp -= amount;
    this.isStunned = true;
    if (this.hp > 0) {
      this.scene.sound.play('enemy_hit', { volume: 0.3 });
    }
    if (this.body) {
        this.body.setVelocity(0, 0);
        this.body.setImmovable(true); 
    }

    this.setFillStyle(0xffffff);

    this.scene.time.delayedCall(300, () => {
        if (this.active) {
            this.setFillStyle(0xff0000);
            this.isStunned = false;
            if (this.body) this.body.setImmovable(false); 
        }
    });

    if (this.hp <= 0) {
        this.scene.sound.play('enemy_die', { volume: 0.3 });
        this.die();
        return true;
    }
    return false;
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.stop();
  }
}