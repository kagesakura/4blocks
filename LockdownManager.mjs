// @ts-check

import { SafeObject } from "./SafeObject.mjs";

const { now } = Date;

export class LockdownManager extends SafeObject {
  /** @type {number | undefined} */
  #lockdownTimer = undefined;

  /** @type {number} */
  #minoMovementRemaining = 15;

  constructor() {
    super();
  }

  hasLocked() {
    return (typeof this.#lockdownTimer === "number") && (now() > this.#lockdownTimer);
  }

  /**
   * Start the lockdown timer.
   * Call this when the falling mino touched down.
   * If the lockdown timer have already started, do nothing.
   */
  startLockdownTimer() {
    if (typeof this.#lockdownTimer === "number") return;
    this.#lockdownTimer = now() + 500;
  }

  /**
   * Extend the lockdown timer.
   * Call this when the falling mino is moved or rotated by the user.
   * If the lockdown timer have started yet, do nothing.
   * Else, if mino-movement-remaining > 0, set lockdown timer to 500ms and decriment mino-movement-remaining.
   * Else, lock down immediately.
   */
  extendLockdownTimer() {
    if (typeof this.#lockdownTimer !== "number") return;
    if (this.#minoMovementRemaining > 0) {
      this.#lockdownTimer = now() + 500;
      this.#minoMovementRemaining--;
    } else {
      this.#lockdownTimer = now();
    }
  }

  /**
   * Clear the lockdown timer and reset mino-movement-remaining.
   * Call this when the next mino is generated.
   */
  resetEveryCount() {
    this.#minoMovementRemaining = 15;
    this.#lockdownTimer = void 0;
  }

  /** Call this when the lowest Y pos of the falling mino is updated. */
  resetMinoMovementRemaining() {
    this.#minoMovementRemaining = 15;
  }
}
