import * as Phaser from "phaser";

export default class PurpleEnemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'purple_1'); 
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDisplaySize(48, 64);

    if (this.body) { 
      //calculamos la hitbox circular
      this.baseRadioDeseado = 30; 
      
      this.body.setCircle(this.baseRadioDeseado / this.scaleX);

      const offsetXBase = (this.width - (this.baseRadioDeseado * 2 / this.scaleX)) / 2;
      
      this.baseOffsetX = offsetXBase;
      this.baseOffsetY = (this.height - (this.baseRadioDeseado * 2 / this.scaleY)) / 2 + 80; 

      this.body.setOffset(this.baseOffsetX, this.baseOffsetY);

      this.body.setBounce(0.2, 0.2); 
      this.body.setCollideWorldBounds(true);
      this.body.setMaxVelocity(200); 
    }

    this.hp = 35;
    this.isStunned = false;
    this.lastFired = 0;
    this.shootCooldown = 1000; 
  }

  spawn(x, y) {
    if (this.body) {
        this.body.reset(x, y);
        this.body.setImmovable(false);
        this.body.enable = true;
    }
    this.setActive(true);
    this.setVisible(true);
    this.isStunned = false;
    this.hp = 35;
    
    this.clearTint(); 
    this.isShooting = false;

    this.anims.play('purple_enemy_walk', true);
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

    this.setTint(0xff0000);

    this.scene.time.delayedCall(300, () => {
        if (this.active) {
            this.clearTint(); 
            this.isStunned = false;
            if (this.body) this.body.setImmovable(false); 
        }
    });

    if (this.hp <= 0) {
        this.scene.sound.play('enemy_die', { volume: 0.2 });
        this.die();
        return true;
    }
    return false;
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body){
      this.body.stop();
      this.body.enable = false;
    } 
  }

 preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.active && !this.isStunned) {
      const miraIzquierda = this.scene.player.x < this.x;
      this.setFlipX(miraIzquierda);

  
      const gapTotalWidth = this.width - (this.baseRadioDeseado * 2 / this.scaleX);
      
      
      this.body.offset.x = miraIzquierda ? (gapTotalWidth - this.baseOffsetX) : this.baseOffsetX;
      
      this.body.offset.y = this.baseOffsetY; 
    }
  } 

shoot(player, projectilesGroup, time) {
    if (this.active && !this.isStunned) {
        this.anims.play('purple_enemy_shoot', true);
    }

    if (time > this.lastFired) {
      let projectile = projectilesGroup.get();
      if (projectile) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const speed = 350; 

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        projectile.fire(this.x, this.y, vx, vy);

        this.scene.sound.play('purple_laser', { volume: 0.2 });
      }
      this.lastFired = time + this.shootCooldown;
    }
  }
}