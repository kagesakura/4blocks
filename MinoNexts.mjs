// @ts-check

import { SafeObject } from "./SafeObject.mjs";

export class MinoNexts extends SafeObject {
  /**
   * @type {number[]}
   * @readonly
   */
  #nexts = [];
  /**
   *  @type {number[]}
   *  @readonly
   */
  #minoStack = [];

  constructor() {
    super();
    while (this.#nexts.length < 7) {
      if (!this.#minoStack.length) this.#minoStack.push(0, 1, 2, 3, 4, 5, 6);
      this.#nexts.push(this.#minoStack.splice((Math.random() * this.#minoStack.length) >>> 0, 1)[0]);
    }
  }
  shiftMino() {
    if (!this.#minoStack.length) this.#minoStack.push(0, 1, 2, 3, 4, 5, 6);
    this.#nexts.push(this.#minoStack.splice((Math.random() * this.#minoStack.length) >>> 0, 1)[0]);
    return /** @type {0 | 1 | 2 | 3 | 4 | 5 | 6} */ (this.#nexts.shift());
  }
  getNexts() {
    return /** @type {(0 | 1 | 2 | 3 | 4 | 5 | 6)[]} */ ([...this.#nexts]);
  }
}
