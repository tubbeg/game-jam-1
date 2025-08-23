import {Scene, Game, AUTO, Physics, Input} from "phaser";

const WINSIZE = [900,675];

function resetWithinBounds(gameObject)
{
    const i = 40;
    if (gameObject.x > WINSIZE[0] + i)
    {
        gameObject.x = -i;
    }
    if (gameObject.x < -i)
    {
        gameObject.x = WINSIZE[0] + i;
    }
    if (gameObject.y > WINSIZE[1] + i)
    {
        gameObject.y = -i;
    }
    if (gameObject.y < -i)
    {
        gameObject.y = WINSIZE[1] + i;
    }
}

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
        this.cells = [];
        this.cellMoveTimer = 100;
        this.currentCellMoveTime = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.image(WINSIZE[0]/2, WINSIZE[1]/2,"background");
        this.anims.createFromAseprite("virus");
        this.anims.createFromAseprite("cell");
        this.sprite = this.physics.add.sprite(WINSIZE[0]/2, WINSIZE[1]/2, "virus");
        this.sprite.body.allowGravity = false;
        this.sprite.play({ key: 'idle', repeat: -1 });
        this.xKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
        this.createCell();
    }

    createCell()
    {
        const cell = this.physics.add.sprite(WINSIZE[0]/3, WINSIZE[1]/2, "cell");
        cell.body.allowGravity = false;
        cell.play({ key: 'swim2', repeat: -1 });  //animation tag has to be unique due to a Phaser bug
        this.cells.push(cell);
    }

    updateCellPosition(cell)
    {
        const [dtX,dtY] = [cell.x - this.sprite.x, cell.y - this.sprite.y];
        if (dtX < 0 && dtY < 0)
        {
            cell.setPosition(cell.x + 1, cell.y + 1);
        }
        else if (dtX > 0 && dtY < 0)
        {
            cell.setPosition(cell.x - 1, cell.y + 1);
        }
        else if (dtX < 0 && dtY > 0)
        {
            cell.setPosition(cell.x + 1, cell.y - 1);
        }          
        else if (dtX > 0 && dtY > 0)
        {
            cell.setPosition(cell.x - 1, cell.y - 1);
        }        
        else if (dtX == 0)
        {
            if (dtY > 0)
            {
                cell.setPosition(cell.x, cell.y - 1);
            }
            else if (dtY < 0)
            {
                cell.setPosition(cell.x, cell.y + 1);
            }
        }
        else if (dtY == 0)
        {
            if (dtX > 0)
            {
                cell.setPosition(cell.x - 1, cell.y);
            }
            else if (dtX < 0)
            {
                cell.setPosition(cell.x + 1, cell.y);
            }
        }
        resetWithinBounds(cell);
    }

    updateAllCellPositions()
    {
        this.cells.forEach((cell) =>
        {
            this.updateCellPosition(cell);
        });
    }

    updateSpritePos(x,y)
    {
        this.sprite.play("swim", true);
        this.sprite.setPosition(x,y);
        resetWithinBounds(this.sprite);
    }

    update (t,dt)
    {
        this.currentCellMoveTime = dt + this.currentCellMoveTime;
        if (this.currentCellMoveTime >  this.cellMoveTimer)
        {
            this.currentCellMoveTime = 0;
            this.updateAllCellPositions();
        }
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