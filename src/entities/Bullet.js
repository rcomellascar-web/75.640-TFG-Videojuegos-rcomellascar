import * as Phaser from 'phaser';

export default class Bullet extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 10, 10, 0xffff00);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    // Disparar la bala reciclada
    fire(x, y, velocityX, velocityY) {
        this.body.reset(x, y); 
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(velocityX, velocityY);
        
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