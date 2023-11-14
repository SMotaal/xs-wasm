const create = Object.create;
const getPrototypeOf = Object.getPrototypeOf;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
const defineProperties = Object.defineProperties;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// export const formatter = (item, options = formatter.defaults) => {
// 	let type, body, kind;

// 	const element =
// 		((type = item === null ? null : typeof item) === 'object' &&
// 			(('textContent' in item && item instanceof (kind = Element) && Span(item)) ||
// 				(item instanceof (kind = Error) &&
// 					Span(
// 						// (body = (item.stack ? `${item.stack}` : `${item}`.split(item.message)[1]) || undefined)
// 						// (item => item.stack.trim().startsWith(item) ? item.stack : `${item}\n${item.stack.replace(/^\s*/m,'  ')}`.trim())(new Error('x'))
// 						(body =
// 							(item.stack.trim().startsWith(item)
// 								? item.stack
// 								: `${item}\n${item.stack.replace(/(^|\n)\s*/g, '$1\t').replace(/\t/g, '  ')}`
// 							).trim() || undefined)
// 							? {class: 'error', title: body}
// 							: {class: 'error'},
// 						`${item}`,
// 					)) ||
// 				(item instanceof (kind = Array) && formatter.array(item, options)) ||
// 				((kind = undefined), Span(formatter.object(item, options))))) ||
// 		(type === 'function' && Span(`${item}`)) ||
// 		Span(type !== 'symbol' ? `${item}` : '');

// 	if (element && element.classList) {
// 		let className;

// 		if (type === 'object') {
// 			className = (getPrototypeOf(item) || Object).constructor.name;
// 			kind && kind.name && (kind = kind.name);
// 			element.classList.add(`${className || kind}-object`);
// 		} else if (type === 'function') {
// 			className = getPrototypeOf(item).constructor.name;
// 			type =
// 				className === 'GeneratorFunction'
// 					? 'generator-function'
// 					: !hasOwnProperty(item, 'prototype')
// 					? 'arrow-function'
// 					: !item.prototype ||
// 					  item.prototype.constructor !== item ||
// 					  getOwnPropertyDescriptor(item, 'prototype').writable
// 					? 'function'
// 					: 'class';
// 			element.classList.add(`${className}-object`);
// 		}
// 		element.classList.add(`${type}-value`);
// 		className && element.setAttribute('data-class', className);
// 		kind && element.setAttribute('data-kind', kind);
// 		item == null || (type === 'object' && !element.classList.add());
// 	}
// 	return element;
// };

// export const array = (formatter.array = (item, options = formatter.defaults) => {
// 	const span = Span();
// 	span.className = 'array-span';
// 	idle(() => {
// 		const name = (item.constructor || Array).name || 'Array';
// 		const content = item.length
// 			? [].concat(...item.map((v, i) => [Indent(), Span(formatter.array.item(v, options), Comma())]))
// 			: [];
// 		const root = span;
// 		root.append(Fragment.array());
// 		const slot = root.querySelector('slot:not([name])') || root.appendChild(Slot());
// 		const head = root.querySelector(':scope > .mark.head');
// 		!head || !name || head.prepend(`${name} `);
// 		content.length && (slot.append(Break(), ...content), span.classList.add('object-body'));
// 	});
// 	return span;
// });

// formatter.array.item = formatter;

// export const object = (formatter.object = (item, options = formatter.defaults) => {
// 	const span = Span();
// 	span.className = 'object-span';
// 	idle(() => {
// 		// if ((hasBody = item instanceof Error)) {
// 		// 	const wrapper = document.createElement('details');
// 		// 	span.before(wrapper);
// 		// 	wrapper.appendChild(document.createElement('summary')).appendChild(span);
// 		// 	wrapper.appendChild(body);
// 		// 	console.internal.log({wrapper, span, item});
// 		// 	return;
// 		// }
// 		const name = (item.constructor || Object).name || 'Object';
// 		const text = json(item, options);
// 		const body = Span();
// 		// const body = Span({tag: 'code'});
// 		let hasBody, hasLines;
// 		if ((hasBody = item instanceof Promise)) {
// 			item.then(content => body.append(Span('‹resolved› '), formatter(content)));
// 			item.catch(reason => body.append(Span('‹rejected› '), formatter(reason)));
// 		}
// 		if (text.trim()) {
// 			hasBody = true;
// 			// hasLines = text.includes('\n');
// 			body.appendChild(Span({tag: 'code', class: 'json'}, text));
// 		}
// 		const content = hasBody ? [Indent(), body] : [];
// 		const root = span;
// 		root.append(Fragment.object());
// 		const slot = root.querySelector('slot:not([name])') || root.appendChild(Slot());
// 		const head = root.querySelector(':scope > .mark.head');
// 		!head || !name || head.prepend(`${name} `);
// 		content.length && (slot.append(...content), span.classList.add('object-body'));
// 	});
// 	return span;
// });

const json = (item, options = formatter.defaults) => {
    // const seen = new WeakSet([document.defaultView]);
    const seen = new WeakSet([]);
    const mapped = new WeakMap();
    const { mappings } = { ...(options || formatter.defaults) };

    if (mappings && mappings.has(item)) {
        return json(mappings.get(item), options);
    }

    // const getArrayLength = item => {
    //     try {
    //         return Object.getOwnPropertyDescriptor(Array.prototype, 'length').get.call(item);
    //     } catch (error) {
    //         return undefined;
    //     }
    // };

    // const TypedArray = ArrayBuffer.isView(item) && item.constructor;

    const text = JSON.stringify(
        item,
        function (key, value) {
            let body, prototype;
            switch (typeof value) {
                case 'number':
                    if (value !== value) return `<<::\0NaN\0::>>`;
                    if (value === -Infinity) return `<<::\0-Infinity\0::>>`;
                    if (value === Infinity) return `<<::\0Infinity\0::>>`;
                    return `<<::\0undefined\0::>>`;
                case 'undefined':
                    return `<<::\0undefined\0::>>`;
                case 'symbol':
                    return `<<::\0Symbol(${(value = value.description || Symbol.keyFor(value)) ? `"${value}"` : '‹private›'
                        })\0::>>`;
                case 'function':
                    if (seen.has(value)) return;
                    seen.add(value);
                    if (mappings && mappings.has(value)) return json.mapping(mappings.get(value), options);
                    // body = Function.toString.call(value).replace(/\\/g, '\\\\').replace(/(\s*\n)+\s*/g, ' ');
                    body = Function.toString.call(value)
                        .replace(/(\s*\n)+\s*/g, ' ')
                        // .replace(/\){/, ') {')
                        .replace(
                            /^((?:async |)(?:function|)(?:\*|) *)(?:\[")?(.*?)(?:"\])?( *\()/,
                            '$1$2$3',
                        );
                    if (
                        'prototype' in value &&
                        value.prototype &&
                        'constructor' in value.prototype &&
                        value.prototype.constructor
                    ) {
                        let constructorName = value?.name?.trim?.() || key;
                        let extendsClass = value.prototype && Object.getPrototypeOf(value.prototype)?.constructor || Object;
                        let extendsName = extendsClass !== Object && extendsClass?.name;
                        // let classBody = json(value.prototype);
                        // const classBody = {};
                        // try {
                        //     for (const [key, { get, set, value }] of Object.entries(getOwnPropertyDescriptors(value.protoype))) {
                        //         if (key === 'constructor') continue;
                        //         if (typeof value === 'function') {
                        //             classBody[key] = value;
                        //         }
                        //     }
                        // } catch (error) {
                        // }
                        // let classBodyJSON = json(classBody);
                        body = `class ${constructorName}${extendsName && ` extends ${extendsName}` || ''} {}`;
                    } else {
                        body = json.body.method(body, key, options);
                    }
                    // ('prototype' in value &&
                    //     value.prototype &&
                    //     'constructor' in value.prototype &&
                    //     value.prototype.constructor) ||
                    //     ();
                    return `<<::\0‹${JSON.stringify(body).slice(1, -1)}›\0::>>`;
                case 'object':
                    if (value === null) return null;
                    if (seen.has(value) || (key && value === item)) return;
                    seen.add(value);
                    if (mappings && mappings.has(value)) {
                        return json.mapping(mappings.get(value), options);
                    }
                    const isArrayLike = 'length' in value && (
                        Array.isArray(value) ||
                        ArrayBuffer.isView(item)
                    );
                    const isNamespaceLike =
                        !isArrayLike &&
                        ('constructor' in value
                            ? value.constructor && value.constructor instanceof value.constructor
                            : hasOwnProperty.call(value, Symbol.toStringTag)) &&
                        (!(prototype = getPrototypeOf(value)) ||
                            !(prototype = getPrototypeOf(prototype)) ||
                            // SEE: Safari's layering of WebAssembly
                            !(prototype = getPrototypeOf(prototype)));
                    if (isNamespaceLike) {
                        const mapped = create({ ...value });
                        const descriptors = getOwnPropertyDescriptors(value);
                        for (const property in descriptors) descriptors[property].enumerable = true;
                        defineProperties(mapped, descriptors);
                        // console.internal && console.internal.log('%o', {value, mapped});
                        return mapped;
                    }
            }
            return value;
        },
        2,
    );

    return text === '{}' && Symbol.toStringTag in item
        ? '' // `‹${item[Symbol.toStringTag]} {}›`
        : text
            ? json.body(text, options)
            : `${item}`;
    // return text ? textify.json.compact(text) : `${item}`;
};


json.mapping = (mapping, options = formatter.defaults) =>
    mapping && typeof mapping === 'object' && Symbol.toStringTag in mapping && !Object.getOwnPropertyNames(mapping).length
        ? `<<::\0‹${mapping[Symbol.toStringTag]} {}›\0::>>`
        : mapping;

json.body = (text, options = formatter.defaults) =>
    text.replace(
        /^\{(\n?\s*|)([^]*)\s*\}$/,
        (m, i, a) =>
            (i.length > 1 ? a.split(i).join('\n') : a)
                // .replace(/(\:\s*|)"<<::\\u0000([^]*?)\\u0000::>>"/g, '$1$2')
                .replace(/(^\s*)(?:(".+?"): |(?="))(?:("(?:[^\\"]+|\\.|\u0000)*")|)/gm, (m, indent, key, string) => {
                    return key || string
                        ? `${indent || ''}${key ? `${JSON.parse(key)}: ` : ''}${string ? `"${JSON.parse(string)}"` : ''}`
                        : m;
                })
                .replace(/(\:\s*|)"?<<::\u0000([^]*?)\u0000::>>"?/g, '$1$2'),
        // .replace(/\\"/g, '"')
        // .replace(/\\n/g, '\n')
        // .replace(/(\:\s*|)"<<::\\u0000([^]*?)\\u0000::>>"/g, '$1$2')
        // .replace(/"([^\s\d]\S*)"(\:\s*)/g, '$1$2'),
    );

json.body.method = (text, name, options = formatter.defaults) => text.replace(
    /^(async |)(function|)(\*|) *(.*?) *\(/,
    (m, a, f, s, n) => `${a}ƒ${s}${n === name ? ' (' : ` ${n}(`}`,
);

// json.class = (text, name, options = formatter.defaults) => text.replace(


json.compact = (text, options = formatter.defaults) =>
    text.replace(/^\{\s*([^]*)\s*\}$/, (m, a) =>
        (a.includes('\n') ? a.replace(/\s*\n(\s?)\s*/g, '$1') : a)
            .replace(/\\"/g, '"')
            .replace(/"([^\s\d]\S*)": /g, '$1: '),
    );


export const formatter = (item, options = formatter.defaults) => json(item, options);

formatter.defaults = {};

// formatter.format = (args, options = formatter.defaults) => {
//     const body = Span();
//     // options.compact === true && args.length === 1 && (args = ['%o', args]);

//     let f;
//     args.length > 1 &&
//         args[0] &&
//         typeof args[0] === 'string' &&
//         formatter.format.matcher.test(args[0]) &&
//         ([f, ...args] = args);
//     // if (!args || ) debugger;
//     formatter.format.body(body, args, options);
//     // idle(() => body.append(formatter.concat(args, options)));
//     return body;
// };

// formatter.format.body = async (body, args, options) => {
//     await idle.next();
//     body.append(formatter.concat(args, options));
// };

// formatter.defaults = {};

// formatter.format.matcher = /(?:[^\\%]|^)%(?:c|d|f|o|O|s|\d+f|\d*\.\d+f)/g;

// // formatter.concat = (...items) => Fragment.each(formatter, ...items);

// formatter.concat = (items, options) => {
//     const fragment = Fragment();
//     for (const item of items) fragment.appendChild(formatter(item, options));
//     return fragment;
// };
