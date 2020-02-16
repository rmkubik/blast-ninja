import Phaser from "phaser";
import globals from "../globals";

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
  constructor() {
    super({ key: "main" });

    this.currentLevel = 11;
    this.levels = [
      { name: "map1", par: 3 },
      { name: "map2", par: 2 },
      { name: "map3", par: 2 },
      { name: "map4", par: 2 },
      { name: "map5", par: 4 },
      { name: "map6", par: 4 },
      { name: "map7", par: 3 },
      { name: "map8", par: 3 },
      { name: "map9", par: 5 },
      { name: "map10", par: 6 },
      { name: "map11", par: 3 },
      { name: "map12", par: 2 }
    ];
    this.resetting = false;

    window.resetLevel = () => this.scene.restart();
    window.mute = () => {
      const muteButton = document.getElementById("mute-button");

      if (this.sound.mute) {
        muteButton.style.backgroundColor = "#f4f4f4";
        muteButton.style.color = "#1a1c2c";

        this.sound.setMute(false);
      } else {
        muteButton.style.backgroundColor = "#3b5dc9";
        muteButton.style.color = "#f4f4f4";

        this.sound.setMute(true);
      }
    };
    window.credits = () => {
      window.alert(`
        We Three Celtic Kings by Alexander Nakarada | https://www.serpentsoundstudios.com
        Music promoted by https://www.free-stock-music.com
        Attribution 4.0 International (CC BY 4.0)
        https://creativecommons.org/licenses/by/4.0/

        http://soundbible.com/2067-Blop.html
        About: Blop or pop high pitch sound. maybe a bottle opening or suction cup. created by mark diangelo.
        Title: Blop
        Uploaded: 03.27.13
        License: Attribution 3.0
        https://creativecommons.org/licenses/by/3.0/
        Recorded by Mark DiAngelo
      `);
    };
  }

  create() {
    this.bombCount = 0;
    const currentMap = this.levels[this.currentLevel];

    this.impactSfx = this.sound.add("impact0");
    this.explosionSfx = this.sound.add("explosion0");
    if (!this.mainTheme || (this.mainTheme && !this.mainTheme.isPlaying)) {
      this.mainTheme = this.sound.add("mainTheme");
      this.mainTheme.play();
    }

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
    console.log(globals.width, globals.height);
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

        this.explosionSfx.play();
      }
    });

    const FRICTION_VALUE = 2;
    this.physics.add.collider(ninja, layer, (ninja, tile) => {
      if (
        !ninja.body.wasTouching.up &&
        ninja.body.blocked.up &&
        Math.abs(ninja.body.velocity.y) > 2
      ) {
        this.impactSfx.play();
      } else if (
        !ninja.body.wasTouching.down &&
        ninja.body.blocked.down &&
        Math.abs(ninja.body.velocity.y) > 2
      ) {
        this.impactSfx.play();
      } else if (
        !ninja.body.wasTouching.left &&
        ninja.body.blocked.left &&
        Math.abs(ninja.body.velocity.x) > 2
      ) {
        this.impactSfx.play();
      } else if (
        !ninja.body.wasTouching.right &&
        ninja.body.blocked.right &&
        Math.abs(ninja.body.velocity.x) > 2
      ) {
        this.impactSfx.play();
      }

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
      this.ninja.y > globals.height + 100 ||
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
          setTimeout(() => {
            this.explosionSfx.play();
            this.emitter.explode(50, ninja.x + 32, ninja.y - 48);
          }, 300);
          this.explosionSfx.play();
          this.emitter.explode(50, ninja.x, ninja.y - 64);
          setTimeout(() => {
            this.explosionSfx.play();
            this.emitter.explode(50, ninja.x - 32, ninja.y - 48);
          }, 600);

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
