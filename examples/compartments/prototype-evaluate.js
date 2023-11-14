const c = new Compartment();
let result;
result = c.evaluate(`
	this.foo = 0;
	let bar = 0;
	bar = foo++
`);
print(result); // 0
result = c.evaluate(`
	bar = foo++
`);
print(result); // 1
print(c.globalThis.foo); // 2
