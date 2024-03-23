const SafeObjectCtor = function SafeObject() {
  if (!new.target) throw new TypeError("Class constructors cannot be invoked without 'new'");
};

export const SafeObject = /** @type {new () => {}} */ (SafeObjectCtor);

delete SafeObject.prototype.constructor;

Object.setPrototypeOf(SafeObject.prototype, null);
Object.freeze(SafeObject.prototype);

const re = /^(0|[1-9]\d{0,9})$/;
Object.setPrototypeOf(re, null);
Object.seal(re);
const isIntStr = /0/.exec.bind(re);
const { isArray } = Array;
const handler = Object.freeze({
  __proto__: null,
  get(_, p, r) {
    if (typeof p !== "string") return void 0;
    if (isIntStr(p) && (+p < 0xFFFFFFFF)) return void 0;
    throw new TypeError(`The Property ${String(p)} doesn't exist.`);
  }
});

delete handler.get.length;
delete handler.get.name;

Object.setPrototypeOf(handler.get, null);
Object.freeze(handler.get);

SafeObject.prototype = new Proxy(SafeObject.prototype, handler);

delete SafeObject.length;
delete SafeObject.name;
delete SafeObject.arguments;
delete SafeObject.caller;

Object.setPrototypeOf(SafeObject, null);
Object.freeze(SafeObject);
