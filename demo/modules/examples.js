//    Copyright 2023 Saleh Abdel Motaal
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

export default {
    'xsnap-examples-helloworld': {
        scope: '../xsnap-examples/helloworld',
        fallback: null,
        commands: [['../xsnap-examples/helloworld/before.js', '../xsnap-examples/helloworld/after.js']],
    },
    'xsnap-examples-helloworld (snapshot)': {
        scope: '../xsnap-examples/helloworld',
        fallback: 'xsnap-examples-helloworld',
        snapshots: ['snapshots/xsnap-examples-helloworld-before.xsm'],
        commands: [
            ['../xsnap-examples/helloworld/before.js', '-w', 'snapshots/xsnap-examples-helloworld-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-helloworld-before.xsm', '../xsnap-examples/helloworld/after.js'],
        ],
    },
    'xsnap-examples-metering': {
        scope: '../xsnap-examples/metering',
        fallback: null,
        commands: [['../xsnap-examples/metering/test.js']]
    },
    'xsnap-examples-metering (limit)': {
        scope: '../xsnap-examples/metering',
        fallback: 'xsnap-examples-metering',
        metering: 10000,
        commands: [['../xsnap-examples/metering/test.js', '-l', 10000]]
    },
    'xsnap-examples-metering (limit interval)': {
        scope: '../xsnap-examples/metering',
        fallback: 'xsnap-examples-metering',
        meteringLimit: 10000,
        meteringInterval: 1000,
        commands: [['../xsnap-examples/metering/test.js', '-l', 10000, '-i', 1000]]
    },
    'xsnap-examples-metering-built-ins': {
        scope: '../xsnap-examples/metering-built-ins',
        fallback: null,
        commands: [['../xsnap-examples/metering-built-ins/test.js']]
    },
    'xsnap-examples-metering-built-ins (print)': {
        scope: '../xsnap-examples/metering-built-ins',
        fallback: 'xsnap-examples-metering-built-ins',
        meteringPrint: true,
        commands: [['../xsnap-examples/metering-built-ins/test.js', '-q']]
    },
    'xsnap-examples-generators': {
        scope: '../xsnap-examples/generators',
        fallback: null,
        commands: [['../xsnap-examples/generators/before.js', '../xsnap-examples/generators/after.js']],
    },
    'xsnap-examples-generators (snapshot)': {
        scope: '../xsnap-examples/generators',
        fallback: 'xsnap-examples-generators',
        snapshots: ['snapshots/xsnap-examples-generators-before.xsm'],
        commands: [
            ['../xsnap-examples/generators/before.js', '-w', 'snapshots/xsnap-examples-generators-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-generators-before.xsm', '../xsnap-examples/generators/after.js'],
        ],
    },
    'xsnap-examples-weaks': {
        scope: '../xsnap-examples/weaks',
        fallback: null,
        commands: [['../xsnap-examples/weaks/before.js', '../xsnap-examples/weaks/after.js']],
    },
    'xsnap-examples-weaks (snapshot)': {
        scope: '../xsnap-examples/weaks',
        fallback: 'xsnap-examples-weaks',
        snapshot: ['snapshots/xsnap-examples-weaks-before.xsm'],
        commands: [
            ['../xsnap-examples/weaks/before.js', '-w', 'snapshots/xsnap-examples-weaks-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-weaks-before.xsm', '../xsnap-examples/weaks/after.js'],
        ],
    },
    'xsnap-examples-values': {
        scope: '../xsnap-examples/values',
        fallback: null,
        commands: [['../xsnap-examples/values/before.js', '../xsnap-examples/values/after.js']],
    },
    'xsnap-examples-values (snapshot)': {
        scope: '../xsnap-examples/values',
        fallback: 'xsnap-examples-values',
        snapshots: ['snapshots/xsnap-examples-values-before.xsm'],
        commands: [
            ['../xsnap-examples/values/before.js', '-w', 'snapshots/xsnap-examples-values-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-values-before.xsm', '../xsnap-examples/values/after.js'],
        ],
    },
    'xsnap-examples-proxy': {
        scope: '../xsnap-examples/proxy',
        fallback: null,
        commands: [['../xsnap-examples/proxy/before.js', '../xsnap-examples/proxy/after.js']],
    },
    'xsnap-examples-proxy (snapshot)': {
        scope: '../xsnap-examples/proxy',
        fallback: 'xsnap-examples-proxy',
        snapshots: ['snapshots/xsnap-examples-proxy-before.xsm'],
        commands: [
            ['../xsnap-examples/proxy/before.js', '-w', 'snapshots/xsnap-examples-proxy-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-proxy-before.xsm', '../xsnap-examples/proxy/after.js'],
        ],
    },
    'xsnap-examples-promises': {
        scope: '../xsnap-examples/promises',
        fallback: null,
        commands: [['../xsnap-examples/promises/before.js', '../xsnap-examples/promises/after.js']],
    },
    'xsnap-examples-promises (snapshot)': {
        scope: '../xsnap-examples/promises',
        fallback: 'xsnap-examples-promises',
        snapshots: ['snapshots/xsnap-examples-promises-before.xsm'],
        commands: [
            ['../xsnap-examples/promises/before.js', '-w', 'snapshots/xsnap-examples-promises-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-promises-before.xsm', '../xsnap-examples/promises/after.js'],
        ],
    },
    'xsnap-examples-modules': {
        scope: '../xsnap-examples/modules',
        fallback: null,
        commands: [['-m', '../xsnap-examples/modules/before.js', '../xsnap-examples/modules/increment.js', '../xsnap-examples/modules/after.js']],
    },
    'xsnap-examples-modules (snapshot)': {
        scope: '../xsnap-examples/modules',
        fallback: 'xsnap-examples-modules',
        snapshots: ['snapshots/xsnap-examples-modules-before.xsm', 'snapshots/xsnap-examples-modules-increment.xsm'],
        commands: [
            ['-m', '../xsnap-examples/modules/before.js', '-w', 'snapshots/xsnap-examples-modules-before.xsm'],
            ['-r', 'snapshots/xsnap-examples-modules-before.xsm', '-m', '../xsnap-examples/modules/increment.js', '-w', 'snapshots/xsnap-examples-modules-increment.xsm'],
            ['-r', 'snapshots/xsnap-examples-modules-increment.xsm', '-m', '../xsnap-examples/modules/after.js'],
        ],
    },
    'xsnap-examples-compartments': {
        scope: '../xsnap-examples/compartments',
        fallback: null,
        commands: [
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/bindings.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/endowments.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/meta.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/module-namespace.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/moduleMap-fixture.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/moduleMap-namespaces.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/moduleMap-records.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/moduleMap-specifiers.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-globalLexicals.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-loadHook.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-loadNowHook.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-moduleMapHook-namespaces.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-moduleMapHook-records.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-moduleMapHook-specifiers.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/options-resolveHook.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/prototype-evaluate.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/prototype-globalThis.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/prototype-import.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/prototype-module.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/redirect.js', '../xsnap-examples/compartments/after.js'],
            // ['-s', '../xsnap-examples/compartments/before.js', '../xsnap-examples/compartments/third-party.js', '../xsnap-examples/compartments/after.js'],
        ]
    },
};