// @ts-check

import { SafeObject } from "./SafeObject.mjs";

export class EventEmitter extends SafeObject {
  /**
   * @type {Record<string, ((...params: any[]) => void)[]>}
   * @readonly
   */
  // @ts-expect-error This error is a TS's bug.
  #listeners = { __proto__: null};

  /**
   * @param {string} type
   * @param {(...params: any[]) => void} listener
   */
  on(type, listener) {
    if (!(type in this.#listeners)) this.#listeners[type] = [];
    this.#listeners[type].push(listener);
    return this;
  }

  /**
   * @param {string} type
   * @param {(type: string, ...params: any[]) => void} listener
   */
  off(type, listener) {
    if (!(type in this.#listeners)) return this;
    const stack = this.#listeners[type];
    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === listener){
        stack.splice(i, 1);
        return this;
      }
    }
    return this;
  }

  /**
   * @param {string} type
   * @param {any[]} args
   */
  emit(type, ...args) {
    if (!(type in this.#listeners)) return !1;
    const stack = this.#listeners[type].slice();
    if (!stack.length) return !1;
    for (const listener of stack) listener(...args);
    return !0;
  }
}

Object.freeze(EventEmitter.prototype);
