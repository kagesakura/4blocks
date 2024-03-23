import { SafeObject } from "./SafeObject.mjs";

const { floor } = Math;

export class HTMLCanvas extends SafeObject {
  /**
   * @type {CanvasRenderingContext2D}
   * @readonly
   */
  #context;

  #width;
  #height;
  #scaler;

  /**
   * @param {number} width
   * @param {number} height
   * @param {import("./Scaler.mjs").Scaler} scaler
   */
  constructor(width, height, scaler) {
    super();
    const canvas = document.createElement("canvas");
    canvas.addEventListener("click", e => this.emit("click", e));
    this.#context = canvas.getContext("2d");
    this.#width = width;
    this.#height = height;
    this.#scaler = scaler;
    scaler.on("rescale", () => {
      canvas.width = width * scaler.scale;
      canvas.height = height * scaler.scale;
    });
  }

  /** @param {HTMLElement} element */
  appendTo(element) {
    element.append(this.#context.canvas);
    return element;
  }

  getBoundingClientRect() {
    return this.#context.canvas.getBoundingClientRect();
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  clear() {
    this.#context.clearRect(0, 0, this.#context.canvas.width, this.#context.canvas.height);
  }

  /**
   * @param {number} startX
   * @param {number} startY
   * @param {number} displacementX
   * @param {number} displacementY
   * @param {number} borderWidth
   * @param {string} color
   */
  stroke(startX, startY, displacementX, displacementY, borderWidth, color) {
    this.#context.strokeStyle = color;
    this.#context.lineWidth = borderWidth * this.#scaler.scale;
    this.#context.beginPath();
    this.#context.moveTo(startX * this.#scaler.scale, startY * this.#scaler.scale);
    this.#context.lineTo((startX + displacementX) * this.#scaler.scale, (startY + displacementY) * this.#scaler.scale);
    this.#context.stroke();
  }

  /**
   * @param {number} startX
   * @param {number} startY
   * @param {number} displacementX
   * @param {number} displacementY
   * @param {string} color
   */
  fillRect(startX, startY, displacementX, displacementY, color) {
    this.#context.fillStyle = color;
    this.#context.fillRect(startX * this.#scaler.scale, startY * this.#scaler.scale, displacementX * this.#scaler.scale, displacementY * this.#scaler.scale);
  }

  /**
   * @param {number} startX
   * @param {number} startY
   * @param {number} displacementX
   * @param {number} displacementY
   * @param {string} color
   */
  strokeRect(startX, startY, displacementX, displacementY, color) {
    this.#context.strokeStyle = color;
    this.#context.strokeRect(floor(startX * this.#scaler.scale), floor(startY * this.#scaler.scale), floor(displacementX * this.#scaler.scale), floor(displacementY * this.#scaler.scale));
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {CanvasTextAlign} align
   * @param {CanvasTextBaseline} baseline
   * @param {string} font
   */
  fillText(text, x, y, color, align, baseline, font) {
    this.#context.fillStyle = color;
    this.#context.textAlign = align;
    this.#context.textBaseline = baseline;
    this.#context.font = font;
    this.#context.fillText(text, x * this.#scaler.scale, y * this.#scaler.scale);
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {CanvasTextAlign} align
   * @param {CanvasTextBaseline} baseline
   * @param {string} font
   * @param {number} lineWidth
   */
  strokeText(text, x, y, color, align, baseline, font, lineWidth) {
    this.#context.strokeStyle = color;
    this.#context.lineWidth = lineWidth * this.#scaler.scale;
    this.#context.textAlign = align;
    this.#context.textBaseline = baseline;
    this.#context.font = font;
    this.#context.strokeText(text, x * this.#scaler.scale, y * this.#scaler.scale);
  }
}