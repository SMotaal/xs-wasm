# XS-WASM/demo

This demo includes the `wasm` module and a simple wrapper that runs in Node.js `v20.6.1`.

> **Note**: Does not work on Windows, but it likely would in WSL!

To run the included examples:

- Execute `yarn start` or `npm start` inside this package.
- Execute `node ‹path/to/›xsnap.js` from anywhere.

To run something else:

- Execute `node ‹path/to/›xsnap.js` followed by any of the supported flags.

There wrapper supports the following command-line arguments similar to the native `xsnap` build:

- `-[vh]` To print the version or show the help.

- `-[mse]` To explicitly define the format as module, script, or evaluate.
  > Per `xs`'s own behaviour not specifying assumes modules for `.mjs` and scripts otherwise.

- `-[li] ‹number›` To specify metering limit or interval.
  > Use the `-q` flag to enable prefix-printing.

- `-[p] ‹profile path›` To write the profile.

- `-[rw] ‹snapshot path›` To read/write snapshots.

The following arguments are currently not working:

- `-d` Not sure what the expected behaviour is but I get obscure errors.
- `-t` Intentionally throwing in the wrapper if encountered.

When no arguments are passed the wrapper does the following:

- Sequentially executes many of the examples.
- Saves some snapshots and profiles in their respectively-named subfolders.
- Saves a moderately sanitized log in its respectively-named subfolder.

> **Note**: For convenience during development, the snapshots and profiles subfolders get deleted at the start of each execution, while the date-prefixed log is simply overwritten.

Some high-level insights based on my review of the Moddable codebase:

- It seems that both `xsanp` and `xst` stray far from `xs`'s primary use cases.
- Typically, `xs` is used along with the Moddable SDK to construct precompiled binaries from `JS` and `C` code while targetting specific devices.
- Incidentally, with `xsnap` and `xst` as edge cases, the `xs` platform itself is embedded as a conforming runtime with just-in-time loading, parsing and execution.

Some high-level insights based on my own experience with WebAssembly:

- It seems reasonable that the immediate goal would not be to target `WASI` environments.
- As of today, few `JS` environments support `WASI`, including Node.js, which leverages its synchronous `io` façade.
- At best, `WASI` provides a stable enough interface that `emscripten` and other toolchains are slowly converging at.
- It seems more reasonable to want to limit the reliance on `syscalls` and defer to the `JS`-side (ie `host`).

Some high-level insights based on my own experience with `xsnap` thus far my inclination on what would follow:

- Directly wire `xsbug-node` with the `host` and make it portable.
- Devise portable abstractions to consistently profile performance and memory usage for the `wasm` instances.
- Temporarily use `MEMFS` to gauge how well the `wasm` ports to the browser.
- Repurpose `test262` to track regressions or discrepancies between `wasm` and `native`.
- Limit the reliance on `emscripten` features and tooling while deferring to the `JS`-side.
- Finalize the `.devcontainer` and concise `README` instructions then determine where it is best to push the code.

Some aspiring goals:

- Use `xsnap` as a simulated runtime compartment or realm with a well-defined behaviour.
- Allow `xsnap` to wire to host capabilities including `WebAssembly`.
- Use `xsnap`'s wrappers to instead interact with the `host`'s literals inside `wasm`.
