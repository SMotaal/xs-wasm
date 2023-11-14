lockdown();
const foo = { source:`
	let foo = 0;
	export default harden(function() {
		return foo++;
	})
	export const bar = {};
`};

const c = new Compartment({ harden }, { foo });
const ns = await c.import("foo");
print(mutabilities(ns).join("\n"));
