let getterCount = 0;
let setterCount = 0;
const endowments = {
	foo: 0,
	get bar() {
		getterCount++;
		return this.foo;
	},
	set bar(it) {
		setterCount++;
		this.foo = it;
	},
	shared: {
		foo: 0,
		get bar() {
			return this.foo;
		},
		set bar(it) {
			this.foo = it;
		},
	}
};

const c1 = new Compartment(endowments, {}, {});
c1.evaluate(`
	foo++;
	bar++;
	shared.foo++;
	shared.bar++;
	globalThis.which = 1;
`);

const c2 = new Compartment(endowments, {}, {});
c2.evaluate(`
	foo++;
	bar++;
	shared.foo++;
	shared.bar++;
	globalThis.which = 2;
`);

print(getterCount); // 2;
print(setterCount); // 0;
print(endowments.foo); // 0;
print(endowments.bar); // 0;
print(endowments.shared.foo); // 4;
print(endowments.shared.bar); // 4;
print(endowments.which); // undefined;
print(c1.globalThis.foo); // 1;
print(c1.globalThis.bar); // 1;
print(c1.globalThis.which); // 1;
print(c2.globalThis.foo); // 1;
print(c2.globalThis.bar); // 1;
print(c2.globalThis.which); // 2;

