const uri = import.meta.uri;
const foo = uri.slice(0, uri.lastIndexOf("/") + 1) + "moduleMap-fixture.js";

function moduleMapHook(specifier) {
	if ((specifier == "foo") || (specifier == "bar"))
		return foo;
}

const c1 = new Compartment({}, {}, { moduleMapHook });
const fooNS1 = await c1.import("foo");
const barNS1 = await c1.import("bar");

const c2 = new Compartment({}, {}, { moduleMapHook });
const fooNS2 = await c2.import("foo");
const barNS2 = await c2.import("bar");

print(fooNS1.default()); // 0;
print(barNS1.default()); // 0;
print(fooNS2.default()); // 0;
print(barNS2.default()); // 0;
