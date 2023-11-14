const uri = import.meta.uri;
const foo = uri.slice(0, uri.lastIndexOf("/") + 1) + "moduleMap-fixture.js";

let getterCount = 0;
let setterCount = 0;
const moduleMap = {
	foo,
	get bar() {
		getterCount++;
		return this.foo;
	},
	set bar(it) {
		setterCount++;
		this.foo = it;
	},
};

const c1 = new Compartment({}, moduleMap, {});
const fooNS1 = await c1.import("foo");
const barNS1 = await c1.import("bar");

const c2 = new Compartment({}, moduleMap, {});
const fooNS2 = await c2.import("foo");
const barNS2 = await c2.import("bar");

print(getterCount); // 2;
print(setterCount); // 0;
print(fooNS1.default()); // 0;
print(barNS1.default()); // 0;
print(fooNS2.default()); // 0;
print(barNS2.default()); // 0;
