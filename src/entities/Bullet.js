import * as Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        // Tamaño de la bala y su color
        super(scene, x, y, 10, 3, 0xFFCC00);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Ajuste de hitbox
        if (this.body) {
            this.body.setSize(10, 3);
        }
    }

    // Disparar la bala reciclada
    fire(x, y, velocityX, velocityY) {
        this.body.reset(x, y); 
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(velocityX, velocityY);
        
        // Rotación de la bala según su dirección
        const angle = Math.atan2(velocityY, velocityX);
        this.setRotation(angle);
        
        this.startX = x;
        this.startY = y;
    }

    // Reciclar la bala 
    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop(); 
    }
}