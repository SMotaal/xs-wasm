
const a = new StaticModuleRecord({ source:`
	export default import.meta.uri;
`});
const b = new StaticModuleRecord({ source:`
	import a from "./a.js";
	export default a + " " + import.meta.uri;
`});

const c = new Compartment({}, {
	"/c/a.js": { record: a, meta: { uri:"/r/a.js" } },
	"/c/b.js": { record: b, meta: { uri:"/r/b.js" } },
})
const nsb = await c.import("/c/b.js");
print(nsb.default); // /r/a.js /r/b.js
