import * as Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import MainScene from './scenes/MainScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222',
    scale: { autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [MenuScene, MainScene]
};

const game = new Phaser.Game(config);