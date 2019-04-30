/**
 * Main start screen ...
 */
class initScene extends Phaser.Scene {
    constructor() {
        super('initScene');
    }

    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.image('introbg', 'assets/img/intro.jpg');
        this.load.image('bg_blue', 'assets/img/bg_blue_720.png');
        this.load.image('bg_red', 'assets/img/bg_red_720.png');
        this.load.image('btn_cred', 'assets/img/buttoncredits.png');
        this.load.image('btn_play', 'assets/img/buttonplay.png');
        this.load.image('btn_opti', 'assets/img/buttonoptions.png');
    }

    create() {
        let bg = this.add.image(16 * resolution / (9 * 2), resolution / 2, 'introbg');
        let btn_play = this.add.sprite(16 * resolution / (9 * 2) - 240 - 60, resolution - tileSize, 'btn_play').setInteractive();
        let btn_cred = this.add.sprite(16 * resolution / (9 * 2), resolution - tileSize, 'btn_cred').setInteractive();
        let btn_opti = this.add.sprite(16 * resolution / (9 * 2) + 240 + 60, resolution - tileSize, 'btn_opti').setInteractive();
        var scene = this.scene;
        btn_cred.on('pointerdown', function (pointer) {
            scene.start('creditScene');
        });
        btn_play.on('pointerdown', function (pointer) {
            scene.start('boardScene');
        });
        btn_opti.on('pointerdown', function (pointer) {
            scene.start('configScene');
        });


    }

    update() {
        // var pointer = this.input.activePointer;
        // if (pointer.leftButtonDown()) {
        //     this.scene.start('boardScene');
        // }
    }
}

/**
 * Game Credits
 */
class creditScene extends Phaser.Scene {

    constructor() {
        super('creditScene');
    }

    preload() {
        this.load.image('credits', 'assets/img/credits.png');
    }

    create() {
        let bg = this.add.image(16 * resolution / (9 * 2), resolution / 2, 'credits');
        this.timeout = 0;
    }

    update(time, delta) {
        this.timeout += delta;
        var pointer = this.input.activePointer;
        if (pointer.leftButtonDown() && this.timeout > 500) {
            this.scene.start('initScene');
        }
    }
}

/**
 * Game Credits
 */
class configScene extends Phaser.Scene {

    constructor() {
        super('configScene');
        this.txt_numAsteroids;
        this.txt_hitAsteroids;
        this.txt_shieldPower;
        this.changeState = true;
    }

    preload() {
        this.load.image('credits', 'assets/img/credits.png');
    }

    create() {
        let bg = this.add.image(16 * resolution / (9 * 2), resolution / 2, 'bg_red');
        let title_text = this.add.text(120, 60, 'Whoap Configuration', {
            fontFamily: 'membra',
            fontSize: 64,
            color: '#f205cb'
        });
        this.txt_shieldPower = this.add.text(120, 180, 'Shield Power: ' + whoapConfig.shieldPowerAtStart, {
            fontFamily: 'membra',
            fontSize: 48,
            color: '#04bfad'
        });
        this.txt_hitAsteroids = this.add.text(120, 240, 'Remove asteroids on hit: ' + whoapConfig.removeAsteroidOnHit, {
            fontFamily: 'membra',
            fontSize: 48,
            color: '#04bfad'
        });
        this.txt_numAsteroids = this.add.text(120, 300, 'Initial asteroids: ' + whoapConfig.numberOfAsteroidsAtStart, {
            fontFamily: 'membra',
            fontSize: 48,
            color: '#04bfad'
        });
        this.txt_back = this.add.text(120, 420, 'Save Config & Back', {
            fontFamily: 'membra',
            fontSize: 48,
            color: '#f205cb'
        });

        // txt_hitAsteroids.on('pointerdown', function (pointer) {
        //     whoapConfig.removeAsteroidOnHit = !whoapConfig.removeAsteroidOnHit;
        //     txt_hitAsteroids.text = 'Remove asteroids on hit: ' + whoapConfig.removeAsteroidOnHit;
        // });
        // txt_back.on('pointerdown', function (pointer) {
        //     this.scene.start('initScene');
        // });
        this.timeout = 0;
    }

    update(time, delta) {
        this.timeout += delta;
        var pointer = this.input.activePointer;
        if (pointer.leftButtonDown() && this.timeout > 250) {
            if (this.changeState == true) {
                if (this.txt_hitAsteroids.getBounds().contains(pointer.x, pointer.y)) {
                    whoapConfig.removeAsteroidOnHit = !whoapConfig.removeAsteroidOnHit;
                    this.txt_hitAsteroids.text = 'Remove asteroids on hit: ' + whoapConfig.removeAsteroidOnHit;
                } else if (this.txt_numAsteroids.getBounds().contains(pointer.x, pointer.y)) {
                    whoapConfig.numberOfAsteroidsAtStart = whoapConfig.numberOfAsteroidsAtStart%15+1;
                    this.txt_numAsteroids.text = 'Initial asteroids: ' + whoapConfig.numberOfAsteroidsAtStart;
                } else if (this.txt_shieldPower.getBounds().contains(pointer.x, pointer.y)) {
                    whoapConfig.shieldPowerAtStart = whoapConfig.shieldPowerAtStart%10+1;
                    this.txt_shieldPower.text = 'Shield Power: ' + whoapConfig.shieldPowerAtStart;
                } else if (this.txt_back.getBounds().contains(pointer.x, pointer.y)) {
                    this.scene.start('initScene');
                }
                this.changeState = false;
            }
        }
        if (!pointer.leftButtonDown()) {
            this.changeState = true;
        }

    }
}

