import {Scene, Game, AUTO, Physics, Input} from "phaser";

const WINSIZE = [900,675];

class Virus extends Scene
{
    preload ()
    {
        this.load.image("background", "virus-background.png")
        this.load.aseprite('virus', 'virus.png', 'virus.json');
        this.load.aseprite('cell', 'cell.png', 'cell.json');
    }

    create ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.image(WINSIZE[0]/2, WINSIZE[1]/2,"background");
        this.anims.createFromAseprite("virus");
        this.anims.createFromAseprite("cell");
        this.sprite = this.physics.add.sprite(WINSIZE[0]/2, WINSIZE[1]/2, "virus");
        this.cell = this.physics.add.sprite(WINSIZE[0]/3, WINSIZE[1]/2, "cell");
        this.sprite.body.allowGravity = false;
        this.sprite.isSwimming = false;
        this.cell.body.allowGravity = false;
        //below is a bug in Phaser. Each animation tag has to be unique otherwise Phaser will mix them up
        this.cell.play({ key: 'swim2', repeat: -1 }); 
        this.sprite.play({ key: 'idle', repeat: -1 });
        this.xKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
    }

    updateSpritePos(x,y)
    {
        this.sprite.play("swim", true);
        const i = 40;
        this.sprite.setPosition(x,y);
        if (this.sprite.x > WINSIZE[0] + i)
        {
            this.sprite.x = -i;
        }
        if (this.sprite.x < -i)
        {
            this.sprite.x = WINSIZE[0] + i;
        }
        if (this.sprite.y > WINSIZE[1] + i)
        {
            this.sprite.y = -i;
        }
        if (this.sprite.y < -i)
        {
            this.sprite.y = WINSIZE[1] + i;
        }
    }

    update (t,dt)
    {
        if (this.cursors.left.isDown)
        {
            this.updateSpritePos(this.sprite.x - 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (15/10));
        }
        else if (this.cursors.right.isDown)
        {
            this.updateSpritePos(this.sprite.x + 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (5/10));
        }
        if (this.cursors.up.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y - 1);
            this.sprite.setRotation(Math.PI * (20/10));
        }       
        else if (this.cursors.down.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y + 1);
            this.sprite.setRotation(Math.PI * (10/10));
        }

        if (this.xKey.isDown)
        {
            console.log("hello there");
        }
    }
}

const config = {
    type: AUTO,
    width: WINSIZE[0],
    height: WINSIZE[1],
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