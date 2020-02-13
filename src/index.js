import Phaser from "phaser";
import config from "./config";
import globals from "./globals";
import "./styles/main.css";

window.updateUI = function updateUI({ bombCounter, levelPar, levelName }) {
  const bombCounterEl = document.querySelector("#bomb-counter");
  const levelParEl = document.querySelector("#level-par");
  const levelNameEl = document.querySelector("#level-name");

  if (bombCounter !== undefined) {
    bombCounterEl.innerHTML = bombCounter;
  }

  if (levelPar !== undefined) {
    levelParEl.innerHTML = levelPar;
  }

  if (levelName !== undefined) {
    levelNameEl.innerHTML = levelName;
  }
};

/*
 * Create a new Phaser.Game instance with our config object. Phaser
 * takes these config options to build a game in a targeted DOM element.
 *
 * We need to save a reference to gameEl in order to apply the styling
 * and enable Parcel hot module reloading as well.
 */
const gameEl = document.querySelector(`#${config.parent}`);
const game = new Phaser.Game(config);

/**
 * Apply styles to fit to the screen in mobile
 */
// gameEl.setAttribute(
//   "style",
//   `-ms-transform-origin: center top;
//           -webkit-transform-origin: center top;
//           -moz-transform-origin: center top;
//           -o-transform-origin: center top;
//           transform-origin: center top;
//           -ms-transform: scale(${globals.deviceScale});
//           -webkit-transform: scale3d(${globals.deviceScale}, 1);
//           -moz-transform: scale(${globals.deviceScale});
//           -o-transform: scale(${globals.deviceScale});
//           transform: scale(${globals.deviceScale});
//           display: block;
//           margin: 0 auto;`
// );

const body = document.querySelector("body");

// body.setAttribute("style", `background-color: ${globals.bgColor}`);

/**
 * Enable Parcel hot module reloading
 */
if (module.hot) {
  module.hot.accept(() => {
    while (gameEl.firstChild) {
      gameEl.removeChild(gameEl.firstChild);
    }
    game.boot();
  });
}
