import { formatter } from './formatter.js';
// print(import.meta.url);

export function debug(value) {
    // // const output = [];
    // const seen = new WeakSet();

    // const json = JSON.stringify(value, (key, value) => {
    //     if (typeof value === 'object' && value !== null) {
    //         if (seen.has(value)) return;
    //         const clone = {};
    //         for (const key in value) {

    //         }
    //         seen.add(value);
    //     }
    //     // output.push({ key, value });
    //     return value;
    // });

    const json = formatter(value);

    internal.print(formatter(value));
    // (('console' in globalThis && globalThis?.console?.log) ?? globalThis?.print)(json);
}

const internal = {
    print: 'console' in globalThis && typeof globalThis?.console?.log === 'function'
        ? string => console.log(string)
        : string => print(string),
};
