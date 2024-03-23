import { SafeObject } from "./SafeObject.mjs";

export class Field extends SafeObject {
  #tiles = [];
  constructor() {
    super();
    this.clear();
    Object.seal(this);
  }
  clear() {
    this.#tiles.splice(0, this.#tiles.length);
    for (let i = 1; i < Field.BLOCK_ROWS; i++) {
      this.#tiles.push(new FieldLine());
    }
    this.#tiles.push(FieldLine.BOTTOM);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {string}
   */
  tileAt(x, y) {
    y += Field.BLOCK_Y_BIAS;
    switch (!0) {
      case !Number.isSafeInteger(x):
      case !Number.isSafeInteger(y):
        throw new TypeError("Invalid coords");
      case x < 0:
      case y < 0:
      case Field.BLOCK_COLS <= x:
      case Field.BLOCK_ROWS <= y:
        return "#7F7F7F";
    }
    return this.#tiles[y][x];
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {string} color
   */
  putTile(x, y, color) {
    this.#tiles[y + Field.BLOCK_Y_BIAS][x] = color;
  }
  findLineFilled() {
    for (let y = this.#tiles.length - 2; y >= 0; y--) {
      if (this.#tiles[y].isFilled()) {
        return y - Field.BLOCK_Y_BIAS;
      }
    }
    return -1;
  }
  isEmpty() {
    return this.#tiles.slice(0, -1).every(l => l.isEmpty());
  }
  /** @param {number} y */
  cutLine(y) {
    this.#tiles.splice(y + Field.BLOCK_Y_BIAS, 1);
    this.#tiles.unshift(new FieldLine());
  }
  /**
   * @param {(info : { x: number, y: number, color: string }) => void} callback
   */
  forEach(callback) {
    this.#tiles.forEach((line, y) => line.forEach((color, x) => callback({ x, y: y - Field.BLOCK_Y_BIAS, color })));
  }
}
Object.defineProperties(Field, {
  BLOCK_Y_BIAS: { __proto__: null, value: 10 },
  BLOCK_COLS: { __proto__: null, value: 10 + 2 },
  BORDER_BLOCK_COLOR: { __proto__: null, value: "#DDDDED" }
});
Object.defineProperty(Field, "BLOCK_ROWS", {
  __proto__: null,
  value: 20 + 1 + Field.BLOCK_Y_BIAS
});
Object.freeze(Field.prototype);

class FieldLine extends SafeObject {
  constructor() {
    super();
    Object.defineProperties(this, {
      0: { __proto__: null, value: Field.BORDER_BLOCK_COLOR },
      [Field.BLOCK_COLS - 1]: { __proto__: null, value: Field.BORDER_BLOCK_COLOR },
      length: { __proto__: null, value: Field.BLOCK_COLS }
    });
  }
  forEach(callback) {
    for (let i = 0; i < Field.BLOCK_COLS; i++) {
      if (i in this) callback(this[i], i);
    }
  }
  isFilled() {
    for (let i = Field.BLOCK_COLS - 1; -1 < i; i--) {
      if (!this[i]) return false;
    }
    return true;
  }
  isEmpty() {
    for (let i = Field.BLOCK_COLS - 1; -1 < i; i--) {
      if (this[i]) return false;
    }
    return true;
  }
}
Object.defineProperty(FieldLine, "BOTTOM", {
  __proto__: null,
  value: new FieldLine()
});
for (let i = 1; i < Field.BLOCK_COLS - 1; i++) {
  Object.defineProperty(FieldLine.BOTTOM, i, {
    __proto__: null,
    value: Field.BORDER_BLOCK_COLOR
  });
}
Object.freeze(FieldLine.BOTTOM);
Object.freeze(FieldLine.prototype);
