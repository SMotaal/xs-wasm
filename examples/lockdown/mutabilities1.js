"use strict";

lockdown();
const o = {
	foo:88,
};
print(mutabilities(o));

const p = harden({
	foo:88,
});
print(mutabilities(p));
