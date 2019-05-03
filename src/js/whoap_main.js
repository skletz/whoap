// tile size for 9x16 tiles is 80x80 px
var resolution = 720; // 720p
var tileSize = resolution / 9;
var myTxt = null;
var gameOverState = 0; // 1 ... ship destroyed, 2 ... ship came through

// main configuration of the game ...
var whoapConfig = {
    removeAsteroidOnHit: false,
    numberOfAsteroidsAtStart: 10,
    shieldPowerAtStart: 5
};

class boardScene extends Phaser.Scene {
    constructor() {
        super('boardScene');
        this.gridLines;
        this.graphics;
        this.asteroids;
        this.asteroidsRotation;
        this.leftButtonPressed = false;
        this.leftButtonPressedTime;
        this.asteroidAdded = false;
        this.gameBoard;
        this.xplode;
        this.sfx_xplode;
        this.shield = whoapConfig.shieldPowerAtStart;
        this.txt = null;
    }


    /**
     * Pre-loading all assets
     */
    preload() {
        this.load.image('goal', 'assets/img/goal.png');
        this.load.image('ship', 'assets/img/whoap_ship_80.png');
        this.load.image('laser_bg', 'assets/img/laser_game_bg.png');
        this.load.image('asteroid01', 'assets/img/asteroid_80.png');
        this.load.image('bg', 'assets/img/backgroundwolaser.png');
        this.load.spritesheet('explosion', 'assets/img/explosion.png', {
            frameWidth: 64,
            frameHeight: 64,
            endFrame: 23
        });
        this.load.audio('sfx_xpl1', 'assets/sfx/xpl2.mp3');
    }

    /**
     * Creation of the scene including
     *  - sprite creation and positioning
     *  - board init
     *  - background
     *  - setting of asteroids
     */
    create() {
        // init sound --------------
        this.sfx_xplode = this.sound.add('sfx_xpl1');

        // init text font ----
        let add = this.add;
        let input = this.input;
        this.shield = whoapConfig.shieldPowerAtStart;
        let shield = this.shield;
        WebFont.load({
            custom: {
                families: ['membra']
            },
            active: function () {
                myTxt = add.text(tileSize / 2, tileSize / 2, 'Shield: ' + shield, {
                    fontFamily: 'membra',
                    fontSize: 64,
                    color: '#f205cb'
                }).setShadow(2, 2, "#04bfad", 2, false, true);
            }
        });

        // init game board
        this.gameBoard = new Array(16);
        for (let x = 0; x < 16; x++) {
            this.gameBoard[x] = new Array(9);
            for (let y = 0; y < 9; y++) {
                this.gameBoard[x][y] = 'e'; // e -> empty, a -> asteroid,
            }
        }
        // background image
        let bg = this.add.image(16 * resolution / (9 * 2), resolution / 2, 'bg');
        bg.setScale(3, 3);
        bg.angle = 90;
        // laser stripes in the background
        let laser = this.add.image(resolution / 2, 700, 'laser_bg');
        laser.setScale(3, 1);
        // setting the goal fields
        this.add.image(tileSize * 15 + tileSize / 2, tileSize * 3 + tileSize / 2, 'goal');
        this.add.image(tileSize * 15 + tileSize / 2, tileSize * 4 + tileSize / 2, 'goal');
        this.add.image(tileSize * 15 + tileSize / 2, tileSize * 5 + tileSize / 2, 'goal');
        // init ship ...
        this.shipSprite = this.add.sprite(0, 4 * tileSize, 'ship');
        this.shipSprite.setOrigin(0, 0);
        this.shipSprite.setPosition(this.tile2point(0, 4).x, this.tile2point(0, 4).y);

        // init asteroids
        this.asteroids = new Array();
        this.asteroidsRotation = new Array();
        for (let i = 0; i < 3; i++) {
            let a = this.add.sprite(0, 4 * tileSize, 'asteroid01');
            a.setOrigin(0.5, 0.5);
            let tileX = 15, tileY = i;
            let aPos = this.tile2point(tileX, tileY);
            this.gameBoard[tileX][tileY] = 'a';
            a.setPosition(aPos.x + a.width / 2, aPos.y + a.height / 2);
            a.angle = Math.random() * 90;
            this.asteroids.push(a);
            this.asteroidsRotation.push(Math.random() - 0.5);
        }
        for (let i = 6; i < 9; i++) {
            let a = this.add.sprite(0, 4 * tileSize, 'asteroid01');
            a.setOrigin(0.5, 0.5);
            let tileX = 15, tileY = i;
            let aPos = this.tile2point(tileX, tileY);
            this.gameBoard[tileX][tileY] = 'a';
            a.setPosition(aPos.x + a.width / 2, aPos.y + a.height / 2);
            a.angle = Math.random() * 90;
            this.asteroids.push(a);
            this.asteroidsRotation.push(Math.random() - 0.5);
        }
        for (let i = 0; i < whoapConfig.numberOfAsteroidsAtStart; i++) {
            let a = this.add.sprite(0, 4 * tileSize, 'asteroid01');
            a.setOrigin(0.5, 0.5);
            let tileX, tileY;
            do {
                /*
                // Gauss distribution:
                let ran = 0;
                for (let k=0; k<12;k++) ran+=Math.random();
                tileX = Math.floor(ran/12.0*14.0) + 1;
                */
                tileX = Math.floor(Math.random() * 14) + 1;
                tileY = Math.floor(Math.random() * 9) + 1;
            } while (this.gameBoard[tileX][tileY] != 'e');
            let aPos = this.tile2point(tileX, tileY);
            this.gameBoard[tileX][tileY] = 'a';
            a.setPosition(aPos.x + a.width / 2, aPos.y + a.height / 2);
            a.angle = Math.random() * 90;
            this.asteroids.push(a);
            this.asteroidsRotation.push(Math.random() - 0.5);
        }


        // mouse click handler
        // this.input.on('pointerdown', mouseClicker, this);
        this.input.on('pointerdown', function (pointer) {
            this.leftButtonPressed = true;
            this.leftButtonPressedTime = 0;
        }, this);

        // init explosion ----
        let config = {
            key: 'explodeAnimation',
            frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 23, first: 23}),
            frameRate: 30,
            repeat: 0
        };
        this.anims.create(config);

        this.xplode = this.add.sprite(-50, -50, 'explosion');
        // xplode.play('explodeAnimation');

        // set up grid lines
        this.graphics = this.add.graphics({lineStyle: {width: 1, color: 0xf2055c}});
        //graphics = this.add.graphics({lineStyle: {width: 1, color: 0xf20587}});

        this.gridLines = new Array();
        for (let i = 0; i < 16; i++)
            this.gridLines.push(new Phaser.Geom.Line(tileSize * i, 0, tileSize * i, resolution));
        for (let i = 0; i < 9; i++)
            this.gridLines.push(new Phaser.Geom.Line(0, tileSize * i, resolution / 9 * 16, tileSize * i));
    }

    /**
     * Game loop for logic using overasll time and delta time from the last frame.
     * @param time
     * @param delta
     */
    update(time, delta) {
        // txt.text = ("haha");
        var pointer = this.input.activePointer;
        if (pointer.leftButtonDown()) {
            if (this.leftButtonPressed == false) {
                this.leftButtonPressed = true;
                this.leftButtonPressedTime = 0;
            } else {
                this.leftButtonPressedTime += delta;
                // console.log(this.leftButtonPressedTime + " " + !this.asteroidAdded);
                if (this.leftButtonPressedTime > 500 && !this.asteroidAdded) {
                    this.addAsteroid(pointer.x, pointer.y, this);
                    this.asteroidAdded = true;
                }
            }
        } else {
            if (this.leftButtonPressed == true & this.leftButtonPressedTime < 300) {
                this.addShipTween(pointer.x, pointer.y, this)
                // console.log(leftButtonPressedTime);
            }
            this.leftButtonPressed = false;
            this.asteroidAdded = false;
        }
        // shipSprite.setPosition(pointer.x-pointer.x%tileSize, pointer.y-pointer.y%tileSize);

        this.graphics.clear();
        for (const l of this.gridLines) {
            this.graphics.strokeLineShape(l);
        }

        // rotating asteroids:
        //asteroids[0].angle +=10;
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].angle += this.asteroidsRotation[i];
        }

        // todo: check for win / loose conditions
    }

    addAsteroid(x, y, game) {
        let tileX = (x - x % tileSize) / tileSize;
        let tileY = (y - y % tileSize) / tileSize;
        // console.log(tileX + " " +tileY + " " + gameBoard[tileX][tileY]);
        if (this.gameBoard[tileX][tileY] == 'e') {
            // console.log("add asteroid!");
            let aPos = this.tile2point(tileX, tileY);
            let a = game.add.sprite(0, 4 * tileSize, 'asteroid01');
            a.setOrigin(0.5, 0.5);
            this.gameBoard[tileX][tileY] = 'a';
            a.setPosition(aPos.x + a.width / 2, aPos.y + a.height / 2);
            a.angle = Math.random() * 90;
            this.asteroids.push(a);
            this.asteroidsRotation.push(Math.random() - 0.5);
        } else if (this.gameBoard[tileX][tileY] == 'a') {
            // todo: remove asteroid if there is one already ...
            let asteroid_idx = this.findAsteroidIdx(tileX, tileY);
            this.asteroids[asteroid_idx].setPosition(-200, -200);
            this.asteroids.splice(asteroid_idx, 1);
            this.asteroidsRotation.splice(asteroid_idx, 1);
            this.gameBoard[tileX][tileY] = 'e';
        }

    }

    findAsteroidIdx(tileX, tileY) {
        // find and eventually remove asteroid.
        let asteroid_idx = -1;
        for (let k = 0; k < this.asteroids.length; k++) {
            let a = this.asteroids[k];
            if (Math.floor(a.x / tileSize) == tileX && Math.floor(a.y / tileSize) == tileY)
                asteroid_idx = k;
        }
        return asteroid_idx;
    }

    addShipTween(x, y, game) {
        let tileX = Math.floor(x / tileSize);
        let tileY = Math.floor(y / tileSize);

        let shipSprite = this.shipSprite;
        let gameBoard = this.gameBoard;
        let xplode = this.xplode;

        let shipTileX = Math.floor(shipSprite.x / tileSize);
        let shipTileY = Math.floor(shipSprite.y / tileSize);
        let txt = this.txt;

        let canMove = true;
        if (Math.abs(shipTileX - tileX) + Math.abs(shipTileY - tileY) > 1) canMove = false;

        if (canMove && gameBoard[tileX][tileY] == 'e') {
            this.tween = game.tweens.add({
                targets: shipSprite,
                x: x - x % tileSize,
                y: y - y % tileSize,
                ease: 'Cubic',
                duration: 250
            });
            // check if the ship made it to the end ...
            if (tileX == 15 && 3 <= tileY <= 5) {
                gameOverState = 2;
                this.scene.start('gameOverScene');
            }
        } else if (canMove) { // runs into ASTEROID!
            // loose shield
            this.shield--;
            myTxt.text = 'Shield: ' + this.shield;
            this.xplode.setPosition(tileX * tileSize + tileSize / 2, tileY * tileSize + tileSize / 2);
            this.xplode.play('explodeAnimation');
            this.sfx_xplode.play();
            // end game as ship is destroyed!
            if (this.shield <=0 ) {
                gameOverState = 1;
                this.scene.start('gameOverScene');
            }

            // find and eventually remove asteroid.
            let asteroid_idx = this.findAsteroidIdx(tileX, tileY);
            if (whoapConfig.removeAsteroidOnHit == true) { // remove asteroid:
                this.asteroids[asteroid_idx].setPosition(-200, -200);
                this.asteroids.splice(asteroid_idx, 1);
                this.asteroidsRotation.splice(asteroid_idx, 1);
                this.gameBoard[tileX][tileY] = 'e';
            }

            shipSprite.setPosition(tileX * tileSize, tileY * tileSize);
            this.tween = game.tweens.add({
                targets: shipSprite,
                x: shipTileX * tileSize,
                y: shipTileY * tileSize,
                ease: 'Cubic',
                duration: 150
            });
            this.tween = game.tweens.add({
                targets: xplode,
                x: shipTileX * tileSize + tileSize / 2,
                y: shipTileY * tileSize + tileSize / 2,
                ease: 'Cubic',
                duration: 150
            });
        }
    }

    tile2point(x, y) {
        return new Phaser.Geom.Point(x * tileSize, y * tileSize);
    }

    /*
function mouseClicker(pointer) {

    if (pointer.leftButtonDown()) {
        // todo: add tween here ...
        // shipSprite.setPosition(pointer.x - pointer.x % tileSize, pointer.y - pointer.y % tileSize);
        this.tweens.add({
            targets: shipSprite,
            x: pointer.x - pointer.x % tileSize,
            y: pointer.y - pointer.y % tileSize,
            ease: 'Cubic',
            duration: 500
        });
    } else {

    }

}


*/
}
