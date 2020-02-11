import Phaser from "phaser";
import MainScene from "./scenes/MainScene";
import globals from "./globals";

/**
 * The possible config options are documented here:
 * https://photonstorm.github.io/phaser3-docs/Phaser.Boot.Config.html
 */
const config = {
  /**
   * Whether to use WebGL or Canvas to render our game.
   * Phaser.AUTO will choose depending on what the browser we're
   * running in supports. It prefers WebGL
   */
  type: Phaser.AUTO,
  width: globals.width,
  height: globals.height,
  /**
   * id of DOM Element to inject Phaser into
   */
  parent: "game",
  /**
   * The name of the physics system we'll be using by default
   */
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  /**
   * An array of all the scenes that will be used in our game
   */
  scene: [MainScene],
  /**
   * Fixes all rendered assets to a pixel perfect grid
   */
  pixelArt: true,
  backgroundColor: globals.bgColor,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export default config;
