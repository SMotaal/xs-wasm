let getterCount = 0;
let setterCount = 0;
const globalLexicals = {
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

const c1 = new Compartment({ print }, {}, { globalLexicals});
c1.evaluate(`
	foo++;
	bar++;
	shared.foo++;
	shared.bar++;
`);

const c2 = new Compartment({ print }, {}, { globalLexicals });
c2.evaluate(`
	foo++;
	bar++;
	shared.foo++;
	shared.bar++;
`);

print(getterCount); // 2;
print(setterCount); // 0;
print(globalLexicals.foo); // 0;
print(globalLexicals.bar); // 0;
print(globalLexicals.shared.foo); // 4;
print(globalLexicals.shared.bar); // 4;
c1.evaluate(`
	print(foo); // 1;
	print(bar); // 1;
`);
print(c1.globalThis.foo); // undefined;
print(c1.globalThis.bar); // undefined;
c2.evaluate(`
	print(foo); // 1;
	print(bar); // 1;
`);
print(c2.globalThis.foo); // undefined;
print(c2.globalThis.bar); // undefined;
