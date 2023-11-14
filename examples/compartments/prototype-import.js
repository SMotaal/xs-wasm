const c = new Compartment({}, {
	"/a": { source:`
		let a = 0;
		export default function() {
			return a++;
		}
	`},
	"/b": { source:`
		const nsa = await import("./a");
		export default function() {
			const a = nsa.default();
			return a * a;
		}
	`},
});
const nsa = await c.import("/a");
const nsb = await c.import("/b");
print(nsa.default()); // 0;
print(nsb.default()); // 1;
print(nsa.default()); // 2;
