import { inherits } from "node:util";

/**
 * Аналог ошибки, но без сбора стектрейса (его сбор занимает много времени, а нужен не всегда).
 */
export class StacklessError {
  constructor(message = "", data = undefined) {
    this.data = data;
    this.message = message;
    // warning: if you minify/obfuscate your code for any reason, the name gets mangled.
    // then you must explicitly set name: `this.name = "StacklessError";`
    this.name = this.constructor.name;
  }
}

// new StacklessError('') instanceof Error === true

inherits(StacklessError, Error);

// Object.prototype.toString.call(new StacklessError) === '[object Error]'
Object.defineProperty(StacklessError.prototype, Symbol.toStringTag, {
  value: "Error",
  writable: false,
  configurable: false,
  enumerable: false,
});

// function inherits(ctor, superCtor) {
//   Object.defineProperty(ctor, "super_", {
//     __proto__: null,
//     value: superCtor,
//     writable: true,
//     configurable: true,
//   });
//   Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
// }
