"use strict";

let order = "";
const handler = {
  preventExtensions(target) {
    order += target.name;
    return Reflect.preventExtensions(target);
  }
}
function createObservable(proto, name) {
  const target = Object.create(proto);
  target.name = name;
  return new Proxy(target, handler);
}

const a = createObservable(null, "a");
a.e = createObservable(null, "e");
a.n = createObservable(null, "n");
const h = createObservable(a, "h");
h.r = createObservable(null, "r");
h.r.i = createObservable(null, "i");
h.r.t = createObservable(null, "t");
h.d = createObservable(null, "d");

lockdown();
harden(h);
print(order);
