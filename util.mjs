const freezeAs2NumTupleArray = /**
 * @type {(items: [number, number][]) => ReadonlyArray<[number, number]>}
 */ (items => Object.freeze(items.map(i => Object.freeze(i))));
const getRotated = /**
* @type {(items: [number, number][]) => Readonly<Record<0 | 1 | 2 | 3, ReadonlyArray<[number, number]>>>}
*/ (pos => Object.freeze({
  0: freezeAs2NumTupleArray(pos.map(i => [...i])),
  1: freezeAs2NumTupleArray(pos.map(i => [-i[1], i[0]])),
  2: freezeAs2NumTupleArray(pos.map(i => [-i[0], -i[1]])),
  3: freezeAs2NumTupleArray(pos.map(i => [i[1], -i[0]]))
}));
const duplicate4 =  /**
* @type {(items: [number, number][]) => Readonly<Record<0 | 1 | 2 | 3, ReadonlyArray<[number, number]>>>}
*/ (pos => Object.freeze({
  0: freezeAs2NumTupleArray(pos),
  1: freezeAs2NumTupleArray(pos),
  2: freezeAs2NumTupleArray(pos),
  3: freezeAs2NumTupleArray(pos)
}));
const frozenNullProto = /** @type {<T>(v: T) => Readonly<T>} */ ((properties) => Object.freeze(Object.assign({ __proto__: new Proxy(Object.freeze({ __proto__: null }), Object.freeze({
  __proto__: null,
  get(_, p) {
    throw new TypeError(`The Property ${p} doesn't exist.`);
  }
})) }, properties)));
const rotationCandidacies = Object.freeze({
  from1: freezeAs2NumTupleArray([[0, 0], [ 1, 0], [ 1,  1], [ 0, -2], [ 1, -2]]),
  from3: freezeAs2NumTupleArray([[0, 0], [-1, 0], [-1,  1], [ 0, -2], [-1, -2]]),
  to1  : freezeAs2NumTupleArray([[0, 0], [-1, 0], [-1, -1], [ 0,  2], [-1,  2]]),
  to3  : freezeAs2NumTupleArray([[0, 0], [ 1, 0], [ 1, -1], [ 0,  2], [ 1,  2]]),
  3201 : freezeAs2NumTupleArray([[0, 0], [-2, 0], [ 1,  0], [-2, -1], [ 1,  2]]),
  1023 : freezeAs2NumTupleArray([[0, 0], [ 2, 0], [-1,  0], [ 2,  1], [-1, -2]]),
  1203 : freezeAs2NumTupleArray([[0, 0], [-1, 0], [ 2,  0], [-1,  2], [ 2, -1]]),
  3021 : freezeAs2NumTupleArray([[0, 0], [ 1, 0], [-2,  0], [ 1, -2], [-2,  1]]),
});

export const Util = frozenNullProto({
  checkChallengeMode() {
    try { CHALLENGE_MODE; return true }
    catch { return false }
  },
  colorTable: Object.freeze({
    0: "#9c0de2", 1: "#e5002b", 2: "#00e32c",
    3: "#e56100", 4: "#0052e3", 5: "#e6db00", 6: "#00e4e5"
  }),
  shapeTable: Object.freeze({
    0: getRotated([[-1,  0], [ 0,  0], [0, -1], [1,  0]]),
    1: getRotated([[-1, -1], [ 0, -1], [0,  0], [1,  0]]),
    2: getRotated([[-1,  0], [ 0,  0], [0, -1], [1, -1]]),
    3: getRotated([[-1,  0], [ 0,  0], [1,  0], [1, -1]]),
    4: getRotated([[-1, -1], [-1,  0], [0,  0], [1,  0]]),
    5: duplicate4([[ 1, -1], [ 1,  0], [0,  0], [0, -1]]),
    6: Object.freeze({
      0: freezeAs2NumTupleArray([[-1, 0], [0, 0], [1, 0], [2, 0]]),
      1: freezeAs2NumTupleArray([[1, -1], [1, 0], [1, 1], [1, 2]]),
      2: freezeAs2NumTupleArray([[-1, 1], [0, 1], [1, 1], [2, 1]]),
      3: freezeAs2NumTupleArray([[0, -1], [0, 0], [0, 1], [0, 2]])
    })
  }),

  /**
   * @param {number} oldRot
   * @param {number} newRot
   * @param {number} shape
   * @returns {[number, number][]}
   */
  superRotationResolve(oldRot, newRot, shape) {
    if (shape === 6) {
      switch (!0) {
        case oldRot === 3 && newRot === 2:
        case oldRot === 0 && newRot === 1:
          return rotationCandidacies[3201];
        case oldRot === 1 && newRot === 0:
        case oldRot === 2 && newRot === 3:
         return rotationCandidacies[1023];
        case oldRot === 1 && newRot === 2:
        case oldRot === 0 && newRot === 3:
          return rotationCandidacies[1203];
        case oldRot === 3 && newRot === 0:
        case oldRot === 2 && newRot === 1:
          return rotationCandidacies[3021];
      }
    }
    if (oldRot === 1) return rotationCandidacies.from1;
    if (oldRot === 3) return rotationCandidacies.from3;
    if (newRot === 1) return rotationCandidacies.to1;
    if (newRot === 3) return rotationCandidacies.to3;
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} shape
   * @param {number} rot
   * @param {({ tileAt: (x: number, y: number) => (string | undefined) })} field
   * @returns {boolean}
   */
  isPlacable(baseX, baseY, shape, rot, field) {
    return Util.shapeTable[shape][rot].every(([x, y]) => !field.tileAt(baseX + x, baseY + y));
  }
});

const createOption = (label, value) => {
  const element = document.createElement("option");
  element.label = label, element.value = value;
  return element;
};
export const HTMLUtil = frozenNullProto({
  /**
   * @param {string} key
   * @param {string} defaultValue
   */
  createKeySelector(key, defaultValue) {
    if (key in localStorage) defaultValue = localStorage[key];
    const select = document.createElement("select");
    for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      select.add(createOption(char, `key#${char}#i`));
    }
    select.add(createOption("ArrowRight", "code#ArrowRight"));
    select.add(createOption("ArrowLeft", "code#ArrowLeft"));
    select.add(createOption("ArrowUp", "code#ArrowUp"));
    select.add(createOption("ArrowDown", "code#ArrowDown"));
    select.add(createOption("Space", "code#Space"));
    select.add(createOption("R Shift", "code#ShiftRight"));
    select.add(createOption("L Shift", "code#ShiftLeft"));
    select.add(createOption("Enter", "code#Enter"));
    for (const num of "0123456789") {
      select.add(createOption(num, `code#Digit${num}`));
    }
    for (const num of "0123456789") {
      select.add(createOption(`Numpad ${num}`, `code#Numpad${num}`));
    }
    select.add(createOption("Numpad Enter", "code#NumpadEnter"));
    select.add(createOption("Numpad Decimal", "code#NumpadDecimal"));
    for (const char of `!"#$%&'()`) {
      select.add(createOption(char, `key#${char}`));
    }
    for (const char of ",./<>?_;:[]+*{}@`-^=~|") {
      select.add(createOption(char, `key#${char}`));
    }
    if ([...select.options].find(opt => opt.value === defaultValue)) {
      select.value = defaultValue;
    }
    select.addEventListener("change", () => localStorage[key] = select.value);
    return select;
  },
  /**
   * @param {KeyboardEvent} e
   * @param  {...HTMLSelectElement} settings
   */
  checkKeysDown: (e, ...settings) => settings.map(s => {
    const sval = s.value.split("#");
    const value = e[sval[0]];
    if (sval[2] !== "i") return sval[1] === value;
    return sval[1].toLowerCase() === value.toLowerCase();
  })
});

export const DrawUtil = frozenNullProto({
  drawBlock(canvas, x, y, size, color) {
    canvas.fillRect(x, y, size, size, color);
    const borderWidth = size / 10;
    canvas.stroke(x, y + borderWidth / 2, size, 0, borderWidth, "#FFFFFF70");
    canvas.stroke(x + borderWidth / 2, y, 0, size, borderWidth, "#FFFFFF70");
    canvas.stroke(x + borderWidth / 2, y + size - borderWidth / 2, size - borderWidth / 2, 0, borderWidth, "#00000055");
    canvas.stroke(x + size - borderWidth / 2, y + borderWidth / 2, 0, size - borderWidth / 2, borderWidth, "#00000055");
  },
  drawGhostBlock(canvas, x, y, size, color) {
    canvas.fillRect(x, y, size, size, color + "50");
    const borderWidth = size / 15;
    canvas.stroke(x, y, size, 0, borderWidth, color);
    canvas.stroke(x, y, 0, size, borderWidth, color);
    canvas.stroke(x, y + size, size, 0, borderWidth, color);
    canvas.stroke(x + size, y, 0, size, borderWidth, color);
  },
  drawMino(canvas, x, y, shape, rot, blockSize, color) {
    for (const [blockX, blockY] of Util.shapeTable[shape][rot]) {
      DrawUtil.drawBlock(
        canvas,
        x + blockX * blockSize,
        y + blockY * blockSize,
        blockSize, color
      );
    }
  },
  drawNexts(canvas, nexts, offsetX, offsetY, interval, blockSize) {
    nexts.forEach((minoShape, index) => {
      DrawUtil.drawMino(
        canvas, [5, 6].includes(minoShape) ? offsetX : offsetX + blockSize / 2, index * interval + offsetY,
        minoShape, 0, blockSize, 
        Util.colorTable[minoShape]
      );
    });
  }
});