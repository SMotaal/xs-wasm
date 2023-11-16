# XS-WASM

Proof-of-concept port of Moddable's `xs` engine to WebAssembly using `emscripten`.

**Attributions**: Special thanks to [@michaelfig] for helping with brainstorming through the experimental effort, and as well with [@kriskowal] for their mentorship. Thanks to folks at Moddable and Agoric for open-sourcing their work.

> **Note**: Issues are disabled on this repository due to my limited bandwidth to be able to assist specifically in this capacity. See [profile](https://github.com/smotaal) if you'd like to reach out otherwise.

## Getting Started

This repository serves as a starting point for the work that is necessary to port `xs` and `xsnap` to the various runtimes where WebAssembly is supported. A lot of work was invested to reduce the amount of patching which would be upstreamed to the [@Moddable-OpenSource/moddable] and [@agoric-labs/xsnap-pub] codebases, respectively, after careful due diligence.

### Demo

The `xsnap.js` demo can be started with `npm start` without any build steps.

***See***: [`demo/README.md`]

### Building

The prebuilt WebAssembly module is included in the repository and should only be rebuilt for development purposes.

The best way to build the WebAssembly module is to use the development container which automatically takes care of installing `emscripten`.

***See***: https://code.visualstudio.com/docs/devcontainers/containers

If you want to build locally, you need to update and activate `emscripten` in the `@emscripten-core/emsdk` submodule.

***See***: [@emscripten-core/emsdk] and [`package.json`] script `emsdk:update`

Finally, `emmake` the [`xsnap-emscripten.mk`] file to build the WebAssembly module.

***See***: [`package.json`] scripts `build` and `make:emscripten`

### Patching

At this point, the patched submodules may be committed locally, only.

Patching for [@agoric-labs/xsnap-pub] is not recommended due to frequent breaking changes. If you do not intend to make changes to `xsnap` itself, you can change the `SRC_DIR` variable in [`xsnap-emscripten.mk`] to point to the pre-patched [`sources`] folder directly.

***See***: [`patches/@agoric-labs`]

Updating and patching for [@Moddable-OpenSource/moddable] is a lot more straightforward. The patch simply adds missing conditional directives to prevent conflicting signatures for `fxNewHostConstructor`, `fxNewHostFunction`, and `fxNewHostInstance`.

***See***: [`patches/@Moddable-OpenSource`]

In both cases, first make sure that the respective submodule in the [`upstream`] folder is up-to-date with the specific remote branch or commit, then use `git apply` to apply the patch. Finally, verify that the updates and patches are working as expected by running `npm build` and `npm start`.

***See***: [`package.json`] scripts `upstream:update` and `patch:apply`.

## Future Work

- Directly wire `xsbug-node` with the `host` and make it portable.
- Devise portable abstractions to consistently profile performance and memory usage for the `wasm` instances.
- Temporarily use `MEMFS` to gauge how well the `wasm` ports to the browser.
- Repurpose `test262` to track regressions or discrepancies between `wasm` and `native`.
- Limit the reliance on `emscripten` features and tooling while deferring to the `JS`-side.

---

<details><summary>Licensed under the Apache License, Version 2.0</summary>

```
   Copyright 2023 Saleh Abdel Motaal

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

</details>

---

**Responsible Disclosure**: This repository is for demonstration purposes only, please consult the documentation and licences for the included third-party submodules.

[@Moddable-OpenSource/moddable]: https://github.com/Moddable-OpenSource/moddable
[@agoric-labs/xsnap-pub]: https://github.com/agoric-labs/xsnap-pub
[@emscripten-core/emsdk]: https://github.com/emscripten-core/emsdk
[`xsnap-emscripten.mk`]: makefiles/wasm/xsnap-emscripten.mk
[`demo/README.md`]: demo/README.md
[`sources`]: sources/
[`upstream`]: upstream/
[`patches/@agoric-labs`]: patches/@agoric-labs
[`patches/@Moddable-OpenSource`]: patches/@Moddable-OpenSource
[`package.json`]: package.json
[@michaelfig]: https://github.com/michaelfig
[@kriskowal]: https://github.com/kriskowal
