import {Scene, Game, AUTO, Physics, Input} from "phaser";

const WINSIZE = [900,675];
const SHOOTTIME = 350;
const POWERUPCHANCE = [15,1];
const MAXSPAWNDIFFICULTY = 500;
const MAXHPDIFFICULTY = 5;

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
        this.load.audio("hit", "hit.mp3");
        this.load.audio("powerup", "powerup.mp3");
        this.load.audio("laser", "laser.mp3");
        this.load.audio("death", "death.mp3");
        this.load.audio("explosion", "explosion.mp3");
        const path = "./pixelfont/fonts/";
        this.load.bitmapFont("pixelfont", path + "minogram_6x10.png", path + "minogram_6x10.xml");
    }

    createPlayerVirus()
    {
        this.sprite = this.physics.add.sprite(WINSIZE[0]/2, WINSIZE[1]/2, "virus");
        this.sprite.body.setSize(20, 50);
        this.sprite.body.allowGravity = false;
        this.sprite.play({ key: 'idle', repeat: -1 });
        this.sprite.direction = "up";
        this.sprite.power = null;
    }

    resetTimers()
    {
        this.kills = 0;
        this.cells = [];
        this.bullets = [];
        this.powerups = [];
        this.hpDifficulty = 2;
        this.resetGameTimer = 5000;
        this.currentResetTime = 0;
        this.difficultyTimer = 10000;
        this.currentDifficultyTime = 0;
        this.powerUpTimer = 15000;
        this.currentPowerUpTime = 0;
        this.shootTimer = SHOOTTIME;
        this.currentShootTime = 0;
        this.bulletKillTimer = 700;
        this.spawnCellTimer = 1000;
        this.currentCellSpawnTime = 0;
        this.cellMoveTimer = 100;
        this.currentCellMoveTime = 0;
    }

    create ()
    {
        this.add.image(WINSIZE[0]/2, WINSIZE[1]/2,"background");
        this.anims.createFromAseprite("virus");
        this.anims.createFromAseprite("cell");
        this.gameState = "running";
        this.resetTimers();
        this.wKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
        this.createPlayerVirus();
        this.text1 = this.add.bitmapText(WINSIZE[0] - (WINSIZE[0] * 0.4), 10, 'pixelfont', "Score: 0", 40);
        this.text2 = this.add.bitmapText(WINSIZE[0] - (WINSIZE[0] * 0.8), 10, 'pixelfont', "[SPACE] WASD", 20);
    }

    killPlayer()
    {
        this.sprite.destroy();
        this.sprite = null;
        this.sound.play("death");
        this.gameState = "gameover"
    }

    createCell()
    {
        const [x,y] = getRandomCellPosition();
        const cell = this.physics.add.sprite(x, y, "cell");
        cell.hp = this.hpDifficulty;
        cell.body.allowGravity = false;
        cell.body.setSize(50, 50);
       // this.physics.add.collider()
        this.physics.add.collider(this.sprite, cell, () => {this.killPlayer();});
        cell.play({ key: 'swim2', repeat: -1 });  //animation tag has to be unique due to a Phaser bug
        this.cells.push(cell);
    }

    updateDifficulty(dt)
    {
        if (this.spawnCellTimer > MAXSPAWNDIFFICULTY)
        {
            this.currentDifficultyTime += dt;
            if (this.currentDifficultyTime > this.difficultyTimer)
            {
                console.log("Prepare to die", this.spawnCellTimer);
                this.currentDifficultyTime = 0;
                this.spawnCellTimer -= 100;
                this.hpDifficulty += 1;
            }
        }
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
        if (this.sprite.power == null)
        {
            this.sprite.play("swim", true);
        }
        this.sprite.setPosition(x,y);
        resetWithinBounds(this.sprite);
    }

    destroyAllGameObjects()
    {
        this.cells.forEach((cell) =>
        {
            cell.destroy();
        });
        this.cells = [];
        this.bullets.forEach((b) =>
        {
            b.destroy();
        });
        this.bullets = [];

        this.powerups.forEach((p) =>
        {
            p.destroy();
        });
        this.powerups = [];
        
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
        this.sound.play("hit");
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
        this.sound.play("laser");
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
        this.sound.play("powerup");
        console.log("timer", this.spawnCellTimer);
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
            this.sound.play("explosion");
            //should add a tint here for cool effect
            console.log("Wiping everything out");
            this.sprite.power = selectedPower;
            this.kills += this.cells.length;
            this.cells.forEach((cell) => {cell.destroy();});
            this.cells = [];
        }
        if (selectedPower == "balloon")
        {
            console.log("fun :)");
            this.sprite.power = selectedPower;
            this.sprite.play("float", true).once("animationcomplete", () => 
            {
                this.sprite.play("balloon");
            });
            this.sprite.body.enable = false;
        }
    }

    dropPowerUp(x,y)
    {
        const chance = POWERUPCHANCE[0]; // 1 in 15 to drop a powerup
        const rng = (Math.floor(Math.random() * chance));
        const addPowerUp = rng == POWERUPCHANCE[1];
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
        let delta = this.cells.length;
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
        delta = delta - newArray.length;
        this.kills += delta;
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
                this.sprite.body.enable = true;
            }
        }
    }

    updateGameObjects(dt)
    {
        this.text1.text = "Score: " + this.kills.toString();
        this.updatePowerTimer(dt);
        this.killBullets(dt);
        this.updateCells(dt);
        this.killCells();
        this.updateDifficulty(dt);
        if (this.aKey.isDown)
        {
            this.updateSpritePos(this.sprite.x - 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (15/10));
            this.sprite.direction = "left";
        }
        else if (this.dKey.isDown)
        {
            this.updateSpritePos(this.sprite.x + 1, this.sprite.y);
            this.sprite.setRotation(Math.PI * (5/10));
            this.sprite.direction = "right";
        }
        if (this.wKey.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y - 1);
            this.sprite.setRotation(Math.PI * (20/10));
            this.sprite.direction = "up";
        }       
        else if (this.sKey.isDown)
        {
            this.updateSpritePos(this.sprite.x, this.sprite.y + 1);
            this.sprite.setRotation(Math.PI * (10/10));
            this.sprite.direction = "down";
        }

        if (this.spaceKey.isDown)
        {
            this.shootBullet(dt);
        }
    }



    autoResetGame(dt)
    {
        if (this.deathText == null)
        {
            this.deathText = this.add.bitmapText(WINSIZE[0]/3, WINSIZE[1]/2, 'pixelfont', "DEATH", 100);
        }
        this.currentResetTime += dt;
        if (this.currentResetTime > this.resetGameTimer)
        {
            this.currentResetTime = 0;
            this.gameState = "running";
            this.createPlayerVirus();
            this.deathText.destroy();
            this.deathText = null;
            this.resetTimers();
        }
        
    }

    update (t,dt)
    {
        if (this.gameState == "gameover")
        {
            this.destroyAllGameObjects();
            this.autoResetGame(dt);
        }
        else if (this.gameState == "running")
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