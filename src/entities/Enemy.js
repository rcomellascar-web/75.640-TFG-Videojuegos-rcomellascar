import * as Phaser from "phaser";

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    // Animación
    super(scene, x, y, "enemy_sheet");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // tamaño
    this.setDisplaySize(80, 96);

    //centro
    this.setOrigin(0.5, 0.5);

    if (this.body) {
      // Dimensiones reales
      const anchoCuerpo = 45; 
      const altoCuerpo = 60;  

      this.body.setSize(anchoCuerpo, altoCuerpo);

      // centrado horizontal
      const offsetX = (this.width - anchoCuerpo) / 2;

      // Ajuste de la hitbox hacia abajo para que quede más cerca de los pies
      const offsetY = this.height - altoCuerpo ; 

      this.body.setOffset(offsetX, offsetY);

      // Físicas base
      this.body.setBounce(0.2, 0.2);
      this.body.setCollideWorldBounds(true);
      this.body.setMaxVelocity(200);
    }

    // Variables de estado
    this.hp = 10;
    this.isStunned = false;

    // Animación de caminar nada más nacer
    this.anims.play("enemy_walk", true);
  }

  spawn(x, y) {
    if (this.body) {
      this.body.reset(x, y);
      this.body.enable = true; 
      this.body.setImmovable(false);
    }
    this.setActive(true);
    this.setVisible(true);
    this.isStunned = false;
    this.hp = 10;
    this.clearTint();
    this.anims.play("enemy_walk", true);
  }

  separate(enemies) {
    if (!this.active || this.isStunned) return;

    enemies.getChildren().forEach((other) => {
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
    if (!this.active) return false;

    this.hp -= amount;
    this.isStunned = true;
    
    if (this.hp > 0) {
      this.scene.sound.play("enemy_hit", { volume: 0.3 });
    }

    if (this.body) {
      this.body.setVelocity(0, 0);
      this.body.setImmovable(true);
    }

    // Animación daño
    this.setTint(0xff0000);

    // Recuperación tras el impacto 
    this.scene.time.delayedCall(300, () => {
      if (this.active) {
        this.clearTint(); 
        this.isStunned = false;
        if (this.body) this.body.setImmovable(false);
      }
    });

    if (this.hp <= 0) {
      this.scene.sound.play("enemy_die", { volume: 0.2 });
      this.die();
      return true;
    }
    return false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Solo gira si está vivo y no está stuneado por un golpe
    if (this.active && !this.isStunned) {
      const miraIzquierda = this.scene.player.x < this.x;
      this.setFlipX(miraIzquierda);
    }
  }

  die() {
    this.setActive(false);
    this.setVisible(false);

    if (this.body) {
      this.body.stop(); 
      this.body.enable = false; 
    }
  }
}