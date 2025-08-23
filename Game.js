import {Scene, Game, AUTO, Physics, Input} from "phaser";

const WINSIZE = [900,675];
const SHOOTTIME = 350;

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

function getRandomCellPosition()
{
    const positions =
        [
            [-40,-40],
            [-40,WINSIZE[1] + 40],
            [WINSIZE[0]/2,-40],
            [-40,WINSIZE[1]/2],
            [WINSIZE[0]/3, -40],
            [WINSIZE[0] + 10, WINSIZE[1] + 10],
            [WINSIZE[0] + 10, WINSIZE[1]/3]
        ];
    return positions[Math.floor(Math.random() * positions.length)];
}

class Virus extends Scene
{
    preload ()
    {
        this.load.image("bullet", "bullet.png");
        this.load.image("powerup", "powerup.png");
        this.load.image("background", "virus-background.png");
        this.load.aseprite('virus', 'virus.png', 'virus.json');
        this.load.aseprite('cell', 'cell.png', 'cell.json');
    }

    create ()
    {
        this.gameState = "running";
        this.cells = [];
        this.bullets = [];
        this.powerups = [];
        this.powerUpTimer = 15000;
        this.currentPowerUpTime = 0;
        this.shootTimer = SHOOTTIME;
        this.currentShootTime = 0;
        this.bulletKillTimer = 700;
        this.spawnCellTimer = 1000;
        this.currentCellSpawnTime = 0;
        this.cellMoveTimer = 100;
        this.currentCellMoveTime = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.image(WINSIZE[0]/2, WINSIZE[1]/2,"background");
        this.anims.createFromAseprite("virus");
        this.anims.createFromAseprite("cell");
        this.sprite = this.physics.add.sprite(WINSIZE[0]/2, WINSIZE[1]/2, "virus");
        this.sprite.body.setSize(20, 50);
        this.sprite.body.allowGravity = false;
        this.sprite.play({ key: 'idle', repeat: -1 });
        this.sprite.direction = "up";
        this.sprite.power = null;
        this.xKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
        this.createCell();
    }

    createCell()
    {
        const [x,y] = getRandomCellPosition();
        const cell = this.physics.add.sprite(x, y, "cell");
        cell.hp = 2;
        cell.body.allowGravity = false;
        cell.body.setSize(50, 50);
       // this.physics.add.collider()
        this.physics.add.collider(this.sprite, cell, () => {this.gameState = "gameover"});
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

    destroyAllGameObjects()
    {
        if (this.cells != null && this.sprite != null)
        {
            this.cells.forEach((cell) =>
            {
                cell.destroy();
            });
            this.bullets.forEach((b) =>
            {
                b.destroy();
            });
            this.sprite.destroy();
            this.sprite = null;
            this.cells = null;
            this.bullets = null;
        }
    }


    updateCells(dt)
    {        
        this.currentCellSpawnTime = dt + this.currentCellSpawnTime;
        if (this.currentCellSpawnTime > this.spawnCellTimer)
        {
            this.currentCellSpawnTime = 0;
            this.createCell();
        }
        this.currentCellMoveTime = dt + this.currentCellMoveTime;
        if (this.currentCellMoveTime >  this.cellMoveTimer)
        {
            this.currentCellMoveTime = 0;
            this.updateAllCellPositions();
        }
    }

    hitCell(cell,bullet)
    {
        //console.log("Cell hp", cell.hp);
        cell.hp -= 1;
        cell.setTint("0xe1e0e6");
        bullet.destroy();
        bullet = null;
    }

    shootBullet(dt)
    {
        this.currentShootTime = dt + this.currentShootTime;
        if (this.currentShootTime < this.shootTimer)
        {
            return;
        }
        this.currentShootTime = 0;
        const [x,y] = [this.sprite.x, this.sprite.y];
        const bullet = this.physics.add.image(x,y, "bullet");
        bullet.body.setAllowGravity(false);
        this.cells.forEach((cell) =>
        {
            this.physics.add.overlap(cell, bullet, () => {this.hitCell(cell,bullet);});
        });
        if (this.sprite.direction == "up")
        {
            bullet.body.setAccelerationY(-1500);
        }
        if (this.sprite.direction == "down")
        {
            bullet.body.setAccelerationY(1500);
        }
        if (this.sprite.direction == "left")
        {
            bullet.body.setAccelerationX(-1500);
        }
        if (this.sprite.direction == "right")
        {
            bullet.body.setAccelerationX(1500);
        }
        bullet.lifeTimer = 0;
        this.bullets.push(bullet);
    }

    doPower(powerup)
    {
        powerup.destroy();
        const powers = ["attack-speed","balloon","clear-all"];
        const selectedPower = powers[Math.floor(Math.random() * powers.length)];
        if (selectedPower == "attack-speed")
        {
            console.log("attack speed power-up activated");
            this.sprite.power = selectedPower;
            this.shootTimer = SHOOTTIME/10;
        }
        if (selectedPower == "clear-all")
        {
            //should add a tint here for cool effect
            console.log("Wiping everything out");
            this.cells.forEach((cell) => {cell.destroy();});
            this.cells = [];
        }
    }

    dropPowerUp(x,y)
    {
        const chance = 2; // 1 in 15 to drop a powerup
        const rng = (Math.floor(Math.random() * chance));
        const addPowerUp = rng == 1;
        if (addPowerUp)
        {
            const powerUp = this.physics.add.image(x,y, "powerup");
            powerUp.body.setAllowGravity(false);
            this.physics.add.overlap(powerUp, this.sprite, () => {this.doPower(powerUp);});
            this.powerups.push(powerUp);
        }
    }

    killCells()
    {
        this.cells.forEach((cell) => 
        {
            if (cell.hp < 1)
            {
                const [x,y] = [cell.x, cell.y];
                this.dropPowerUp(x,y);
                cell.destroy();
            }
        });
        const newArray = this.cells.filter((cell) => {return cell.hp > 0;})
        this.cells = newArray;
    }

    killBullets(dt)
    {
        this.bullets.forEach((bullet) => 
        {
            bullet.lifeTimer = dt + bullet.lifeTimer;
            if (bullet.lifeTimer > this.bulletKillTimer)
            {
                bullet.destroy();
            }
        });
        const newArray = this.bullets.filter((bullet) => {return bullet.lifeTimer < this.bulletKillTimer});
        this.bullets = newArray;
    }



    updatePowerTimer(dt)
    {
        if (this.sprite.power != null)
        {
            this.currentPowerUpTime += dt;
            if (this.currentPowerUpTime > this.powerUpTimer)
            {
                this.sprite.power = null;
                this.shootTimer = SHOOTTIME;
                this.currentPowerUpTime = 0;
            }
        }
    }

    updateGameObjects(dt)
    {
        this.updatePowerTimer(dt);
        this.killBullets(dt);
        this.updateCells(dt);
        this.killCells();
        if (this.cursors.left.isDown)
        {
            this.updateSpritePos(this.sprite.x - 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (15/10));
            this.sprite.direction = "left";
        }
        else if (this.cursors.right.isDown)
        {
            this.updateSpritePos(this.sprite.x + 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (5/10));
            this.sprite.direction = "right";
        }
        if (this.cursors.up.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y - 1);
            this.sprite.setRotation(Math.PI * (20/10));
            this.sprite.direction = "up";
        }       
        else if (this.cursors.down.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y + 1);
            this.sprite.setRotation(Math.PI * (10/10));
            this.sprite.direction = "down";
        }

        if (this.xKey.isDown)
        {
            this.shootBullet(dt);
        }
    }

    update (t,dt)
    {
        if (this.gameState == "gameover")
        {
            this.destroyAllGameObjects();
        }
        else
        {
            this.updateGameObjects(dt);
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