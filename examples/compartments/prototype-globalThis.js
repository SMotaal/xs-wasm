const c = new Compartment();
const globals = c.globalThis;
const names = Object.getOwnPropertyNames(globals);
const exceptions = [ "Compartment", "Function", "NaN", "eval", "global", "globalThis" ];
for (let name of names) {
	const actual = globalThis[name] === globals[name];
	const expected = (exceptions.indexOf(name) >= 0) ? false : true;
	if (actual != expected)
		print(name);
}
