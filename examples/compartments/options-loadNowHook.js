const c = new Compartment({}, {}, {
	loadNowHook(specifier) {
		return { source:`export default "${specifier}"` };
	},
})
const nsa = c.importNow("a");
print(nsa.default); // a
const nsb = c.importNow("b");
print(nsb.default); // b
