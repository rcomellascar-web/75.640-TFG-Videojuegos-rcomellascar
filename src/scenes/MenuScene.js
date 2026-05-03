import * as Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.add.text(400, 150, 'THE DEAD ROOM', { 
            fontSize: '64px', 
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startBtn = this.add.text(400, 300, 'INICIAR PARTIDA', { 
            fontSize: '32px', 
            fill: '#0f0',
            backgroundColor: '#000',
            padding: 10
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const instrBtn = this.add.text(400, 400, 'INSTRUCCIONES', { 
            fontSize: '32px', 
            fill: '#fff',
            backgroundColor: '#000',
            padding: 10
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        instrBtn.on('pointerdown', () => {
            alert('Instrucciones: \n- Moverse: WASD \n- Disparar: Flechas \n- Cambiar de arma: Punto y coma \n- Sobrevive al cuadrado rojo.');
        });

        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#ff0' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#0f0' }));
        
        instrBtn.on('pointerover', () => instrBtn.setStyle({ fill: '#ff0' }));
        instrBtn.on('pointerout', () => instrBtn.setStyle({ fill: '#fff' }));
    }
}