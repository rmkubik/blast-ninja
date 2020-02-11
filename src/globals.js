const globals = {
  tilesWide: 40,
  tilesHigh: 30,
  tileWidth: 8,
  tileHeight: 8,
  bgColor: "#41a6f6",
  gravity: 100
};

export default {
  ...globals,
  width: globals.tilesWide * globals.tileWidth,
  height: globals.tilesHigh * globals.tileHeight
};
