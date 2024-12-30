// @ts-check

import { ActiveField } from "./ActiveField.mjs";
import { Field as _tmp_Field } from "./Field.mjs";
import { Util, DrawUtil } from "./util.mjs";
import { Scaler } from "./Scaler.mjs";
import { SafeObject } from "./SafeObject.mjs";

const Field = /** @type {import("./Field").Field} */ (/** @type {unknown} */ (_tmp_Field));

/**
 * @param {import("./HTMLCanvas.mjs").HTMLCanvas} canvas
 * @param {({ blockSize: number, offsetX: number, offsetY: number })} fieldCanvasData
 * @param {import("./ActiveField.mjs").ActiveField} field
 * @param {import("./Scaler.mjs").Scaler} scaler
 */
function draw(canvas, fieldCanvasData, field, scaler) {
  const { scale } = scaler;
  const { offsetX, offsetY, blockSize } = {
    offsetX: fieldCanvasData.offsetX,
    offsetY: fieldCanvasData.offsetY,
    blockSize: fieldCanvasData.blockSize,
  };

  canvas.clear();

  for (let i = 0; i < Field.BLOCK_ROWS - Field.BLOCK_Y_BIAS; i++) {
    canvas.stroke(offsetX, offsetY + i * blockSize, Field.BLOCK_COLS * blockSize, 0, 1, "#88888822");
  }
  for (let i = 0; i < Field.BLOCK_COLS; i++) {
    canvas.stroke(offsetX + i * blockSize, offsetY, 0, (Field.BLOCK_ROWS - Field.BLOCK_Y_BIAS) * blockSize, 1, "#88888822");
  }

  if (!Util.checkChallengeMode()) {
    field.iterateGhostFieldBlocks(({ x, y, color }) => {
      ({ x, y } = {
        x: x * blockSize + offsetX,
        y: y * blockSize + offsetY
      });

      DrawUtil.drawGhostBlock(canvas, x, y, blockSize, color);
    });
  }

  field.iterateFieldBlocks(({ x, y, color }) => {
    ({ x, y } = {
      x: x * blockSize + offsetX,
      y: y * blockSize + offsetY
    });

    DrawUtil.drawBlock(canvas, x, y, blockSize, color);
  });

  canvas.fillText(
    "HOLD", 4, 30,
    "#FFFFFF", "start", "alphabetic",
    `${22 * scale}px Sans-Serif`
  );

  if (typeof field.holdingMinoKind === "number") {
    if (field.holdingMinoKind === 6) {
      DrawUtil.drawMino(canvas, 21, 50, field.holdingMinoKind, 0, 18, Util.colorTable[field.holdingMinoKind]);
    } else {
      DrawUtil.drawMino(canvas, field.holdingMinoKind === 5 ? 21 : 28, 58, field.holdingMinoKind, 0, 20, Util.colorTable[field.holdingMinoKind]);
    }
  }

  canvas.fillText(
    "SCORE", 3, 150, "#FFFFFF",
    "start", "alphabetic",
    `${18 * scale}px Sans-Serif`
  );
  const scoreLen = `${field.score}`.length;
  const fontSize = scoreLen < 8 ? 17 : scoreLen < 9 ? 15 : scoreLen < 10 ? 13 : 12;
  canvas.fillText(
    `${field.score}`,
    66.5, 160,
    "#FFFFFF", "end", "top",
    `${fontSize * scale}px Sans-Serif`
  );

  canvas.fillText(
    "LEVEL", 3, 205, "#FFFFFF",
    "start", "alphabetic",
    `${18 * scale}px Sans-Serif`
  );
  const levelLen = `${field.level}`.length;
  const levelFontSize = levelLen < 8 ? 17 : levelLen < 9 ? 15 : levelLen < 10 ? 13 : 12;
  canvas.fillText(
    `${field.level}`,
    66.5, 215,
    "#FFFFFF", "end", "top",
    `${levelFontSize * scale}px Sans-Serif`
  );

  canvas.fillText(
    "LINES", 3, 260, "#FFFFFF",
    "start", "alphabetic",
    `${18 * scale}px Sans-Serif`
  );
  const linesLen = `${field.totalLinesCleared}`.length;
  const linesFontSize = linesLen < 8 ? 17 : linesLen < 9 ? 15 : linesLen < 10 ? 13 : 12;
  canvas.fillText(
    `${field.totalLinesCleared}`,
    66.5, 270,
    "#FFFFFF", "end", "top",
    `${linesFontSize * scale}px Sans-Serif`
  );

  canvas.fillText(
    "REMAINS", 3, 315, "#FFFFFF",
    "start", "alphabetic",
    `${14 * scale}px Sans-Serif`
  );
  const targetLen = `${field.linesLeftToClear}`.length;
  const targetFontSize = targetLen < 8 ? 17 : targetLen < 9 ? 15 : targetLen < 10 ? 13 : 12;
  canvas.fillText(
    `${field.linesLeftToClear}`,
    66.5, 325,
    "#FFFFFF", "end", "top",
    `${targetFontSize * scale}px Sans-Serif`
  );

  canvas.fillText(
    "NEXT", 300, 30,
    "#FFFFFF", "start", "alphabetic",
    `${22 * scale}px Sans-Serif`
  );
  const nexts = field.getNexts();
  DrawUtil.drawNexts(
    canvas,
    Util.checkChallengeMode() ? nexts.slice(0, 1) : nexts,
    315, 80,
    50, 16
  );
}

const audioContext = new AudioContext();
/** @type {AudioBuffer} */
let clickAudio;
~async function() {
  clickAudio = await audioContext.decodeAudioData(await (await fetch("./mm.wav")).arrayBuffer());
}();
/** @type {AudioBuffer} */
let dropAudio;
~async function() {
  dropAudio = await audioContext.decodeAudioData(await (await fetch("./hh.wav")).arrayBuffer());
}();
const playClick = () => {
  audioContext.resume();
  const source = audioContext.createBufferSource();
  source.buffer = clickAudio;
  source.connect(audioContext.destination);
  source.start();
};
const playDrop = () => {
  audioContext.resume();
  const source = audioContext.createBufferSource();
  source.buffer = dropAudio;
  source.connect(audioContext.destination);
  source.start();
};

export class Game extends SafeObject {
  #canvas;
  #fieldCanvasData;
  #field = new ActiveField();
  #scaler;

  /**
   * @param {import("./HTMLCanvas.mjs").HTMLCanvas} canvas
   * @param {({ blockSize: number, offsetX: number, offsetY: number })} fieldCanvasData
   * @param {Scaler} scaler
   */
  constructor(canvas, fieldCanvasData, scaler) {
    super();
    this.#canvas = canvas;
    this.#fieldCanvasData = fieldCanvasData;
    this.#scaler = scaler;
    this.#field = new ActiveField();
    Object.seal(this);
  }
  get isGameover() {
    return this.#field.gameover;
  }
  get level() {
    return this.#field.level;
  }
  restart() {
    this.#field = new ActiveField();
  }
  hold() {
    this.#field.holdMino();
  }
  hardDrop() {
    if (this.#field.hardDropMino()) playDrop();
  }
  softDrop() {
    if (this.#field.softDropMino()) playClick();
  }
  moveRight() {
    if (this.#field.moveMinoRight()) playClick();
  }
  moveLeft() {
    if (this.#field.moveMinoLeft()) playClick();
  }
  rotateRight() {
    if (this.#field.rotateMinoRight()) playClick();
  }
  rotateLeft() {
    if (this.#field.rotateMinoLeft()) playClick();
  }
  fallMino() {
    this.#field.fallMino();
  }
  checkMinoLockdown() {
    this.#field.checkMinoLockdown();
  }
  drawField() {
    draw(this.#canvas, this.#fieldCanvasData, this.#field, this.#scaler);
  }
  drawPauseScreen() {
    const { width: canvasWidth, height: canvasHeight } = this.#canvas;
    this.#canvas.clear();
    this.#canvas.fillRect(0, 0, canvasWidth, canvasHeight, "#0055FF11");
    this.#canvas.strokeRect(0, 0, canvasWidth, canvasHeight, "#00FF77");
  }
  drawGameoverScreen() {
    const { width: canvasWidth, height: canvasHeight } = this.#canvas;
    const { scale } = this.#scaler;
    this.#canvas.strokeText("GAME OVER", canvasWidth / 2, canvasHeight / 2, "#000000", "center", "middle", `bold ${2.5 * scale}em Sans-Serif`, 3.2);
    this.#canvas.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2, "#FF0000EE", "center", "middle", `bold ${2.5 * scale}em Sans-Serif`);
    this.#canvas.strokeText("GAME OVER", canvasWidth / 2, canvasHeight / 2, "#000000", "center", "middle", `bold ${2.5 * scale}em Sans-Serif`, 1);
  }
  // getBoundingFieldRect() {
  //   let { x, y } = this.#canvas.getBoundingClientRect();
  //   x += this.#fieldCanvasData.offsetX, y += this.#fieldCanvasData.offsetY;
  //   const width = Field.BLOCK_COLS * this.#fieldCanvasData.blockSize,
  //   height = (Field.BLOCK_ROWS - Field.BLOCK_Y_BIAS) * this.#fieldCanvasData.blockSize
  //   return Object.freeze({
  //     x, y, width, height, left: x, top: y,
  //     right: x + width, bottom: y + height
  //   });
  // }
}
Object.freeze(Game.prototype);
