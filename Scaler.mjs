// @ts-check

import { EventEmitter } from "./EventEmitter.mjs";

export class Scaler extends EventEmitter {
  #scale = 1;
  constructor() {
    super();
  }
  get scale() {
    return this.#scale;
  }
  /** @param {number} x */
  setScale(x) {
    if (!Number.isFinite(x)) return;
    if (Math.abs(this.#scale - x) > 0.005) {
      this.#scale = x;
      this.emit("rescale");
    } else {
      this.#scale = x;
    }
  }
}
