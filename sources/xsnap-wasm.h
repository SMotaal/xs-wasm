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