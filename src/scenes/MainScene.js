import * as Phaser from "phaser";
import Bullet from "../entities/Bullet.js";
import Enemy from "../entities/Enemy.js";
import PurpleEnemy from "../entities/PurpleEnemy.js";
import EnemyProjectile from "../entities/EnemyProjectile.js";
import RayBullet from "../entities/RayBullet.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  // Precarga de audios
  preload() {
    //CARGA DE RECURSOS
    this.load.image("suelo_mapa", "assets/game_background.png");
    this.load.audio("shoot_pistola", "/assets/audio/pistol.mp3");
    this.load.audio("shoot_uzi", "/assets/audio/uzi.mp3");
    this.load.audio("shoot_shotgun", "/assets/audio/shotgun.mp3");
    this.load.audio("shoot_raygun", "/assets/audio/laser.mp3");
    this.load.audio("player_hit", "/assets/audio/hit.mp3");
    this.load.audio("round_start", "/assets/audio/roundstart.mp3");
    this.load.audio("enemy_hit", "/assets/audio/grr.mp3");
    this.load.audio("enemy_die", "/assets/audio/enemydie.mp3");
    this.load.audio("heart_sound", "/assets/audio/heart.mp3");
    this.load.audio("buy_sound", "/assets/audio/compra.mp3");
    this.load.audio("game_over", "/assets/audio/gameOver_scream.mp3");
    this.load.audio("game_over_music", "/assets/audio/music_gameOver.mp3");
    this.load.audio("game_music", "/assets/audio/music.mp3");
    this.load.audio("jammed", "/assets/audio/jammed.mp3");
    this.load.audio("speedUp", "/assets/audio/speedUp.mp3");
    this.load.audio("reload", "/assets/audio/reload.mp3");
    this.load.audio("purple_laser", "assets/audio/purple_laser.mp3");

    this.load.spritesheet("player_sprite", "/assets/player/Walk.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_die_strip", "/assets/player/Dead.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_idle_sheet", "/assets/player/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet(
      "player_shoot_sheet",
      "/assets/player/player_shoot.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
    this.load.spritesheet(
      "player_walk_shoot",
      "/assets/player/player_walk_shoot.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
    this.load.spritesheet("enemy_sheet", "assets/enemy/enemy_walk.png", {
      frameWidth: 96,
      frameHeight: 96,
    });

    this.load.spritesheet(
      "enemy_attack_sheet",
      "assets/enemy/enemy_attack.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      },
    );

    this.load.image("purple_1", "/assets/PurpleEnemy/purple_enemy_walk_1.png");
    this.load.image("purple_2", "/assets/PurpleEnemy/purple_enemy_walk_2.png");
    this.load.image("purple_3", "/assets/PurpleEnemy/purple_enemy_walk_3.png");
    this.load.image("purple_4", "/assets/PurpleEnemy/purple_enemy_walk_4.png");
    this.load.image("purple_5", "/assets/PurpleEnemy/purple_enemy_walk_5.png");
    this.load.image("purple_6", "/assets/PurpleEnemy/purple_enemy_walk_6.png");

    this.load.image(
      "purple_shoot_1",
      "assets/PurpleEnemy/purple_enemy_attack_1.png",
    );
    this.load.image(
      "purple_shoot_2",
      "assets/PurpleEnemy/purple_enemy_attack_2.png",
    );
    this.load.image(
      "purple_shoot_3",
      "assets/PurpleEnemy/purple_enemy_attack_3.png",
    );
  }

  create() {
    const worldWidth = 1760;
    const worldHeight = 1320;

    this.background = this.add.image(0, 0, "suelo_mapa");
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(worldWidth, worldHeight);

    // Muros invisibles
    const margenArribaIzq = 175;
    const margenDerecho = 175;
    const margenAbajo = 205;

    const physicsWidth = worldWidth - margenArribaIzq - margenDerecho;
    const physicsHeight = worldHeight - margenArribaIzq - margenAbajo;

    this.physics.world.setBounds(
      margenArribaIzq,
      margenArribaIzq,
      physicsWidth,
      physicsHeight,
    );

    // Reinicio de las animaciones tras game over o salir al menu principal
    this.anims.resumeAll();

    //Creación de animaciones
    if (!this.anims.exists("enemy_walk")) {
      this.anims.create({
        key: "enemy_walk",
        frames: this.anims.generateFrameNumbers("enemy_sheet", {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("enemy_attack")) {
      this.anims.create({
        key: "enemy_attack",
        frames: this.anims.generateFrameNumbers("enemy_attack_sheet", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("purple_enemy_walk")) {
      this.anims.create({
        key: "purple_enemy_walk",
        frames: [
          { key: "purple_1" },
          { key: "purple_2" },
          { key: "purple_3" },
          { key: "purple_4" },
          { key: "purple_5" },
          { key: "purple_6" },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("purple_enemy_shoot")) {
      this.anims.create({
        key: "purple_enemy_shoot",
        frames: [
          { key: "purple_shoot_2" },
          { key: "purple_shoot_3" },
          { key: "purple_shoot_1" },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!this.anims.exists("caminar_soldado")) {
      this.anims.create({
        key: "caminar_soldado",
        frames: this.anims.generateFrameNumbers("player_sprite", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("player_walk_aim")) {
      this.anims.create({
        key: "player_walk_aim",
        frames: this.anims.generateFrameNumbers("player_walk_shoot", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("morir_anim")) {
      this.anims.create({
        key: "morir_anim",
        frames: this.anims.generateFrameNumbers("player_die_strip", {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
    if (!this.anims.exists("player_idle")) {
      this.anims.create({
        key: "player_idle",
        frames: this.anims.generateFrameNumbers("player_idle_sheet", {
          start: 0,
          end: 6,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this.anims.exists("player_shoot_idle")) {
      this.anims.create({
        key: "player_shoot_idle",
        frames: this.anims.generateFrameNumbers("player_shoot_sheet", {
          start: 0,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

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
    this.money = 0;
    this.hasUzi = false;
    this.hasShotgun = false;
    this.weapons = ["PISTOLA"];
    this.currentWeaponIndex = 0;
    this.lastFiredTime = 0;
    this.canShoot = false;
    this.ambientGrowlTimer = 0;
    this.nextGrowlTime = Phaser.Math.Between(3000, 7000);
    this.ammoUzi = 100;
    this.ammoShotgun = 30;
    this.lastJammedTime = 0;
    this.killsToNextDrop = Phaser.Math.Between(20, 100);
    this.raygunAmmo = 8;
    this.ammoCost = 450;
    this.weaponUpgrades = {
      PISTOLA: { range: 0, speed: 0, ammo: 0 },
      UZI: { range: 0, speed: 0, ammo: 0 },
      SHOTGUN: { range: 0, speed: 0, ammo: 0 },
      RAYGUN: { range: 0, speed: 0, ammo: 0 },
    };

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
      .text(780, 570, "", {
        fontSize: "22px",
        fill: "#ffffff",
        fontStyle: "bold",
        align: "right",
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(100);

    this.updateAmmoDisplay();

    //  JUGADOR
    /*this.player = this.add.rectangle(
      worldWidth / 2,
      worldHeight / 2,
      32,
      32,
      0x00ff00,
    );
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);*/
    this.player = this.physics.add.sprite(400, 300, "player_sprite");
    this.player.setSize(33, 72);
    this.player.setOffset(50, 56);
    this.physics.add.existing(this.player);
    this.player.setCollideWorldBounds(true);

    //  CÁMARA
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    if (this.player) {
      // jugador en el centro de las físicas
      this.player.setPosition(
        margenArribaIzq + physicsWidth / 2,
        margenArribaIzq + physicsHeight / 2,
      );

      // Camara centrada en el jugador desde el inicio
      this.cameras.main.centerOn(this.player.x, this.player.y);

      // Seguimiento para el resto de la partida
      this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    }

    //  GRUPOS
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 50 });
    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: 300 });
    this.powerupBoxes = this.physics.add.group();
    this.rayBullets = this.physics.add.group({
      classType: RayBullet,
      maxSize: 7,
      runChildUpdate: true,
    });

    this.purpleEnemies = this.physics.add.group({
      classType: PurpleEnemy,
      maxSize: 100,
    });
    this.enemyProjectiles = this.physics.add.group({
      classType: EnemyProjectile,
      maxSize: 100,
    });

    //  SISTEMA DE COLISIONES
    this.physics.add.collider(this.enemies, this.enemies);

    // Proyectil -> Enemigo
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.die();

        //  DINERO POR HIT
        this.money += 3;

        // DAÑO
        const isDead = enemy.receiveDamage(5);

        if (isDead) {
          //  DINERO POR KILL
          this.money += 6;
          this.score += 10;
          this.enemiesLeftInRound--;

          this.checkPowerupDrop(enemy.x, enemy.y);

          // Cambio de ronda
          if (this.enemiesLeftInRound <= 0 && !this.isRoundTransitioning) {
            this.time.delayedCall(100, () => {
              this.nextRound();
            });
          }
        }

        this.moneyText.setText(`${this.money}$`);
        this.scoreText.setText(`PUNTOS: ${this.score}`);
      }
    });

    // Enemigo -> Jugador
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        if (enemy.active && !this.isGameOver) {
          enemy.estaTocandoAlJugador = true;

          if (!this.isInvulnerable) {
            this.handlePlayerDamage();
          }
        }
      },
      null,
      this,
    );

    // Colisiones del nuevo enemigo lila
    this.physics.add.collider(this.purpleEnemies, this.purpleEnemies);
    this.physics.add.collider(this.enemies, this.purpleEnemies);

    // Colisión: Tus balas -> Enemigo Lila
    this.physics.add.overlap(
      this.bullets,
      this.purpleEnemies,
      (bullet, purpleEnemy) => {
        if (bullet.active && purpleEnemy.active) {
          bullet.die();
          this.money += 2;
          const isDead = purpleEnemy.receiveDamage(5);

          if (isDead) {
            this.money += 10;
            this.score += 25;
            this.enemiesLeftInRound--;

            this.checkPowerupDrop(purpleEnemy.x, purpleEnemy.y);

            if (this.enemiesLeftInRound <= 0 && !this.isRoundTransitioning) {
              this.time.delayedCall(100, () => {
                this.nextRound();
              });
            }
          }
          this.moneyText.setText(`${this.money}$`);
          this.scoreText.setText(`PUNTOS: ${this.score}`);
        }
      },
    );

    // Láser -> Enemigos Normales
    this.physics.add.overlap(this.rayBullets, this.enemies, (bullet, enemy) => {
      if (bullet.active && enemy.active && !bullet.hitEnemies.has(enemy)) {
        bullet.hitEnemies.add(enemy);
        this.money += 4;

        const isDead = enemy.receiveDamage(10);

        if (isDead) {
          this.money += 6;
          this.score += 10;
          this.enemiesLeftInRound--;

          // Suelta el drop exactamente en la X e Y del zombi muerto
          this.checkPowerupDrop(enemy.x, enemy.y);

          if (this.enemiesLeftInRound <= 0 && !this.isRoundTransitioning) {
            this.time.delayedCall(100, () => this.nextRound());
          }
        }
        this.moneyText.setText(`${this.money}$`);
        this.scoreText.setText(`PUNTOS: ${this.score}`);
      }
    });

    // Láser -> Enemigos Lilas
    this.physics.add.overlap(
      this.rayBullets,
      this.purpleEnemies,
      (bullet, pEnemy) => {
        if (bullet.active && pEnemy.active && !bullet.hitEnemies.has(pEnemy)) {
          bullet.hitEnemies.add(pEnemy);
          this.money += 3;

          const isDead = pEnemy.receiveDamage(10);

          if (isDead) {
            this.money += 15;
            this.score += 25;
            this.enemiesLeftInRound--;

            // Drop en la X e Y del lila muerto
            this.checkPowerupDrop(pEnemy.x, pEnemy.y);

            if (this.enemiesLeftInRound <= 0 && !this.isRoundTransitioning) {
              this.time.delayedCall(100, () => this.nextRound());
            }
          }
          this.moneyText.setText(`${this.money}$`);
          this.scoreText.setText(`PUNTOS: ${this.score}`);
        }
      },
    );

    // Colisión: Bola Lila -> Jugador
    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      (player, projectile) => {
        if (projectile.active && !this.isInvulnerable && !this.isGameOver) {
          projectile.die();
          this.handlePlayerDamage();
        }
      },
    );

    // Colisión: Jugador -> Modificador
    this.physics.add.overlap(
      this.player,
      this.powerupBoxes,
      this.collectPowerup,
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

    // Sonido de latidos
    this.heartSound = this.sound.add("heart_sound", {
      loop: true,
      volume: 0.6,
    });
    this.isHeartbeatPlaying = false;

    //Error al disparar al inicio de la partida.
    this.time.delayedCall(500, () => {
      this.canShoot = true;
    });

    // Música de fondo
    this.sound.play("game_music", { loop: true, volume: 0.3 });

    this.nextRound();
  }

  nextRound() {
    if (this.isRoundTransitioning) return;
    this.isRoundTransitioning = true;

    this.currentRound++;
    this.sound.play("round_start", { volume: 0.6 });
    console.log(
      `%c INICIANDO RONDA ${this.currentRound} `,
      "background: #222; color: #bada55; font-size: 1.2em",
    );

    this.roundText.setText("RONDA: " + this.currentRound);

    if (this.currentRound > 1) {
      this.enemiesToSpawn = Math.ceil((this.enemiesToSpawn + 2) * 1.3);
      console.log(`Spawneando ${this.enemiesToSpawn} enemigos...`);
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

    this.time.delayedCall(7000, () => {
      if (this.isGameOver) return;

      let purpleEnemiesToSpawn = 1;

      // Cuántos lilas tocan esta ronda
      if (this.currentRound <= 10) {
        purpleEnemiesToSpawn = this.currentRound;
      } else {
        const extraEnemies = this.currentRound - 9;

        purpleEnemiesToSpawn = this.currentRound + extraEnemies;
      }

      console.log(
        `Spawneando ${this.enemiesToSpawn} comunes y ${purpleEnemiesToSpawn} lilas...`,
      );

      this.enemies.clear(true, true);
      this.purpleEnemies.clear(true, true);
      this.enemyProjectiles.clear(true, true);

      this.enemiesLeftInRound = this.enemiesToSpawn + purpleEnemiesToSpawn;
      this.isRoundTransitioning = false;

      const spawnDelay = Math.max(100, 600);

      const worldBounds = this.physics.world.bounds;
      const centroX = worldBounds.x + worldBounds.width / 2;

      // SPAWN ENEMIGOS NORMALES
      for (let i = 0; i < this.enemiesToSpawn; i++) {
        const spawnX = centroX;
        const spawnY = worldBounds.y + 50;

        this.time.delayedCall(i * spawnDelay, () => {
          if (this.isGameOver || this.isPaused) return;

          let enemy = this.enemies.get();
          if (enemy) {
            enemy.spawn(spawnX, spawnY);
            enemy.body.setCollideWorldBounds(true);
          }
        });
      }

      // SPAWN ENEMIGOS LILAS
      for (let j = 0; j < purpleEnemiesToSpawn; j++) {
        this.time.delayedCall(2000 + j * 3500, () => {
          if (this.isGameOver || this.isPaused) return;

          let pEnemy = this.purpleEnemies.get();
          if (pEnemy) {
            const centroY = worldBounds.y + worldBounds.height / 2;
            const randomY = centroY + Phaser.Math.Between(-100, 100);

            const spawnX_Lila = worldBounds.x + 60;

            pEnemy.spawn(spawnX_Lila, randomY);
            pEnemy.body.setCollideWorldBounds(true);
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
    // Ataque del enemigo al jugador
    if (!this.isPaused && !this.isGameOver && this.player) {
      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;

        if (enemy.estaTocandoAlJugador) {
          enemy.body.setVelocity(0, 0);

          if (this.anims.exists("enemy_attack")) {
            enemy.anims.play("enemy_attack", true);
          }
        } else {
          if (this.anims.exists("enemy_walk")) {
            enemy.anims.play("enemy_walk", true);
          }
        }

        enemy.estaTocandoAlJugador = false;
      });
    }

    if (this.isPaused || this.isShopOpen) {
      const pointer = this.input.activePointer;
      if (pointer.primaryDown) {
        const px = pointer.x;
        const py = pointer.y;

        if (this.isShopOpen) {
          //PISTOLA
          if (
            this.money >= 200 &&
            this.weaponUpgrades.PISTOLA.speed < 3 &&
            this.pistolSpeedBtn &&
            this.pistolSpeedBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 200;
            this.weaponUpgrades.PISTOLA.speed++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.money >= 150 &&
            this.weaponUpgrades.PISTOLA.range < 3 &&
            this.pistolRangeBtn &&
            this.pistolRangeBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 150;
            this.weaponUpgrades.PISTOLA.range++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          }

          // MINI UZI
          else if (
            !this.hasUzi &&
            this.money >= 200 &&
            this.uziBtn &&
            this.uziBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 200;
            this.hasUzi = true;
            this.weapons.push("UZI");
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasUzi &&
            this.money >= 250 &&
            this.weaponUpgrades.UZI.ammo < 3 &&
            this.uziAmmoBtn &&
            this.uziAmmoBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 250;
            this.weaponUpgrades.UZI.ammo++;
            this.ammoUzi = this.getMaxAmmo("UZI");
            this.moneyText.setText(`DINERO: $${this.money}`);
            if (this.updateAmmoDisplay) this.updateAmmoDisplay();
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasUzi &&
            this.money >= 250 &&
            this.weaponUpgrades.UZI.speed < 3 &&
            this.uziSpeedBtn &&
            this.uziSpeedBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 250;
            this.weaponUpgrades.UZI.speed++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasUzi &&
            this.money >= 200 &&
            this.weaponUpgrades.UZI.range < 3 &&
            this.uziRangeBtn &&
            this.uziRangeBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 200;
            this.weaponUpgrades.UZI.range++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          }

          //SHOTGUN
          else if (
            !this.hasShotgun &&
            this.money >= 300 &&
            this.shotgunBtn &&
            this.shotgunBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 300;
            this.hasShotgun = true;
            this.weapons.push("SHOTGUN");
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasShotgun &&
            this.money >= 300 &&
            this.weaponUpgrades.SHOTGUN.ammo < 3 &&
            this.shotgunAmmoBtn &&
            this.shotgunAmmoBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 300;
            this.weaponUpgrades.SHOTGUN.ammo++;
            this.ammoShotgun = this.getMaxAmmo("SHOTGUN");
            this.moneyText.setText(`DINERO: $${this.money}`);
            if (this.updateAmmoDisplay) this.updateAmmoDisplay();
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasShotgun &&
            this.money >= 300 &&
            this.weaponUpgrades.SHOTGUN.speed < 3 &&
            this.shotgunSpeedBtn &&
            this.shotgunSpeedBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 300;
            this.weaponUpgrades.SHOTGUN.speed++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.hasShotgun &&
            this.money >= 250 &&
            this.weaponUpgrades.SHOTGUN.range < 3 &&
            this.shotgunRangeBtn &&
            this.shotgunRangeBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 250;
            this.weaponUpgrades.SHOTGUN.range++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          }

          //RAYGUN
          else if (
            !this.weapons.includes("RAYGUN") &&
            this.money >= 500 &&
            this.raygunBtn &&
            this.raygunBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 500;
            this.raygunAmmo = this.getMaxAmmo("RAYGUN");
            this.weapons.push("RAYGUN");
            this.moneyText.setText(`DINERO: $${this.money}`);
            if (this.updateAmmoDisplay) this.updateAmmoDisplay();
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.weapons.includes("RAYGUN") &&
            this.money >= 350 &&
            this.weaponUpgrades.RAYGUN.ammo < 3 &&
            this.raygunAmmoBtn &&
            this.raygunAmmoBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 350;
            this.weaponUpgrades.RAYGUN.ammo++;
            this.raygunAmmo = this.getMaxAmmo("RAYGUN");
            this.moneyText.setText(`DINERO: $${this.money}`);
            if (this.updateAmmoDisplay) this.updateAmmoDisplay();
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.weapons.includes("RAYGUN") &&
            this.money >= 350 &&
            this.weaponUpgrades.RAYGUN.speed < 3 &&
            this.raygunSpeedBtn &&
            this.raygunSpeedBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 350;
            this.weaponUpgrades.RAYGUN.speed++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.weapons.includes("RAYGUN") &&
            this.money >= 300 &&
            this.weaponUpgrades.RAYGUN.range < 3 &&
            this.raygunRangeBtn &&
            this.raygunRangeBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= 300;
            this.weaponUpgrades.RAYGUN.range++;
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          }

          //BOTONES ADICIONALES
          else if (
            this.money >= this.ammoCost &&
            (this.ammoUzi < this.getMaxAmmo("UZI") ||
              this.ammoShotgun < this.getMaxAmmo("SHOTGUN") ||
              this.raygunAmmo < this.getMaxAmmo("RAYGUN")) &&
            this.ammoBtn &&
            this.ammoBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.sound.play("buy_sound", { volume: 0.3 });
            this.money -= this.ammoCost;
            this.ammoCost = Math.min(this.ammoCost + 150, 1800);
            this.ammoUzi = this.getMaxAmmo("UZI");
            this.ammoShotgun = this.getMaxAmmo("SHOTGUN");
            this.raygunAmmo = this.getMaxAmmo("RAYGUN");
            this.moneyText.setText(`DINERO: $${this.money}`);
            this.updateAmmoDisplay();
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          } else if (
            this.closeShopBtn &&
            this.closeShopBtn.getBounds().contains(px, py)
          ) {
            this.canShoot = false;
            this.toggleShop();
            pointer.primaryDown = false;
            this.time.delayedCall(300, () => {
              this.canShoot = true;
            });
          }
        }

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
            this.sound.stopAll();
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

    let estaMoviendose = false;

    if (this.keys.up.isDown) {
      this.player.body.setVelocityY(-this.playerCurrentSpeed);
      estaMoviendose = true;
    } else if (this.keys.down.isDown) {
      this.player.body.setVelocityY(this.playerCurrentSpeed);
      estaMoviendose = true;
    }

    if (this.keys.left.isDown) {
      this.player.setVelocityX(-200);
      // Gira el sprite a la izquierda
      this.player.setFlipX(true);
      estaMoviendose = true;
    } else if (this.keys.right.isDown) {
      this.player.setVelocityX(200);
      // Gira el sprite a la derecha
      this.player.setFlipX(false);
      estaMoviendose = true;
    } else {
      this.player.setVelocityX(0);
    }

    // CONTROL DE ANIMACIÓN
    const moviendoDerecha = this.player.body.velocity.x > 0;
    const moviendoIzquierda = this.player.body.velocity.x < 0;
    const moviendoArriba = this.player.body.velocity.y < 0;
    const moviendoAbajo = this.player.body.velocity.y > 0;

    estaMoviendose =
      moviendoDerecha || moviendoIzquierda || moviendoArriba || moviendoAbajo;

    const flechaPulsada =
      this.arrowKeys.left.isDown ||
      this.arrowKeys.right.isDown ||
      this.arrowKeys.up.isDown ||
      this.arrowKeys.down.isDown;
    const estaDisparando = this.input.activePointer.isDown || flechaPulsada;
    if (estaMoviendose && estaDisparando) {
      this.player.anims.play("player_walk_aim", true);
    } else if (estaMoviendose) {
      // Detectamos hacia dónde se está moviendo físicamente en el eje X
      const moviendoDerecha = this.player.body.velocity.x > 0;
      const moviendoIzquierda = this.player.body.velocity.x < 0;

      const haceMoonwalk =
        (this.player.flipX && moviendoDerecha) ||
        (!this.player.flipX && moviendoIzquierda);

      if (haceMoonwalk) {
        this.player.anims.playReverse("caminar_soldado", true);
      } else {
        this.player.anims.play("caminar_soldado", true);
      }
    } else if (estaDisparando) {
      this.player.anims.play("player_shoot_idle", true);
    } else {
      this.player.anims.play("player_idle", true);
    }

    const enemySpeed = 150;

    //  IA Enemigos
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

    const purpleEnemySpeedFast = 150;
    const purpleEnemySpeedSlow = 30;

    //IA Enemigos
    this.purpleEnemies.getChildren().forEach((pEnemy) => {
      if (pEnemy.active) {
        pEnemy.separate(this.purpleEnemies);

        if (!pEnemy.isStunned) {
          const distance = Phaser.Math.Distance.Between(
            pEnemy.x,
            pEnemy.y,
            this.player.x,
            this.player.y,
          );

          // Borde de la la activación de disparo enemigo lila
          if (pEnemy.isShooting) {
            if (distance > 270) {
              pEnemy.isShooting = false;
            }
          } else {
            if (distance <= 230) {
              pEnemy.isShooting = true;
            }
          }

          if (pEnemy.isShooting) {
            this.physics.moveToObject(
              pEnemy,
              this.player,
              purpleEnemySpeedSlow,
            );
            pEnemy.body.setVelocity(0, 0);
            pEnemy.shoot(this.player, this.enemyProjectiles, time);
          } else {
            pEnemy.anims.play("purple_enemy_walk", true);
            this.physics.moveToObject(
              pEnemy,
              this.player,
              purpleEnemySpeedFast,
            );
          }

          if (this.player.x < pEnemy.x) {
            pEnemy.setFlipX(true);
          } else {
            pEnemy.setFlipX(false);
          }
        } else {
          pEnemy.body.setVelocity(0, 0);
        }
      }
    });
    this.enemyProjectiles.getChildren().forEach((projectile) => {
      if (projectile.active) {
        projectile.update();
      }
    });

    //  REGENERACIÓN
    if (time - this.lastDamageTime > 4000) {
      if (this.playerHP < 20 && time > this.nextRegenTime) {
        this.playerHP += 2;
        if (this.playerHP > 20) this.playerHP = 20;

        this.hpText.setText("VIDA: " + this.playerHP);
        this.nextRegenTime = time + 1000;

        this.player.setTint(0x00ff00);

        this.time.delayedCall(100, () => {
          if (!this.isGameOver) this.player.clearTint();
        });
      }
    }

    // Cambio de arma -
    if (Phaser.Input.Keyboard.JustDown(this.keyPrev)) {
      this.currentWeaponIndex =
        (this.currentWeaponIndex - 1 + this.weapons.length) %
        this.weapons.length;
      this.updateAmmoDisplay();
    }

    // Cambio de arma +
    if (Phaser.Input.Keyboard.JustDown(this.keyNext)) {
      this.currentWeaponIndex =
        (this.currentWeaponIndex + 1) % this.weapons.length;
      this.updateAmmoDisplay();
    }

    this.lastWheelTime = 0;

    // Cambiar de arma con la rueda del ratón
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (this.isShopOpen) return;

      if (this.time.now < this.lastWheelTime + 150) return;

      this.lastWheelTime = this.time.now;

      if (this.weapons.length > 1) {
        if (deltaY > 0) {
          this.currentWeaponIndex =
            (this.currentWeaponIndex + 1) % this.weapons.length;
        } else if (deltaY < 0) {
          this.currentWeaponIndex =
            (this.currentWeaponIndex - 1 + this.weapons.length) %
            this.weapons.length;
        }

        if (this.updateAmmoDisplay) this.updateAmmoDisplay();
      }
    });
    this.handleShooting(time);
    this.handleBulletRecycle();
    // Lógica de latidos
    const debaSonar =
      this.playerHP > 0 &&
      this.playerHP <= 10 &&
      !this.isPaused &&
      !this.isShopOpen &&
      !this.isGameOver;

    if (debaSonar) {
      if (!this.isHeartbeatPlaying) {
        this.heartSound.play();
        this.isHeartbeatPlaying = true;
      }
      // Volumen cuando la vida esta en amarillo
      let volumenObjetivo = 0.2;

      if (this.playerHP <= 5) {
        // Volumen cuando la vida esta en rojo
        volumenObjetivo = 0.7;
      }

      if (this.heartSound.volume !== volumenObjetivo) {
        this.heartSound.setVolume(volumenObjetivo);
      }
    } else {
      if (this.isHeartbeatPlaying) {
        this.heartSound.stop();
        this.isHeartbeatPlaying = false;
      }
    }

    if (!this.isPaused && !this.isShopOpen && !this.isGameOver) {
      this.ambientGrowlTimer += delta; 

      if (this.ambientGrowlTimer >= this.nextGrowlTime) {
        if (this.enemies && this.enemies.countActive(true) > 0) {
          this.sound.play("enemy_hit", { volume: 0.2 }); 
        }

        this.ambientGrowlTimer = 0;
        this.nextGrowlTime = Phaser.Math.Between(3000, 7000);
      }
    }
    this.drawHealthBar();
  }

  //DISPAROS
  handleShooting(time) {
    if (!this.canShoot) return;
    if (this.isPaused || this.isShopOpen || this.isGameOver) return;

    const weapon = this.weapons[this.currentWeaponIndex];
    const upgrades = this.weaponUpgrades[weapon];

  
    let fireRate = 450;
    if (weapon === "UZI") fireRate = 200;
    if (weapon === "SHOTGUN") fireRate = 600;

    fireRate -= upgrades.speed * (fireRate * 0.17);

    let isShooting = false;
    let shootAngle = 0;

    // DETECCIÓN DE DISPARO Y GIRO 
    if (this.input.activePointer.isDown) {
      isShooting = true;
      shootAngle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );

      //  Girar el sprite según el ratón
      if (this.input.activePointer.worldX < this.player.x) {
        this.player.setFlipX(true);
      } else if (this.input.activePointer.worldX > this.player.x) {
        this.player.setFlipX(false);
      }
    } else {
      let dirX = 0,
        dirY = 0;
      if (this.arrowKeys.left.isDown) dirX = -1;
      else if (this.arrowKeys.right.isDown) dirX = 1;
      if (this.arrowKeys.up.isDown) dirY = -1;
      else if (this.arrowKeys.down.isDown) dirY = 1;

      if (dirX !== 0 || dirY !== 0) {
        isShooting = true;
        shootAngle = Math.atan2(dirY, dirX);

        // Girar el sprite según las teclas de dirección
        if (dirX < 0) {
          this.player.setFlipX(true);
        } else if (dirX > 0) {
          this.player.setFlipX(false);
        }
      }
    }

    // LÓGICA DE MUNICIÓN Y CREACIÓN DE BALAS 
    if (isShooting && time > this.lastFiredTime) {
      if (weapon === "UZI") {
        if (this.ammoUzi <= 0) {
          if (time > this.lastJammedTime) {
            this.sound.play("jammed", { volume: 0.6 });
            this.lastJammedTime = time + 300;
          }
          return;
        }
        this.ammoUzi--;
      } else if (weapon === "SHOTGUN") {
        if (this.ammoShotgun <= 0) {
          if (time > this.lastJammedTime) {
            this.sound.play("jammed", { volume: 0.6 });
            this.lastJammedTime = time + 300;
          }
          return;
        }
        this.ammoShotgun--;
      } else if (weapon === "RAYGUN") {
        if (this.raygunAmmo <= 0) {
          if (time > this.lastJammedTime) {
            this.sound.play("jammed", { volume: 0.6 });
            this.lastJammedTime = time + 300;
          }
          return;
        }
        this.raygunAmmo--;
      }

      if (this.updateAmmoDisplay) this.updateAmmoDisplay();

      if (weapon === "PISTOLA")
        this.sound.play("shoot_pistola", { volume: 0.3 });
      else if (weapon === "UZI") this.sound.play("shoot_uzi", { volume: 0.3 });
      else if (weapon === "SHOTGUN")
        this.sound.play("shoot_shotgun", { volume: 0.3 });
      else if (weapon === "RAYGUN")
        this.sound.play("shoot_raygun", { volume: 0.4 });

      let dynamicRange = 500 + upgrades.range * 120;

      if (weapon === "SHOTGUN") {
        this.fireBullet(shootAngle);
        this.fireBullet(shootAngle + 0.1);
        this.fireBullet(shootAngle - 0.1);
      } else if (weapon === "RAYGUN") {
        let laser = this.rayBullets.get();
        if (laser) {
          let offsetX = 0;
          let offsetY = 0;
          const angleDeg = Math.round(Phaser.Math.RadToDeg(shootAngle));

          if (angleDeg === 0) {
            offsetX = 30;
            offsetY = 8;
          } else if (Math.abs(angleDeg) === 180) {
            offsetX = -30;
            offsetY = 8;
          } else if (angleDeg === -90) {
            offsetX = this.player.flipX ? -8 : 8;
            offsetY = -30;
          } else if (angleDeg === 90) {
            offsetX = this.player.flipX ? -12 : 12;
            offsetY = 30;
          } else {
            offsetX = Math.cos(shootAngle) * 30;
            offsetY = Math.sin(shootAngle) * 30;
          }

          const speed = 700;
          const vx = Math.cos(shootAngle) * speed;
          const vy = Math.sin(shootAngle) * speed;

          laser.fire(
            this.player.x + offsetX,
            this.player.y + offsetY,
            vx,
            vy,
            shootAngle,
            dynamicRange,
          );
        }
      } else {
        this.fireBullet(shootAngle);
      }

      this.lastFiredTime = time + fireRate;
    }
  }

  updateAmmoDisplay() {
    if (!this.weaponText) return;

    const weapon = this.weapons[this.currentWeaponIndex];
    let ammoString = "";

    if (weapon === "PISTOLA") {
      ammoString = "∞";
    } else if (weapon === "UZI") {
      ammoString = `${this.ammoUzi}/${this.getMaxAmmo("UZI")}`;
    } else if (weapon === "SHOTGUN") {
      ammoString = `${this.ammoShotgun}/${this.getMaxAmmo("SHOTGUN")}`;
    } else if (weapon === "RAYGUN") {
      ammoString = `${this.raygunAmmo}/${this.getMaxAmmo("RAYGUN")}`;
    }

    this.weaponText.setText(`${weapon} ${ammoString}`);
  }

  fireBullet(angle) {
    let bullet = this.bullets.get();

    if (bullet) {
      const bulletSpeed = 600;
      let offsetX = 0;
      let offsetY = 0;

      // Pasamos el ángulo a grados para la dirección
      const angleDeg = Math.round(Phaser.Math.RadToDeg(angle));

      // Ajustamos el cañón según la dirección
      if (angleDeg === 0) {
        offsetX = 30;
        offsetY = 8;
      } else if (Math.abs(angleDeg) === 180) {
        offsetX = -30;
        offsetY = 8;
      } else if (angleDeg === -90) {
        offsetX = this.player.flipX ? -8 : 8;
        offsetY = -30;
      } else if (angleDeg === 90) {
        offsetX = this.player.flipX ? -12 : 12;
        offsetY = 30;
      } else {
        offsetX = Math.cos(angle) * 30;
        offsetY = Math.sin(angle) * 30;
      }

      const velocityX = Math.cos(angle) * bulletSpeed;
      const velocityY = Math.sin(angle) * bulletSpeed;

      bullet.fire(
        this.player.x + offsetX,
        this.player.y + offsetY,
        velocityX,
        velocityY,
      );
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

  getMaxAmmo(weapon) {
    const upgrades = this.weaponUpgrades[weapon];
    const lvl = upgrades ? upgrades.ammo : 0;
    // Mejora de la munición por nivel
    if (weapon === "UZI") return 100 + lvl * 30; 
    if (weapon === "SHOTGUN") return 30 + lvl * 5; 
    if (weapon === "RAYGUN") return 7 + lvl * 3; 
    return "∞";
  }

  handlePlayerDamage() {
    this.playerHP -= 5;
    this.hpText.setText("VIDA: " + this.playerHP);
    this.lastDamageTime = this.time.now;
    this.sound.play("player_hit", { volume: 0.6 });

    if (this.playerHP <= 0) {
      this.gameOver();
      return;
    }

    this.isInvulnerable = true;

    this.playerCurrentSpeed = this.playerBaseSpeed * 0.75;

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


  checkPowerupDrop(x, y) {
    this.killsToNextDrop--;

    if (this.killsToNextDrop <= 0) {
      let star = this.add.star(x, y, 5, 10, 20, 0xffd700);
      this.physics.add.existing(star);
      this.powerupBoxes.add(star);

      this.tweens.add({
        targets: star,
        y: star.y - 10,
        yoyo: true,
        repeat: -1,
        duration: 500,
      });

      this.tweens.add({
        targets: star,
        angle: 360,
        repeat: -1,
        duration: 2000,
      });

      this.killsToNextDrop = Phaser.Math.Between(20, 100);
    }
  }

  collectPowerup(player, box) {
    box.destroy(); 

    
    const randomEffect = Phaser.Math.Between(1, 3);

    switch (randomEffect) {
      case 1:
   
        this.ammoUzi = this.getMaxAmmo("UZI");
        this.ammoShotgun = this.getMaxAmmo("SHOTGUN");
        this.raygunAmmo = this.getMaxAmmo("RAYGUN");
        this.updateAmmoDisplay(); 
        this.sound.play("reload", { volume: 0.5 });
        break;

      case 2:
        this.money += 350;
        this.moneyText.setText(`${this.money}$`);
        this.sound.play("buy_sound", { volume: 0.3 });
        break;

      case 3:
       
        if (!this.isSpeedBoosted) {
          this.isSpeedBoosted = true; 
          this.playerCurrentSpeed = this.playerBaseSpeed * 2;
          this.sound.play("speedUp", { volume: 0.3 });

          console.log("¡PowerUp: Velocidad x1.6 activada!");

          this.time.delayedCall(8000, () => {
            this.playerCurrentSpeed = this.playerBaseSpeed; 
            this.isSpeedBoosted = false;
            console.log("Fin del bono de velocidad.");
          });
        }
        break;
    }
    if (this.updateAmmoDisplay) {
      this.updateAmmoDisplay();
    }
  }

  togglePause() {
    if (this.heartSound) {
      this.heartSound.stop();
      this.isHeartbeatPlaying = false;
    }
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.anims.pauseAll();
      this.showPauseMenu();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.anims.resumeAll();

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

    this.pauseBg = this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive();

    this.pauseMenu = this.add.container(0, 0).setDepth(2001).setScrollFactor(0);

    const title = this.add
      .text(x, y - 100, "PAUSA", {
        fontSize: "48px",
        fill: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

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
    if (this.heartSound) {
      this.heartSound.stop();
      this.isHeartbeatPlaying = false;
    }
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
    this.shopBg = this.add
      .rectangle(400, 300, 800, 600, 0x000033, 0.9)
      .setScrollFactor(0)
      .setDepth(3000)
      .setInteractive();

    this.shopMenu = this.add.container(0, 0).setDepth(3001).setScrollFactor(0);

    // Cabecera del Menú
    const title = this.add
      .text(400, 35, "ARMERÍA GENERAL", {
        fontSize: "36px",
        fill: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const shopMoneyText = this.add
      .text(400, 75, `TU DINERO: $${this.money}`, {
        fontSize: "20px",
        fill: "#44ff44",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Columnas de Referencia 
    const h1 = this.add
      .text(130, 120, "ESTADO ARMA", {
        fontSize: "14px",
        fill: "#ffaa00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const h2 = this.add
      .text(330, 120, "MEJ. CARGADOR", {
        fontSize: "14px",
        fill: "#ffaa00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const h3 = this.add
      .text(510, 120, "MEJ. CADENCIA", {
        fontSize: "14px",
        fill: "#ffaa00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const h4 = this.add
      .text(690, 120, "MEJ. ALCANCE", {
        fontSize: "14px",
        fill: "#ffaa00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.shopMenu.add([title, shopMoneyText, h1, h2, h3, h4]);

    const activeStyle = {
      fontSize: "13px",
      fill: "#fff",
      backgroundColor: "#222",
      padding: { x: 3, y: 6 },
    };
    const maxStyle = {
      fontSize: "13px",
      fill: "#666",
      backgroundColor: "#111",
      padding: { x: 3, y: 6 },
    };
    const noMoneyStyle = {
      fontSize: "13px",
      fill: "#f00",
      backgroundColor: "#222",
      padding: { x: 3, y: 6 },
    };
    const lockedStyle = {
      fontSize: "13px",
      fill: "#444",
      backgroundColor: "#000",
      padding: { x: 3, y: 6 },
    };

    // PISTOLA
    const pUp = this.weaponUpgrades.PISTOLA;
    const pSpeedCost = 200;
    const pRangeCost = 150;

    this.pistolBtn = this.add
      .text(130, 170, "PISTOLA (OK)", maxStyle)
      .setOrigin(0.5);
    this.pistolAmmoBtn = this.add
      .text(330, 170, "BALAS INF.", lockedStyle)
      .setOrigin(0.5);

    this.pistolSpeedBtn = this.add
      .text(
        510,
        170,
        pUp.speed >= 3
          ? "CADENCIA MÁX"
          : `+CADENCIA ($${pSpeedCost}) [${pUp.speed}/3]`,
        pUp.speed >= 3
          ? maxStyle
          : this.money >= pSpeedCost
            ? activeStyle
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: pUp.speed < 3 });
    this.pistolRangeBtn = this.add
      .text(
        690,
        170,
        pUp.range >= 3
          ? "ALCANCE MÁX"
          : `+ALCANCE ($${pRangeCost}) [${pUp.range}/3]`,
        pUp.range >= 3
          ? maxStyle
          : this.money >= pRangeCost
            ? activeStyle
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: pUp.range < 3 });

    //  MINI UZI
    const uUp = this.weaponUpgrades.UZI;
    const uWeaponCost = 200;
    const uAmmoCost = 250;
    const uSpeedCost = 250;
    const uRangeCost = 200;

    this.uziBtn = this.add
      .text(
        130,
        240,
        this.hasUzi ? "MINI UZI: OK" : `MINI UZI ($${uWeaponCost})`,
        this.hasUzi
          ? maxStyle
          : this.money >= uWeaponCost
            ? activeStyle
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !this.hasUzi });

    this.uziAmmoBtn = this.add
      .text(
        330,
        240,
        !this.hasUzi
          ? "BLOQUEADO"
          : uUp.ammo >= 3
            ? "BALAS MÁX"
            : `+BALAS ($${uAmmoCost}) [${uUp.ammo}/3]`,
        !this.hasUzi
          ? lockedStyle
          : uUp.ammo >= 3
            ? maxStyle
            : this.money >= uAmmoCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasUzi && uUp.ammo < 3 });
    this.uziSpeedBtn = this.add
      .text(
        510,
        240,
        !this.hasUzi
          ? "BLOQUEADO"
          : uUp.speed >= 3
            ? "CADENCIA MÁX"
            : `+CADENCIA ($${uSpeedCost}) [${uUp.speed}/3]`,
        !this.hasUzi
          ? lockedStyle
          : uUp.speed >= 3
            ? maxStyle
            : this.money >= uSpeedCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasUzi && uUp.speed < 3 });
    this.uziRangeBtn = this.add
      .text(
        690,
        240,
        !this.hasUzi
          ? "BLOQUEADO"
          : uUp.range >= 3
            ? "ALCANCE MÁX"
            : `+ALCANCE ($${uRangeCost}) [${uUp.range}/3]`,
        !this.hasUzi
          ? lockedStyle
          : uUp.range >= 3
            ? maxStyle
            : this.money >= uRangeCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasUzi && uUp.range < 3 });

    // SHOTGUN
    const sUp = this.weaponUpgrades.SHOTGUN;
    const sWeaponCost = 300;
    const sAmmoCost = 300;
    const sSpeedCost = 300;
    const sRangeCost = 250;

    this.shotgunBtn = this.add
      .text(
        130,
        310,
        this.hasShotgun ? "SHOTGUN: OK" : `SHOTGUN ($${sWeaponCost})`,
        this.hasShotgun
          ? maxStyle
          : this.money >= sWeaponCost
            ? activeStyle
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !this.hasShotgun });

    this.shotgunAmmoBtn = this.add
      .text(
        330,
        310,
        !this.hasShotgun
          ? "BLOQUEADO"
          : sUp.ammo >= 3
            ? "BALAS MÁX"
            : `+BALAS ($${sAmmoCost}) [${sUp.ammo}/3]`,
        !this.hasShotgun
          ? lockedStyle
          : sUp.ammo >= 3
            ? maxStyle
            : this.money >= sAmmoCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasShotgun && sUp.ammo < 3 });
    this.shotgunSpeedBtn = this.add
      .text(
        510,
        310,
        !this.hasShotgun
          ? "BLOQUEADO"
          : sUp.speed >= 3
            ? "CADENCIA MÁX"
            : `+CADENCIA ($${sSpeedCost}) [${sUp.speed}/3]`,
        !this.hasShotgun
          ? lockedStyle
          : sUp.speed >= 3
            ? maxStyle
            : this.money >= sSpeedCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasShotgun && sUp.speed < 3 });
    this.shotgunRangeBtn = this.add
      .text(
        690,
        310,
        !this.hasShotgun
          ? "BLOQUEADO"
          : sUp.range >= 3
            ? "ALCANCE MÁX"
            : `+ALCANCE ($${sRangeCost}) [${sUp.range}/3]`,
        !this.hasShotgun
          ? lockedStyle
          : sUp.range >= 3
            ? maxStyle
            : this.money >= sRangeCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: this.hasShotgun && sUp.range < 3 });

    // RAYGUN
    const rUp = this.weaponUpgrades.RAYGUN;
    const hasRaygun = this.weapons.includes("RAYGUN");
    const rWeaponCost = 500;
    const rAmmoCost = 350;
    const rSpeedCost = 350;
    const rRangeCost = 300;

    this.raygunBtn = this.add
      .text(
        130,
        380,
        hasRaygun ? "RAYGUN: OK" : `RAYGUN ($${rWeaponCost})`,
        hasRaygun
          ? maxStyle
          : this.money >= rWeaponCost
            ? activeStyle
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !hasRaygun });

    this.raygunAmmoBtn = this.add
      .text(
        330,
        380,
        !hasRaygun
          ? "BLOQUEADO"
          : rUp.ammo >= 3
            ? "BALAS MÁX"
            : `+BALAS ($${rAmmoCost}) [${rUp.ammo}/3]`,
        !hasRaygun
          ? lockedStyle
          : rUp.ammo >= 3
            ? maxStyle
            : this.money >= rAmmoCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: hasRaygun && rUp.ammo < 3 });
    this.raygunSpeedBtn = this.add
      .text(
        510,
        380,
        !hasRaygun
          ? "BLOQUEADO"
          : rUp.speed >= 3
            ? "CADENCIA MÁX"
            : `+CADENCIA ($${rSpeedCost}) [${rUp.speed}/3]`,
        !hasRaygun
          ? lockedStyle
          : rUp.speed >= 3
            ? maxStyle
            : this.money >= rSpeedCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: hasRaygun && rUp.speed < 3 });
    this.raygunRangeBtn = this.add
      .text(
        690,
        380,
        !hasRaygun
          ? "BLOQUEADO"
          : rUp.range >= 3
            ? "ALCANCE MÁX"
            : `+ALCANCE ($${rRangeCost}) [${rUp.range}/3]`,
        !hasRaygun
          ? lockedStyle
          : rUp.range >= 3
            ? maxStyle
            : this.money >= rRangeCost
              ? activeStyle
              : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: hasRaygun && rUp.range < 3 });

    // Botones de salida e Interfaz inferior 
    const isAmmoFull =
      this.ammoUzi >= this.getMaxAmmo("UZI") &&
      this.ammoShotgun >= this.getMaxAmmo("SHOTGUN") &&
      this.raygunAmmo >= this.getMaxAmmo("RAYGUN");
    this.ammoBtn = this.add
      .text(
        400,
        455,
        isAmmoFull
          ? "MUNICIÓN AL MÁXIMO"
          : `MUNICIÓN MÁXIMA ($${this.ammoCost})`,
        isAmmoFull
          ? maxStyle
          : this.money >= this.ammoCost
            ? {
                fontSize: "16px",
                fill: "#00ff00",
                backgroundColor: "#222",
                padding: 8,
              }
            : noMoneyStyle,
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: !isAmmoFull });

    this.closeShopBtn = this.add
      .text(400, 530, " VOLVER AL COMBATE ", {
        fontSize: "20px",
        fill: "#fff",
        backgroundColor: "#c00",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Registro masivo en el contenedor
    this.shopMenu.add([
      this.pistolBtn,
      this.pistolAmmoBtn,
      this.pistolSpeedBtn,
      this.pistolRangeBtn,
      this.uziBtn,
      this.uziAmmoBtn,
      this.uziSpeedBtn,
      this.uziRangeBtn,
      this.shotgunBtn,
      this.shotgunAmmoBtn,
      this.shotgunSpeedBtn,
      this.shotgunRangeBtn,
      this.raygunBtn,
      this.raygunAmmoBtn,
      this.raygunSpeedBtn,
      this.raygunRangeBtn,
      this.ammoBtn,
      this.closeShopBtn,
    ]);
  }

  gameOver() {
    // PARAR EL JUEGO Y SONIDOS PREVIOS
    this.sound.stopAll();

    if (this.heartSound) {
      this.heartSound.stop();
      this.isHeartbeatPlaying = false;
    }

    this.isGameOver = true;
    this.physics.pause();
    this.isInvulnerable = false;

    this.sound.play("game_over", { volume: 0.2 }); 
    this.cameras.main.shake(300, 0.01);

    this.player.clearTint();
    this.player.setTexture("player_die_strip"); 
    this.player.anims.play("morir_anim"); 


    this.player.once("animationcomplete-morir_anim", () => {
      this.anims.pauseAll();
      this.player.setFrame(4); 

      this.sound.play("game_over_music", { volume: 0.6, loop: true });

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
        this.sound.stopAll();
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
        this.sound.stopAll();
        this.scene.start("MenuScene");
      });

      // Lógica de iluminación de los botones al pasar el ratón
      [restartBtn, menuBtn].forEach((btn) => {
        btn.on("pointerover", () => btn.setStyle({ fill: "#ff0" }));
        btn.on("pointerout", () => {
          const originalColor = btn === restartBtn ? "#0f0" : "#fff";
          btn.setStyle({ fill: originalColor });
        });
      });
    });
  }
}
