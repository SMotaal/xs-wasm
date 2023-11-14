import {debug} from './debug.js';

debug(globalThis);

// Node.js has a problematic global "crypto" which can be disabled as follows:
//     node --no-experimental-global-webcrypto modules/debug/global-this.js
