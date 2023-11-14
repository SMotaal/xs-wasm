const c1 = new Compartment({}, {
	a: {source:`
		let x = 0;
		export default function() { return x++; };
	`}
});
const nsa1 = c1.module("a");
const c2 = new Compartment({}, {
	a: nsa1
});
const nsa2 = await c2.import("a");
print(nsa1.default()); // 0
print(nsa2.default()); // 1
print(nsa1 === nsa2); // true
