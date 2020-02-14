import Phaser from "phaser";
import globals from "../globals";
import tilesetSpriteSheet from "../../assets/tileset.png";
import ninjaImage from "../../assets/soldier.png";
import map1 from "../../assets/map1.json";
import map2 from "../../assets/map2.json";
import map3 from "../../assets/map3.json";
import map4 from "../../assets/map4.json";
import map5 from "../../assets/map5.json";
import map6 from "../../assets/map6.json";
import map7 from "../../assets/map7.json";
import map8 from "../../assets/map8.json";
import map9 from "../../assets/map9.json";

const MAX_DISTANCE = 100;

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
      { name: "map5", par: 2 },
      { name: "map6", par: 3 },
      { name: "map7", par: 3 },
      { name: "map8", par: 2 },
      { name: "map9", par: 4 }
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
    this.load.tilemapTiledJSON("map6", map6);
    this.load.tilemapTiledJSON("map7", map7);
    this.load.tilemapTiledJSON("map8", map8);
    this.load.tilemapTiledJSON("map9", map9);
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

    this.particles = this.add.particles("tiles");
    this.emitter = this.particles.createEmitter({
      frame: [20],
      speed: { min: -50, max: 50 },
      angle: { min: 0, max: 360 },
      gravityY: globals.gravity,
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

    this.graphics = this.add.graphics();
    this.rangeFinder = new Phaser.Geom.Circle(ninja.x, ninja.y, MAX_DISTANCE);

    this.goals = this.add.group();
    const goalObjs = map.filterObjects("objects", obj => obj.type === "goal");
    goalObjs.forEach(obj => {
      const goal = this.add.rectangle(obj.x, obj.y, obj.width, obj.height);
      goal.setOrigin(0);
      this.physics.world.enable(goal);
      goal.body.setImmovable(true);
      this.goals.add(goal);
    });

    this.input.on("pointerdown", pointer => {
      const ninjaPos = new Phaser.Math.Vector2(ninja.x, ninja.y);
      const explosionPos = new Phaser.Math.Vector2(pointer.x, pointer.y);

      const distance = ninjaPos.subtract(explosionPos);

      if (distance.length() <= MAX_DISTANCE) {
        const MAX_POWER = 200;
        const percentDistance = 1 - distance.length() / MAX_DISTANCE;
        const magnitude = MAX_POWER * percentDistance;
        const direction = distance.normalize();

        const explosionForce = direction.scale(magnitude);

        this.bombCount += 1;
        window.updateUI({
          bombCounter: this.bombCount
        });

        ninja.body.setVelocity(explosionForce.x, explosionForce.y);

        this.emitter.explode(50, pointer.x, pointer.y);
      }
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

    this.physics.overlap(this.ninja, this.goals, (ninja, goal) => {
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

    this.graphics.clear();

    const thickness = 1;
    const color = 0x29366f;
    const alpha = 0.3;
    this.graphics.lineStyle(thickness, color, alpha);

    this.rangeFinder.setPosition(this.ninja.x, this.ninja.y);
    this.graphics.strokeCircleShape(this.rangeFinder);
  }
}

export default MainScene;
