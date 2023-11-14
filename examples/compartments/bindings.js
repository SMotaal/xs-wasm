const smr = new StaticModuleRecord({ source:`
	export var v0;	
	export default 0
	export { v0 as w0 };	

	import v1 from "mod";
	import * as ns1 from "mod";	
	import { x1 } from "mod";	
	import { v1 as w1 } from "mod";	

	export { x2 } from "mod";
	export { v2 as w2 } from "mod";
	export * from "mod";
	export * as ns2 from "mod";
`});

print(JSON.stringify(smr.bindings, null, "\t"));
