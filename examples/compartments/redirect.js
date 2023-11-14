
const a = new StaticModuleRecord({ source:`
	export default "a";
`});
const b = new StaticModuleRecord({ source:`
	import a from "./a.js";
	export default a + "b";
`});

const c = new Compartment({}, {
	"/r/a.js": { record: a },
	"/c/b.js": { record: b, specifier: "/r/b.js" },
})
const nsb = await c.import("/c/b.js");
print(nsb.default); // ab
