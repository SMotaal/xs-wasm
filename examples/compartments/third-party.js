const x = new StaticModuleRecord({ source:`
	export const a = "a";
`});
const y = new StaticModuleRecord({ source:`
	export const b = "b";
`});

const z = new StaticModuleRecord({ 
	bindings: [
		{ import:"*", as:"nsx", from:"x" },
		{ import:"*", as:"nsy", from:"y" },
		{ export:"ab", as:"xy" },
	],
	initialize($) {
		$.ab = $.nsx.a + $.nsy.b;
	}
});

const c = new Compartment({}, { x, y, z } );

const nsz = await c.import("z");
print(nsz.xy); // ab
