import * as Phaser from "phaser";
import Bullet from "../entities/Bullet.js";
import Enemy from "../entities/Enemy.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    //  CONFIGURACIÓN DEL MUNDO
    const worldWidth = 1600;
    const worldHeight = 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    //RELIEVE DEL MAPA

    this.add.grid(
      worldWidth / 2,
      worldHeight / 2,
      worldWidth,
      worldHeight,
      64,
      64,
      0x222222,
      1,
      0x444444,
      1,
    );

    // Borde visual blanco para delimitar el fin del mapa
    this.add
      .rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight)
      .setStrokeStyle(10, 0xffffff, 0.2);

    //  VARIABLES DE ESTADO
    this.score = 0;
    this.currentRound = 0;
    this.enemiesLeftInRound = 0;
    this.isGameOver = false;
    this.lastFired = 0;
    this.isWaitingForNextRound = false;
    this.isRoundTransitioning = false;
    this.isPaused = false;
    this.pauseMenu = null;
    this.enemiesToSpawn = 8;
    this.playerBaseSpeed = 250;
    this.playerCurrentSpeed = 250;
    this.money = 50;
    this.hasUzi = false;
    this.hasShotgun = false;
    this.weapons = ["PISTOLA"];
    this.currentWeaponIndex = 0;
    this.lastFiredTime = 0;

    // Tecla de Escape
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Lógica de vida y estado del jugador
    this.playerHP = 20;
    this.isInvulnerable = false;

    //  UI
    this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(10);
    this.scoreText = this.add.text(20, 20, `PUNTOS: ${this.score}`, {
      fontSize: "24px",
      fill: "#fff",
      fontStyle: "bold",
    });
    this.roundText = this.add.text(20, 50, "RONDA: 0", {
      fontSize: "24px",
      fill: "#ffff00",
      fontStyle: "bold",
    });
    this.hpText = this.add.text(20, 80, "VIDA: 20", {
      fontSize: "24px",
      fill: "#ff4444",
      fontStyle: "bold",
    });
    this.moneyText = this.add
      .text(20, 110, `${this.money}$`, {
        fontSize: "24px",
        fill: "#44ff44",

        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(10);
    this.uiContainer.add([
      this.scoreText,
      this.roundText,
      this.hpText,
      this.moneyText,
    ]);

    this.weaponText = this.add
      .text(400, 560, "ARMA: PISTOLA", {
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);
    //  JUGADOR
    this.player = this.add.rectangle(
      worldWidth / 2,
      worldHeight / 2,
      32,
      32,
      0x00ff00,
    );
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    //  CÁMARA
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    //  GRUPOS 
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 50 });
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: 250 });

    //  SISTEMA DE COLISIONES

    // Colisión entre enemigos
    this.physics.add.collider(this.enemies, this.enemies);

    // Proyectil -> Enemigo
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.die();

        //  DINERO POR HIT
        this.money += 2;

        // DAÑO
        const isDead = enemy.receiveDamage(5);

        if (isDead) {
          //  DINERO POR KILL
          this.money += 5; 

          this.score += 10;
          this.enemiesLeftInRound--;

          // Cambio de ronda
          if (this.enemiesLeftInRound <= 0 && !this.isRoundTransitioning) {
            this.time.delayedCall(100, () => {
              this.nextRound();
            });
          }
        }

        // Actualizamos el texto en pantalla 
        this.moneyText.setText(`${this.money}$`);
        this.scoreText.setText(`PUNTOS: ${this.score}`);
      }
    });

    // Enemigo -> Jugador 
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        if (enemy.active && !this.isInvulnerable && !this.isGameOver) {
          this.handlePlayerDamage();
        }
      },
      null,
      this,
    );

    //  CONTROLES
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
      shootUp: "UP",
      shootDown: "DOWN",
      shootLeft: "LEFT",
      shootRight: "RIGHT",
    });

    //  BARRA DE VIDA VISUAL
    this.healthBar = this.add.graphics();
    this.healthBar.setDepth(11); 

    // Recuperación de vida

    this.lastDamageTime = 0; 
    this.nextRegenTime = 0; 

    //Tienda
    this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.isShopOpen = false;
    this.shopMenu = null;

    // Solapamiento
    this.physics.world.setFPS(60); 
    this.physics.world.OVERLAP_BIAS = 10; 

    this.physics.add.collider(this.enemies, this.enemies);

    // Punto y coma
    this.keyPrev = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.COMMA,
    );
    this.keyNext = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.PERIOD,
    );
    this.arrowKeys = this.input.keyboard.createCursorKeys();

    //Primera ronda
    this.nextRound();
  }

  nextRound() {
    // Transición 
    if (this.isRoundTransitioning) return;
    this.isRoundTransitioning = true;

    // Número de ronda
    this.currentRound++;
    console.log(
      `%c INICIANDO RONDA ${this.currentRound} `,
      "background: #222; color: #bada55; font-size: 1.2em",
    );

    this.roundText.setText("RONDA: " + this.currentRound);

    // Cantidad enemigos
    if (this.currentRound > 1) {
      this.enemiesToSpawn = Math.ceil((this.enemiesToSpawn + 2) * 1.3);
    } else {
      this.enemiesToSpawn = 8; 
    }

    this.enemiesLeftInRound = 999;

    const announcement = this.add
      .text(400, 520, `RONDA ${this.currentRound}`, {
        fontSize: "36px",
        fill: "#ffff00",
        fontStyle: "bold",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setScrollFactor(0);

    // Animación del texto
    this.tweens.add({
      targets: announcement,
      alpha: { from: 0, to: 1 },
      y: 500,
      duration: 600,
      onComplete: () => {
        this.time.delayedCall(3400, () => {
          this.tweens.add({
            targets: announcement,
            alpha: 0,
            y: 520,
            duration: 600,
            onComplete: () => {
              announcement.destroy();
            },
          });
        });
      },
    });

    // Spawn de enemigos
    this.time.delayedCall(7000, () => {
      if (this.isGameOver) return;

      console.log(`Spawneando ${this.enemiesToSpawn} enemigos...`);

      this.enemies.clear(true, true);
      this.enemiesLeftInRound = this.enemiesToSpawn;
      this.isRoundTransitioning = false; 
      const spawnDelay = Math.max(100, 850);

      for (let i = 0; i < this.enemiesToSpawn; i++) {
        const spawnX = 1600 / 2;
        const spawnY = i % 2 === 0 ? 50 : 1150;

        this.time.delayedCall(i * spawnDelay, () => {
          if (this.isGameOver || this.isPaused) return;

          let enemy = this.enemies.get();
          if (enemy) {
            enemy.spawn(spawnX, spawnY);
          }
        });
      }
    });
  }

  drawHealthBar() {
    this.healthBar.clear();

    const x = this.player.x - 20;
    const y = this.player.y - 30; 
    const width = 40;
    const height = 6;

    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(x, y, width, height);

    //Barra salud 
    const healthWidth = (this.playerHP / 20) * width;

    if (this.playerHP > 10) {
      this.healthBar.fillStyle(0x00ff00); 
    } else if (this.playerHP > 5) {
      this.healthBar.fillStyle(0xffff00); 
    } else {
      this.healthBar.fillStyle(0xff0000); 
    }

    if (healthWidth > 0) {
      this.healthBar.fillRect(x, y, healthWidth, height);
    }
  }

  update(time, delta) {
    // Menús
    if (
      Phaser.Input.Keyboard.JustDown(this.escKey) &&
      !this.isGameOver &&
      !this.isShopOpen
    ) {
      this.togglePause();
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.bKey) &&
      !this.isGameOver &&
      !this.isPaused
    ) {
      this.toggleShop();
    }

    
    if (this.isPaused || this.isShopOpen) {
      const pointer = this.input.activePointer;
      if (pointer.primaryDown) {
        const px = pointer.x;
        const py = pointer.y;

        //  TIENDA
        if (this.isShopOpen) {
          if (
            !this.hasUzi &&
            this.money >= 30 &&
            this.uziBtn &&
            this.uziBtn.getBounds().contains(px, py)
          ) {
            this.money -= 30;
            this.hasUzi = true;
            this.weapons.push("UZI"); 
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
          }
          else if (
            !this.hasShotgun &&
            this.money >= 20 &&
            this.shotgunBtn &&
            this.shotgunBtn.getBounds().contains(px, py)
          ) {
            this.money -= 20;
            this.hasShotgun = true;
            this.weapons.push("SHOTGUN"); 
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
          }
          else if (
            this.closeShopBtn &&
            this.closeShopBtn.getBounds().contains(px, py)
          ) {
            this.toggleShop();
            pointer.primaryDown = false;
          }
        }

        // Pausa 
        if (this.isPaused) {
          if (this.resumeBtn && this.resumeBtn.getBounds().contains(px, py)) {
            this.togglePause();
            pointer.primaryDown = false;
          } else if (
            this.quitBtn &&
            this.quitBtn.getBounds().contains(px, py)
          ) {
            this.isPaused = false;
            this.isGameOver = false;
            this.physics.world.resume();
            this.time.paused = false;
            this.tweens.resumeAll();
            this.scene.start("MenuScene");
          }
        }
      }
      return; 
    }

    if (this.isGameOver) return;

    //  MOVIMIENTO DEL JUGADOR
    this.player.body.setVelocity(0);

    if (this.keys.left.isDown)
      this.player.body.setVelocityX(-this.playerCurrentSpeed);
    else if (this.keys.right.isDown)
      this.player.body.setVelocityX(this.playerCurrentSpeed);

    if (this.keys.up.isDown)
      this.player.body.setVelocityY(-this.playerCurrentSpeed);
    else if (this.keys.down.isDown)
      this.player.body.setVelocityY(this.playerCurrentSpeed);

    const enemySpeed = 150;

    // IA Enemigos 
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.separate(this.enemies);

        if (!enemy.isStunned) {
          this.physics.moveToObject(enemy, this.player, enemySpeed);
        } else {
          enemy.body.setVelocity(0, 0);
        }
      }
    });

    //  LÓGICA DE REGENERACIÓN
    if (time - this.lastDamageTime > 7000) {
      if (this.playerHP < 20 && time > this.nextRegenTime) {
        this.playerHP += 2;
        if (this.playerHP > 20) this.playerHP = 20;

        this.hpText.setText("VIDA: " + this.playerHP);
        this.nextRegenTime = time + 1000;

        this.player.setFillStyle(0x00ff00);
        this.time.delayedCall(100, () => {
          if (!this.isGameOver) this.player.setFillStyle(0x00ff00);
        });
      }
    }
    // Cambio de arma 
    if (Phaser.Input.Keyboard.JustDown(this.keyPrev)) {
      this.currentWeaponIndex =
        (this.currentWeaponIndex - 1 + this.weapons.length) %
        this.weapons.length;
      this.weaponText.setText("ARMA: " + this.weapons[this.currentWeaponIndex]);
    }

    // Cambio de arma 
    if (Phaser.Input.Keyboard.JustDown(this.keyNext)) {
      this.currentWeaponIndex =
        (this.currentWeaponIndex + 1) % this.weapons.length;
      this.weaponText.setText("ARMA: " + this.weapons[this.currentWeaponIndex]);
    }

    this.handleShooting(time);
    this.handleBulletRecycle();
    this.drawHealthBar();
  }

  //DISPAROS
  handleShooting(time) {
    if (this.isPaused || this.isShopOpen || this.isGameOver) return;

    const weapon = this.weapons[this.currentWeaponIndex];
    let fireRate = 400;

    if (weapon === "UZI") fireRate = 200;
    if (weapon === "SHOTGUN") fireRate = 600;

    let isShooting = false;
    let shootAngle = 0;

    //   Disparo con el ratón 
    if (this.input.activePointer.isDown) {
      isShooting = true;
      shootAngle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    //  Disparo con las Flechas del Teclado
    else {
      let dirX = 0;
      let dirY = 0;

      if (this.arrowKeys.left.isDown) dirX = -1;
      else if (this.arrowKeys.right.isDown) dirX = 1;

      if (this.arrowKeys.up.isDown) dirY = -1;
      else if (this.arrowKeys.down.isDown) dirY = 1;

      if (dirX !== 0 || dirY !== 0) {
        isShooting = true;
        shootAngle = Math.atan2(dirY, dirX);
      }
    }

    if (isShooting && time > this.lastFiredTime) {
      if (weapon === "SHOTGUN") {
        this.fireBullet(shootAngle); 
        this.fireBullet(shootAngle + 0.1); 
        this.fireBullet(shootAngle - 0.1); 
      } else {
        this.fireBullet(shootAngle); 
      }
      this.lastFiredTime = time + fireRate;
    }
  }

  fireBullet(angle) {
    let bullet = this.bullets.get();

    if (bullet) {
      const bulletSpeed = 600;

      const velocityX = Math.cos(angle) * bulletSpeed;
      const velocityY = Math.sin(angle) * bulletSpeed;

      bullet.fire(this.player.x, this.player.y, velocityX, velocityY);
    }
  }

  handleBulletRecycle() {
    this.bullets.getChildren().forEach((bullet) => {
      if (
        bullet.active &&
        Phaser.Math.Distance.Between(
          bullet.startX,
          bullet.startY,
          bullet.x,
          bullet.y,
        ) > 400
      ) {
        bullet.die();
      }
    });
  }

  handlePlayerDamage() {
    this.playerHP -= 5;
    this.hpText.setText("VIDA: " + this.playerHP);
    this.lastDamageTime = this.time.now;

    if (this.playerHP <= 0) {
      this.gameOver();
      return;
    }

    this.isInvulnerable = true;

    // Relentización por daño
    this.playerCurrentSpeed = this.playerBaseSpeed * 0.6;

    // Parpadeo
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 100,
      ease: "Linear",
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.isInvulnerable = false;
        this.player.alpha = 1;
        this.playerCurrentSpeed = this.playerBaseSpeed;
      },
    });

    this.cameras.main.shake(100, 0.005);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.world.pause();
      this.tweens.pauseAll();

      this.time.paused = true;

      this.showPauseMenu();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();

      this.time.paused = false;

      if (this.pauseMenu) {
        this.pauseMenu.destroy();
        this.pauseMenu = null;
      }
      if (this.pauseBg) {
        this.pauseBg.destroy();
        this.pauseBg = null;
      }
      this.resumeBtn = null;
      this.quitBtn = null;
    }
  }
  showPauseMenu() {
    const x = 400;
    const y = 300;

    // Fondo oscuro 
    this.pauseBg = this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive();

    // Contenedor principal
    this.pauseMenu = this.add.container(0, 0).setDepth(2001).setScrollFactor(0);

    const title = this.add
      .text(x, y - 100, "PAUSA", {
        fontSize: "48px",
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Definir botones
    this.resumeBtn = this.add
      .text(x, y, " REANUDAR ", {
        fontSize: "32px",
        fill: "#0f0",
        backgroundColor: "#222",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.quitBtn = this.add
      .text(x, y + 100, " SALIR AL MENÚ ", {
        fontSize: "28px",
        fill: "#f00",
        backgroundColor: "#222",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Efectos visuales de hover 
    [this.resumeBtn, this.quitBtn].forEach((btn) => {
      btn.on("pointerover", () => btn.setStyle({ fill: "#fff" }));
      btn.on("pointerout", () => {
        const color = btn === this.resumeBtn ? "#0f0" : "#f00";
        btn.setStyle({ fill: color });
      });
    });

    this.pauseMenu.add([title, this.resumeBtn, this.quitBtn]);
  }

  toggleShop() {
    this.isShopOpen = !this.isShopOpen;

    if (this.isShopOpen) {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.showShopMenu();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();
      this.time.paused = false;

      if (this.shopMenu) {
        this.shopMenu.destroy();
        this.shopMenu = null;
      }
      if (this.shopBg) {
        this.shopBg.destroy();
        this.shopBg = null;
      }
      this.closeShopBtn = null;
    }
  }

  showShopMenu() {
    const x = 400;
    const y = 300;

    this.shopBg = this.add
      .rectangle(400, 300, 800, 600, 0x000033, 0.9)
      .setScrollFactor(0)
      .setDepth(3000)
      .setInteractive();

    this.shopMenu = this.add.container(0, 0).setDepth(3001).setScrollFactor(0);

    const title = this.add
      .text(x, 50, "ARMERÍA", {
        fontSize: "48px",
        fill: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const shopMoneyText = this.add
      .text(x, 110, `TU DINERO: $${this.money}`, {
        fontSize: "26px",
        fill: "#44ff44",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    let uziLabel = this.hasUzi ? "ADQUIRIDA" : "MINI UZI ($500)";
    this.uziBtn = this.add
      .text(x, 220, uziLabel, {
        fontSize: "24px",
        fill: this.hasUzi ? "#666" : this.money >= 30 ? "#fff" : "#f00",
        backgroundColor: "#222",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !this.hasUzi });

    let shotgunLabel = this.hasShotgun ? "ADQUIRIDA" : "SHOTGUN ($1000)";
    this.shotgunBtn = this.add
      .text(x, 320, shotgunLabel, {
        fontSize: "24px",
        fill: this.hasShotgun ? "#666" : this.money >= 20 ? "#fff" : "#f00",
        backgroundColor: "#222",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !this.hasShotgun });

    this.closeShopBtn = this.add
      .text(x, 500, " VOLVER AL COMBATE ", {
        fontSize: "24px",
        fill: "#fff",
        backgroundColor: "#c00",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.shopMenu.add([
      title,
      shopMoneyText,
      this.uziBtn,
      this.shotgunBtn,
      this.closeShopBtn,
    ]);
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.isInvulnerable = false; 

    // Efecto visual de impacto
    this.cameras.main.shake(300, 0.01);
    this.player.setFillStyle(0xff0000); 

    const x = this.cameras.main.worldView.centerX;
    const y = this.cameras.main.worldView.centerY;

    const overlay = this.add.rectangle(x, y, 800, 600, 0x000000, 0.7);

    this.add
      .text(x, y - 100, "¡Muerto!", {
        fontSize: "64px",
        fill: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y - 20, `Puntuación: ${this.score}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + 20, `Ronda: ${this.currentRound}`, {
        fontSize: "24px",
        fill: "#ffff00",
      })
      .setOrigin(0.5);

    const restartBtn = this.add
      .text(x, y + 100, "REINTENTAR", {
        fontSize: "28px",
        fill: "#0f0",
        backgroundColor: "#111",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartBtn.on("pointerdown", () => {
      this.scene.restart();
    });

    const menuBtn = this.add
      .text(x, y + 170, "MENÚ PRINCIPAL", {
        fontSize: "24px",
        fill: "#fff",
        backgroundColor: "#111",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuBtn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    [restartBtn, menuBtn].forEach((btn) => {
      btn.on("pointerover", () => btn.setStyle({ fill: "#ff0" }));
      btn.on("pointerout", () => {
        const originalColor = btn === restartBtn ? "#0f0" : "#fff";
        btn.setStyle({ fill: originalColor });
      });
    });
  }
}
