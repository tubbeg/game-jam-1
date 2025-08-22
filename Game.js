import {Scene, Game, AUTO, Physics, Input} from "phaser";

const SIZE = [900,675];



class Virus extends Scene
{

    preload ()
    {
        this.load.image("background", "virus-background.png")
        this.load.aseprite('virus', 'virus.png', 'virus.json');
    }

    create ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.image(SIZE[0]/2, SIZE[1]/2,"background");
        this.anims.createFromAseprite("virus");
        this.sprite = this.physics.add.sprite(SIZE[0]/2, SIZE[1]/2, "virus");
        this.sprite.play({ key: 'swim', repeat: -1 })
        this.sprite.body.allowGravity = false;
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.SPACE);
    }

    update (t,dt)
    {
        if (this.cursors.left.isDown)
        {
            console.log("hello");
        }
    }
}

const config = {
    type: AUTO,
    width: SIZE[0],
    height: SIZE[1],
    pixelArt : true,
    scene: Virus,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
};

const game = new Game(config);