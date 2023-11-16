# XS-WASM/demo

This demo includes the `wasm` module and a simple wrapper that runs in Node.js `v20.6.1`.

> **Note**: Does not work on Windows, but it likely would in WSL!

## Getting Started

The demo can be started by running `npm start` within the repository, or `node ‹path/to/repo›/demo/xsnap.js` from anywhere.

### Modes

- By default, the demo will run various examples including ones found in the original `xsnap` repository.

  Some examples will save snapshots and profiles in respectively-named subfolders. The standard output will also be captured and a sanitized log will be saved in its respectively-named subfolder at the end.

  > **Note**: For convenience during development, the snapshots and profiles subfolders get deleted at the start of each execution, while the date-prefixed log is simply overwritten.

- Alternatively, the demo replicates the native `xsnap` behaviour and can be used with modules, scripts, or string evaluation:

  > **Note**: The demo uses a sandboxed `NodeFS` interface limiting access to modules and scripts that live directly inside the `demo` folder.

### Arguments

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
