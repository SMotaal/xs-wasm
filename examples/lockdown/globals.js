lockdown();
globalThis.x = 0;
y = 0;
var z = 0;
function f() {
	return x + y + z;
}
print(mutabilities(harden(f)).join("\n"));

Object.defineProperty(globalThis, "ok", { value:0, configurable:false, writable:false });
function g() {
	return ok;
}
print(mutabilities(harden(g)));

