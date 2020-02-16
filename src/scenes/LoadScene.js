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
import map10 from "../../assets/map10.json";
import map11 from "../../assets/map11.json";
import map12 from "../../assets/map12.json";
import map13 from "../../assets/map13.json";
import map14 from "../../assets/map14.json";

import impact0 from "../../assets/sfx/impactWood_medium_000.ogg";
import impact1 from "../../assets/sfx/impactWood_medium_001.ogg";
import impact2 from "../../assets/sfx/impactWood_medium_002.ogg";
import impact3 from "../../assets/sfx/impactWood_medium_003.ogg";
import impact4 from "../../assets/sfx/impactWood_medium_004.ogg";
import explosion0 from "../../assets/sfx/Blop-Mark_DiAngelo-79054334.mp3";
import mainTheme from "../../assets/tracks/alexander-nakarada-we-three-celtic-kings.mp3";
import explosion1 from "../../assets/sfx/impactPlate_heavy_001.ogg";
import explosion2 from "../../assets/sfx/impactPlate_heavy_002.ogg";
import explosion3 from "../../assets/sfx/impactPlate_heavy_003.ogg";
import explosion4 from "../../assets/sfx/impactPlate_heavy_004.ogg";

class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: "load" });

    this.loadingBar = document.getElementById("loading-bar");
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
    this.load.tilemapTiledJSON("map10", map10);
    this.load.tilemapTiledJSON("map11", map11);
    this.load.tilemapTiledJSON("map12", map12);
    this.load.tilemapTiledJSON("map13", map13);
    this.load.tilemapTiledJSON("map14", map14);
    this.load.image("ninja", ninjaImage);
    this.load.audio("impact0", impact0);
    this.load.audio("impact1", impact1);
    this.load.audio("impact2", impact2);
    this.load.audio("impact3", impact3);
    this.load.audio("impact4", impact4);
    this.load.audio("explosion0", explosion0);
    this.load.audio("explosion1", explosion1);
    this.load.audio("explosion2", explosion2);
    this.load.audio("explosion3", explosion3);
    this.load.audio("explosion4", explosion4);
    this.load.audio("mainTheme", mainTheme);
    this.load.start();

    this.load.on("progress", value => {
      this.loadingBar.value = value * 100;
    });
    this.load.on("complete", () => {
      this.loadingBar.value = 100;
      document.getElementById("ui").style.display = "flex";
      document.getElementById("progress").style.display = "none";
      this.scene.start("main");
    });
    this.load.on("fileprogress", function(file) {
      document.getElementById("loaded").innerHTML = file.src;
    });
  }

  create() {}
}

export default LoadScene;
