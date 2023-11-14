class C {
	#f
	constructor(f) {
		this.#f = f;
	}
	get f() {
		return this.#f;
	}
	set f(it) {
		this.#f = it;
	}
}
const c	= new C(0);
Object.freeze(c);
c.f = 1;
print(c.f); // 1
petrify(c);
try { c.f = 2; } catch { }
print(c.f); // 1

const d = new Date(1993);
Object.freeze(d);
d.setFullYear(2022);
print(d.getFullYear()); // 2022
petrify(d);
try { d.setFullYear(1961); } catch { }
print(d.getFullYear()); // 2022
