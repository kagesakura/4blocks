// @ts-check

import { LockdownManager } from "./LockdownManager.mjs";
import { SafeObject } from "./SafeObject.mjs";
import { MinoNexts } from "./MinoNexts.mjs";
import { Field } from "./Field.mjs";
import { Util } from "./util.mjs";

export class ActiveField extends SafeObject {
  /** @readonly */
  #fieldData = new Field();

  /** @readonly */
  #lockdown = new LockdownManager();

  /** @type {undefined | 0 | 1 | 2 | 3 | 4 | 5 | 6} */
  #currentMinoKind = undefined;
  /** @type {number} */
  #currentMinoX = 5;
  /** @type {number} */
  #currentMinoY = -1;
  /** @type {number} */
  #currentMinoRot = 0;
  /** @type {number} */
  #currentMinoLowestY = Infinity;

  /** @type {boolean} */
  #holdingAvailable = true;
  /** @type {undefined | 0 | 1 | 2 | 3 | 4 | 5 | 6} */
  #holdingMinoKind;

  #isGameover = false;

  /** @readonly */
  #nexts = new MinoNexts();

  #score = 0;

  #level = 1;

  #totalLinesCleared = 0;

  #linesLeftToClear = 5;

  constructor() {
    super();
    this.#currentMinoKind = this.#nexts.shiftMino();
  }

  #getGhostMinoY() {
    if (typeof this.#currentMinoKind !== "number") {
      throw new TypeError("Connot get the ghost mino's information because there isn't a falling mino");
    }

    let ghostY = this.#currentMinoY;

    do {
      ghostY += 1;
    } while(Util.isPlacable(
      this.#currentMinoX,
      ghostY,
      this.#currentMinoKind,
      this.#currentMinoRot,
      this.#fieldData
    ));

    ghostY -= 1;
    return ghostY;
  }

  #isTouchedDown() {
    return (typeof this.#currentMinoKind === "number") && !Util.isPlacable(
      this.#currentMinoX,
      this.#currentMinoY + 1,
      this.#currentMinoKind,
      this.#currentMinoRot,
      this.#fieldData
    );
  }

  #putMinoOnFieldAndShiftNexts() {
    if (typeof this.#currentMinoKind !== "number") return;
    const rot = /** @type {0 | 1 | 2 | 3} */ (this.#currentMinoRot % 4);
    const minoBlocks = Util.shapeTable[this.#currentMinoKind][rot];
    const minoColor = Util.colorTable[this.#currentMinoKind];
    for (const { 0: x, 1: y } of minoBlocks) {
      this.#fieldData.putTile(x + this.#currentMinoX, y + this.#currentMinoY, minoColor);
    }
    this.#lockdown.resetEveryCount();
    this.#currentMinoKind = undefined;
    this.#currentMinoX = 5;
    this.#currentMinoY = -1;
    this.#currentMinoRot = 0;
    this.#currentMinoLowestY = Infinity;
    this.#holdingAvailable = true;

    let line = 0, cutCount = 0;
    while ((line = this.#fieldData.findLineFilled()) !== -1) {
      this.#fieldData.cutLine(line);
      cutCount++;
    }
    this.#totalLinesCleared += cutCount;
    this.#linesLeftToClear -= cutCount;
    switch (cutCount) {
      case 0: /* do nothing */ break;
      case 1: this.#score += this.#level * 100; break;
      case 2: this.#score += this.#level * 300; break;
      case 3: this.#score += this.#level * 500; break;
      case 4: this.#score += this.#level * 800; break;
      default: throw new Error("something wrong");
    }

    const nextMino = this.#nexts.shiftMino();
    if (Util.isPlacable(
      this.#currentMinoX,
      this.#currentMinoY,
      nextMino,
      this.#currentMinoRot,
      this.#fieldData
    )) {
      if (this.#linesLeftToClear <= 0) {
        this.#level++;
        this.#linesLeftToClear = this.#level * 5; 
        this.#fieldData.clear();
      }
      setTimeout(() => {
        this.#currentMinoKind = nextMino;
      }, 500);
    } else{
      this.#isGameover = true;
    }
  }

  get holdingMinoKind() {
    return this.#holdingMinoKind;
  }
  get score() {
    return this.#score;
  }
  get gameover() {
    return this.#isGameover;
  }
  get level() {
    return this.#level;
  }
  get totalLinesCleared() {
    return this.#totalLinesCleared;
  }
  get linesLeftToClear() {
    return this.#linesLeftToClear;
  }

  getNexts() {
    return this.#nexts.getNexts();
  }

  /**
   * @param {(info : { x: number, y: number, color: string }) => void} callback
   */
  iterateFieldBlocks(callback)  {
    this.#fieldData.forEach(callback);
    if (typeof this.#currentMinoKind === "number") {
      const rot = /** @type {0 | 1 | 2 | 3} */ (this.#currentMinoRot % 4);
      const minoBlocks = Util.shapeTable[this.#currentMinoKind][rot];
      const minoColor = Util.colorTable[this.#currentMinoKind];
      for (const { 0: x, 1: y } of minoBlocks) {
        callback({ x: x + this.#currentMinoX, y: y + this.#currentMinoY, color: minoColor });
      }
    }
  }

  /**
   * @param {(info : { x: number, y: number, color: string }) => void} callback
   */
  iterateGhostFieldBlocks(callback)  {
    if (typeof this.#currentMinoKind === "number") {
      const rot = /** @type {0 | 1 | 2 | 3} */ (this.#currentMinoRot % 4);
      const minoBlocks = Util.shapeTable[this.#currentMinoKind][rot];
      const minoColor = Util.colorTable[this.#currentMinoKind];
      const baseY = this.#getGhostMinoY();
      for (const { 0: x, 1: y } of minoBlocks) {
        callback({ x: x + this.#currentMinoX, y: y + baseY, color: minoColor });
      }
    }
  }

  checkMinoLockdown() {
    if (typeof this.#currentMinoKind !== "number") return;
    if (this.#lockdown.hasLocked() && this.#isTouchedDown()) {
      this.#putMinoOnFieldAndShiftNexts();
    }
  }

  holdMino() {
    if (typeof this.#currentMinoKind !== "number") return;
    if (!this.#holdingAvailable) return;
    ({ 0: this.#holdingMinoKind, 1: this.#currentMinoKind } = [this.#currentMinoKind, (typeof this.#holdingMinoKind === "number") ? this.#holdingMinoKind : this.#nexts.shiftMino()]);
    this.#currentMinoRot = 0;
    this.#currentMinoX = 5;
    this.#currentMinoY = -1;
    this.#holdingAvailable = false;
  }
  fallMino() {
    if (typeof this.#currentMinoKind !== "number") return;
    let dummyY = this.#currentMinoY;
    dummyY += 1;
    if (!this.#isTouchedDown()) {
      this.#currentMinoY += 1;
      this.#lockdown.extendLockdownTimer();
      if (this.#currentMinoY < this.#currentMinoLowestY) {
        this.#currentMinoLowestY = this.#currentMinoY;
        this.#lockdown.resetMinoMovementRemaining();
      }
      if (this.#isTouchedDown()) {
        this.#lockdown.startLockdownTimer();
      }
      return true;
    }
    return false;
  }
  hardDropMino() {
    if (typeof this.#currentMinoKind !== "number") return;
    const y = this.#getGhostMinoY();
    const distance = y - this.#currentMinoY;
    this.#currentMinoY = y;
    this.#score += distance * 2;
    this.#putMinoOnFieldAndShiftNexts();
  }
  softDropMino() {
    if (typeof this.#currentMinoKind !== "number") return;
    this.fallMino() && (this.#score++);
  }

  /** @param {number} x */
  #moveMinoLR(x) {
    if (typeof this.#currentMinoKind !== "number") return;
    if (this.#lockdown.hasLocked() && this.#isTouchedDown()) return;
    if (!Util.isPlacable(
      this.#currentMinoX + x,
      this.#currentMinoY,
      this.#currentMinoKind,
      this.#currentMinoRot,
      this.#fieldData
    )) return;

    this.#currentMinoX += x;

    this.#lockdown.extendLockdownTimer();
    if (this.#isTouchedDown()) {
      this.#lockdown.startLockdownTimer();
    }
  }
  moveMinoRight() {
    this.#moveMinoLR(1);
  }
  moveMinoLeft() {
    this.#moveMinoLR(-1);
  }

  /** @param {number} angle */
  #rotateMino(angle) {
    const currentMinoKind = this.#currentMinoKind;
    if (typeof currentMinoKind !== "number") return;
    if (this.#lockdown.hasLocked() && this.#isTouchedDown()) return;
    const newRot = (this.#currentMinoRot + angle + 8) % 4;
    const candidacies = Util.checkChallengeMode() ? [[0, 0]] : Util.superRotationResolve(this.#currentMinoRot, newRot, currentMinoKind);
    const displacement = candidacies.find(({ 0: x, 1: y }) => Util.isPlacable(
      this.#currentMinoX + x,
      this.#currentMinoY + y,
      currentMinoKind,
      newRot,
      this.#fieldData
    ));
    if (!displacement) return;
    const { 0: displacementX, 1: displacementY } = displacement;
    this.#currentMinoRot = newRot;
    this.#currentMinoX += displacementX;
    this.#currentMinoY += displacementY;
    this.#lockdown.extendLockdownTimer();
    if (this.#currentMinoY < this.#currentMinoLowestY) {
      this.#currentMinoLowestY = this.#currentMinoY;
      this.#lockdown.resetMinoMovementRemaining();
    }
    if (this.#isTouchedDown()) {
      this.#lockdown.startLockdownTimer();
    }
  }
  rotateMinoRight() {
    this.#rotateMino(1);
  }
  rotateMinoLeft() {
    this.#rotateMino(-1);
  }
}
