const tests = `
	let result = "";
	function test(f) {
		try {
			f();
			result += 'Y';
		}
		catch {
			result += 'N';
		}
	}
	test(()=>new test.constructor(""));
	test(()=>new Date());
	test(()=>Date.now());
	test(()=>Math.random());
	print(result);
`

print('BEFORE LOCKDOWN');

print('- START COMPARTMENT');
eval(tests);

print('- NEW COMPARTMENT');
const before = new Compartment({ print });
before.evaluate(tests);

lockdown();

print('AFTER LOCKDOWN');

print('- START COMPARTMENT');
eval(tests);

print('- NEW COMPARTMENT');
const after = new Compartment({ print });
after.evaluate(tests);
