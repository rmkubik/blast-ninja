import Phaser from "phaser";
import globals from "../globals";
// import donutSpriteSheet from "../../assets/donuts.png";
// import Donut from "../gameObjects/Donut";
// import Pipes from "../gameObjects/Pipes";
import tilesetSpriteSheet from "../../assets/tileset.png";
import ninjaImage from "../../assets/ninja.png";
import map1 from "../../assets/map1.json";
import map2 from "../../assets/map2.json";
import map3 from "../../assets/map3.json";
import map4 from "../../assets/map4.json";
import map5 from "../../assets/map5.json";

/**
 * MainScene extends Phaser.Scene
 * https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html
 *
 * In depth usage dev logs:
 * Part 1: https://phaser.io/phaser3/devlog/119
 * Part 2: https://phaser.io/phaser3/devlog/121
 */
class MainScene extends Phaser.Scene {
  constructor(...args) {
    super(...args);

    this.currentLevel = 0;
    this.levels = [
      { name: "map1", par: 2 },
      { name: "map2", par: 2 },
      { name: "map3", par: 2 },
      { name: "map4", par: 2 },
      { name: "map5", par: 2 }
    ];
    this.resetting = false;

    window.resetLevel = () => this.scene.restart();
  }

  preload() {
    this.load.spritesheet("tiles", tilesetSpriteSheet, {
      frameWidth: globals.tileWidth,
      frameHeight: globals.tileHeight
    });
    this.load.tilemapTiledJSON("map1", map1);
    this.load.tilemapTiledJSON("map2", map2);
    this.load.tilemapTiledJSON("map3", map3);
    this.load.tilemapTiledJSON("map4", map4);
    this.load.tilemapTiledJSON("map5", map5);
    this.load.image("ninja", ninjaImage);
  }

  create() {
    this.bombCount = 0;
    const currentMap = this.levels[this.currentLevel];

    window.updateUI({
      bombCounter: this.bombCount,
      levelPar: currentMap.par,
      levelName: currentMap.name
    });

    const keyObj = this.input.keyboard.addKey("R"); // Get key object
    keyObj.on("down", event => {
      this.scene.restart();
    });

    const map = this.add.tilemap(currentMap.name);
    const tileset = map.addTilesetImage("tileset", "tiles"); // key: texture key
    const layer = map.createStaticLayer("ground", tileset);
    layer.setCollisionByExclusion(
      [-1, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      true
    );
    // layer.forEachTile(tile => {
    //   this.physics.world.enable(tile);
    //   console.log(tile);
    //   tile.body.setFrictionX(0.7);
    //   tile.body.setImmovable(true);
    // });

    this.particles = this.add.particles("tiles");
    this.emitter = this.particles.createEmitter({
      frame: [20],
      speed: { min: -50, max: 50 },
      angle: { min: 0, max: 360 },
      gravityY: 100,
      quantity: 2,
      x: globals.width / 2,
      y: globals.height,
      // frequency: 600,
      lifespan: 10000,
      scale: { min: 0.2, max: 0.4 },
      on: false
    });

    const MAX_VELOCITY = 200;
    const [ninja] = map.createFromObjects("objects", "spawn", {
      key: "ninja"
    });
    this.physics.world.enable(ninja);
    ninja.body.setBounce(0.6);
    // ninja.body.setCollideWorldBounds(true);
    ninja.body.setGravityY(globals.gravity);
    ninja.body.setMaxVelocity(MAX_VELOCITY);
    this.ninja = ninja;
    // ninja.update = () => {
    //     this.physics.collide(ninja, layer);
    // };
    // ninja.body.setFrictionX(0.7);
    // ninja.body.setDrag(15, 0);

    const goals = this.add.group();
    map
      .createFromObjects("objects", "goal", {
        key: "tiles",
        frame: 0
      })
      .forEach(goal => {
        goal.setVisible(false);
        this.physics.world.enable(goal);
        goal.body.setImmovable(true);
        goal.body.setSize(goal.width, goal.height);
        goals.add(goal);
      });

    this.physics.add.overlap(ninja, goals, (ninja, goal) => {
      if (
        // ninja.body.onFloor() &&
        ninja.body.velocity.x === 0 &&
        ninja.body.velocity.y > -1 &&
        ninja.body.velocity.y < 1
      ) {
        if (!this.resetting) {
          this.resetting = true;
          console.log("goal!");
          setTimeout(
            () => this.emitter.explode(50, ninja.x + 32, ninja.y - 48),
            300
          );
          this.emitter.explode(50, ninja.x, ninja.y - 64);
          setTimeout(
            () => this.emitter.explode(50, ninja.x - 32, ninja.y - 48),
            600
          );

          setTimeout(() => {
            this.currentLevel = (this.currentLevel + 1) % this.levels.length;
            this.scene.restart();
            this.resetting = false;
          }, 1600);
        }
      }
    });

    this.input.on("pointerdown", pointer => {
      const origin = new Phaser.Math.Vector2(
        ninja.x - pointer.x,
        ninja.y - pointer.y
      );
      const SPEED = 3;
      origin.scale(SPEED);

      this.bombCount += 1;
      window.updateUI({
        bombCounter: this.bombCount
      });

      ninja.body.setVelocity(origin.x, origin.y);

      // this.emitter.start();
      // this.firingTimeout = setTimeout(() => {
      //   this.emitter.stop();
      // }, 400);
      this.emitter.explode(50, pointer.x, pointer.y);
    });

    const FRICTION_VALUE = 2;
    this.physics.add.collider(ninja, layer, (ninja, tile) => {
      if (ninja.body.onFloor()) {
        if (ninja.body.velocity.x > 0) {
          const newVelocity = Phaser.Math.Clamp(
            ninja.body.velocity.x - FRICTION_VALUE,
            0,
            MAX_VELOCITY
          );
          ninja.body.setVelocityX(newVelocity);
        } else if (ninja.body.velocity.x < 0) {
          const newVelocity = Phaser.Math.Clamp(
            ninja.body.velocity.x + FRICTION_VALUE,
            0,
            MAX_VELOCITY
          );
          ninja.body.setVelocityX(newVelocity);
        }
      }
    });
  }

  update() {
    if (
      this.ninja.y < -100 ||
      this.ninja.x < -100 ||
      this.ninja.x > globals.width + 100
    ) {
      this.scene.restart();
      console.log("you fall for eternity");
    }
  }
}

export default MainScene;
