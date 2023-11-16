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

#ifndef __XSNAP_WASM_H__
#define __XSNAP_WASM_H__

#include <stdint.h>

typedef uint32_t u32;

#define wasmImport(name, module) __attribute__((import_module(#module), import_name(#name)))
#define wasmExport(name) __attribute__((visibility("default"), used, export_name(#name)))

enum TEST_RESULT {
    TEST_RESULT_UNDEFINED = -1,
    TEST_RESULT_SUCCESS = 0,
    TEST_RESULT_FAILURE = 1,
};

#endif  // __XSNAP_WASM_H__