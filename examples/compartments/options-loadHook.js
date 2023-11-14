const c = new Compartment({}, {}, {
	async loadHook(specifier) {
		return { source:`export default import.meta.uri`, meta: { uri: specifier } };
	},
})
const nsa = await c.import("a");
print(nsa.default); // a
const nsb = await c.import("b");
print(nsb.default); // b
