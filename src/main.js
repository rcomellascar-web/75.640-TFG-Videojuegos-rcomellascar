import * as Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Puntuación
        this.score = 0;
        this.scoreText = this.add.text(400, 30, 'PUNTOS: 0', { 
            fontSize: '24px', 
            fill: '#ffffff',
            fontStyle: 'bold' 
        }).setOrigin(0.5);

        // Jugador
        this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff00);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true); 

        //  Enemigo 
        this.enemy = this.add.rectangle(100, 100, 32, 32, 0xff0000);
        this.physics.add.existing(this.enemy);

        // Proyectiles
        this.bullets = this.physics.add.group();
        this.lastFired = 0; 

        // Controles 
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            shootUp: Phaser.Input.Keyboard.KeyCodes.UP,
            shootDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
            shootLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
            shootRight: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        // Colisiones
        // Colisión proyectil -> enemigo
        this.physics.add.overlap(this.bullets, this.enemy, (enemy, bullet) => {
            bullet.destroy();
            this.score += 1;
            this.scoreText.setText('PUNTOS: ' + this.score);
        });

        // Colision enemigo->jugador
        this.physics.add.overlap(this.player, this.enemy, this.gameOver, null, this);

        this.isGameOver = false;
    }

    update(time) {
        if (this.isGameOver) return; 

        // Movimiento del jugador
        const speed = 200;
        this.player.body.setVelocity(0); 

        if (this.keys.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.keys.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.keys.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.keys.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        // IA del enemigo
        this.physics.moveToObject(this.enemy, this.player, 135);

        // Lanzamiento de proyectiles
        if (time > this.lastFired) {
            let bulletVelocityX = 0;
            let bulletVelocityY = 0;
            let shouldShoot = false;
            const bulletSpeed = 400;

            if (this.keys.shootLeft.isDown) { 
                bulletVelocityX = -bulletSpeed; 
                shouldShoot = true; 
            } else if (this.keys.shootRight.isDown) { 
                bulletVelocityX = bulletSpeed; 
                shouldShoot = true; 
            }

            if (this.keys.shootUp.isDown) { 
                bulletVelocityY = -bulletSpeed; 
                shouldShoot = true; 
            } else if (this.keys.shootDown.isDown) { 
                bulletVelocityY = bulletSpeed; 
                shouldShoot = true; 
            }

            if (shouldShoot) {
                // Corrección de velocidad diagonal
                if (bulletVelocityX !== 0 && bulletVelocityY !== 0) {
                    bulletVelocityX *= 0.7071; 
                    bulletVelocityY *= 0.7071;
                }

                let bullet = this.add.rectangle(this.player.x, this.player.y, 10, 10, 0xffff00);
                this.bullets.add(bullet);
                bullet.body.setVelocity(bulletVelocityX, bulletVelocityY);
                
                bullet.startX = this.player.x;
                bullet.startY = this.player.y;

                this.lastFired = time + 300; 
            }
        }

        // Distancia máxima del proyectil
        const maxDistance = 250; 
        this.bullets.getChildren().forEach(bullet => {
            const distanceTraveled = Phaser.Math.Distance.Between(bullet.startX, bullet.startY, bullet.x, bullet.y);
            if (distanceTraveled > maxDistance || bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
                bullet.destroy();
            }
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause(); 
        this.player.fillColor = 0x888888; 

        // Game Over
        this.add.text(400, 200, 'GAME OVER', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);

        // Puntuación final
        this.add.text(400, 280, 'Tu puntuación ha sido de: ' + this.score, { 
            fontSize: '28px', 
            fill: '#ffff00' 
        }).setOrigin(0.5);

        // Botón de reinicio
        const restartBtn = this.add.text(400, 380, 'Reiniciar', { 
            fontSize: '32px', 
            fill: 'rgb(0, 0, 0)',
            backgroundColor: '#acaaaa',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.scene.restart(); 
        });
    }w
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#333333',
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },
    scene: MainScene
};

const game = new Phaser.Game(config);wd