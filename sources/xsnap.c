#include "xsnap.h"

#include <stdarg.h>  // va_list, va_start(), va_end(), vfprintf()
#include <stdio.h>   // fprintf(), fdopen(), fclose(), stderr
#include <string.h>  // strlen()

#define SNAPSHOT_SIGNATURE "xsnap 1"

extern void fxDumpSnapshot(xsMachine* the, xsSnapshot* snapshot);

static void xsBuildAgent(xsMachine* the);
static void xsPrintUsage();
static void xsReplay(xsMachine* machine);

//static void xs_clearTimer(xsMachine* the);
static void xs_currentMeterLimit(xsMachine* the);
static void xs_gc(xsMachine* the);
static void xs_issueCommand(xsMachine* the);
static void xs_lockdown(xsMachine *the);
static void xs_performance_now(xsMachine* the);
static void xs_print(xsMachine* the);
static void xs_resetMeter(xsMachine* the);
static void xs_setImmediate(xsMachine* the);
//static void xs_setInterval(xsMachine* the);
//static void xs_setTimeout(xsMachine* the);

extern void xs_textdecoder(xsMachine *the);
extern void xs_textdecoder_decode(xsMachine *the);
extern void xs_textdecoder_get_encoding(xsMachine *the);
extern void xs_textdecoder_get_ignoreBOM(xsMachine *the);
extern void xs_textdecoder_get_fatal(xsMachine *the);

extern void xs_textencoder(xsMachine *the);
extern void xs_textencoder_encode(xsMachine *the);
extern void xs_textencoder_encodeInto(xsMachine *the);

extern void modInstallTextDecoder(xsMachine *the);
extern void modInstallTextEncoder(xsMachine *the);

extern void xs_base64_encode(xsMachine *the);
extern void xs_base64_decode(xsMachine *the);
extern void modInstallBase64(xsMachine *the);

// The order of the callbacks materially affects how they are introduced to
// code that runs from a snapshot, so must be consistent in the face of
// upgrade.
#define mxSnapshotCallbackCount 18
xsCallback gxSnapshotCallbacks[mxSnapshotCallbackCount] = {
	xs_issueCommand, // 0
	xs_print, // 1
	xs_setImmediate, // 2
	xs_gc, // 3
	xs_performance_now, // 4
	xs_currentMeterLimit, // 5
	xs_resetMeter, // 6

	xs_textdecoder, // 7
	xs_textdecoder_decode, // 8
	xs_textdecoder_get_encoding, // 9
	xs_textdecoder_get_ignoreBOM, // 10
	xs_textdecoder_get_fatal, // 11

	xs_textencoder, // 12
	xs_textencoder_encode, // 13
	xs_textencoder_encodeInto, // 14

	xs_base64_encode, // 15
	xs_base64_decode, // 16

	fx_harden, // 17
	// fx_setInterval,
	// fx_setTimeout,
	// fx_clearTimer,
};

static int xsSnapshopRead(void* stream, void* address, size_t size)
{
	return (fread(address, size, 1, stream) == 1) ? 0 : errno;
}

static int xsSnapshopWrite(void* stream, void* address, size_t size)
{
	return (fwrite(address, size, 1, stream) == 1) ? 0 : errno;
}
	
static xsUnsignedValue gxCurrentMeter = 0;
static xsBooleanValue gxMeteringPrint = 0;
static xsUnsignedValue gxMeteringLimit = 0;
#ifdef mxMetering
static xsBooleanValue xsMeteringCallback(xsMachine* the, xsUnsignedValue index)
{
	if (index > gxMeteringLimit) {
// 		fprintf(stderr, "too much computation\n");
		return 0;
	}
// 	fprintf(stderr, "%d\n", index);
	return 1;
}
#endif  // mxMetering

#if structDump & __has_builtin(__builtin_dump_struct)
static int __debug_printf(const char* format, ...) {
    va_list argumentList;
    va_start(argumentList, format);
    int result = vfprintf(stderr, format, argumentList);
    va_end(argumentList);
    return result;
}
#define dump_struct(identifier) \
    __builtin_dump_struct(identifier, &__debug_printf);
#define dump_struct_with_context(identifier, context) \
    fprintf(stderr, "\n%s\n", context);               \
    __builtin_dump_struct(identifier, &__debug_printf);
#else  // structDump
#define dump_struct(identifier) ;
#define dump_struct_with_context(identifier, context) ;
#endif  // structDump

#ifdef __wasm__

#include <emscripten.h>
#include <wasi/api.h>

#include "xsnap-wasm.h"

// #if wasmFDTests

// #endif  // wasmFDTests

/// SEE:
/// - callbacks:
///     - https://stackoverflow.com/a/45425578
///     - https://stackoverflow.com/questions/65469910/emscripten-passing-callback-from-c-runtime-getfuncwrapper-runtime-is-not-def
///     - https://gist.github.com/aknuds1/533f7b228aa46e9ee4c8

#endif

typedef struct xsnapArguments {
    int argc;
    char** argv;
    int argd;
    int argp;
    int argr;
    int argw;
    int option;
    int interval;
    int profiling;
    int meteringLimit;
    int meteringPrint;
} xsnapArguments;

typedef struct xsnapRuntime {
    xsSnapshot* snapshot;
    xsCreation* creation;
    xsMachine* machine;
} xsnapRuntime;

static xsCreation __global__xsnap_creation__;
static xsSnapshot __global__xsnap_snapshot__;
static xsnapRuntime* __global__xsnap_runtime__pointer__;

int xsnapInitalizeCreation(xsCreation* creation) {
    if (creation->stackCount == 0) {
        creation->initialChunkSize = 32 * 1024 * 1024;
        creation->incrementalChunkSize = 4 * 1024 * 1024;
        creation->initialHeapCount = 256 * 1024;
        creation->incrementalHeapCount = 128 * 1024;
        creation->stackCount = 4096;
        creation->initialKeyCount = 32000;
        creation->incrementalKeyCount = 8000;
        creation->nameModulo = 1993;
        creation->symbolModulo = 127;
        creation->parserBufferSize = 8192 * 1024;
        creation->parserTableModulo = 1993;
    }
    return 0;
}

int xsnapInitalizeSnapshot(xsSnapshot* snapshot) {
    if (snapshot->signatureLength == 0) {
        snapshot->signature = SNAPSHOT_SIGNATURE;
        snapshot->signatureLength = sizeof(SNAPSHOT_SIGNATURE) - 1;
        snapshot->callbacks = gxSnapshotCallbacks;
        snapshot->callbacksLength = mxSnapshotCallbackCount;
        snapshot->read = xsSnapshopRead;
        snapshot->write = xsSnapshopWrite;
        snapshot->stream = NULL;
        snapshot->error = 0;
        snapshot->firstChunk = NULL;
        snapshot->firstProjection = NULL;
        snapshot->firstSlot = NULL;
        snapshot->slotSize = 0;
        snapshot->slots = NULL;
    }
    return 0;
}

int xsnapDumpSnapshot(xsMachine* machine, xsSnapshot* snapshot, char* path) {
    snapshot->stream = fopen(path, "rb");
    if (snapshot->stream) {
        fxDumpSnapshot(machine, snapshot);
        fclose(snapshot->stream);
    } else {
        snapshot->error = errno;
    }
    if (snapshot->error) {
        fprintf(stderr, "cannot dump snapshot %s: %s\n", path, strerror(snapshot->error));
        return 1;
    }
    return 0;
}

int xsnapPrintVersion() {
    char buffer[256];
    xsVersion(buffer, sizeof(buffer));
    printf("XS %s\n", buffer);
    return 0;
}

int xsnapPrintUsage() {
    xsPrintUsage();
    return 0;
}

xsMachine* xsnapCreateMachine(xsnapArguments* arguments, xsSnapshot* snapshot, xsCreation* creation) {
    xsMachine* machine = NULL;

    // dump_struct_with_context(machine, "Before xsnapCreateMachine...");

    if (arguments->argr) {
        snapshot->stream = fopen(arguments->argv[arguments->argr], "rb");
        if (snapshot->stream) {
            machine = xsReadSnapshot(snapshot, "xsnap", NULL);
            fclose(snapshot->stream);
        } else
            snapshot->error = errno;
        if (snapshot->error) {
            fprintf(stderr, "cannot read snapshot %s: %s\n", arguments->argv[arguments->argr], strerror(snapshot->error));
            return machine;
        }
    } else {
        machine = xsCreateMachine(creation, "xsnap", NULL);
        xsBuildAgent(machine);
    }

    if (arguments->profiling) fxStartProfiling(machine);

    // dump_struct_with_context(machine, "After xsnapCreateMachine...");

    return machine;
}

int xsnapTeardownMachine(xsnapArguments* arguments, xsMachine* machine) {
    int error = 0;

    // dump_struct_with_context(machine, "Before xsnapTeardownMachine...");

    if (arguments->profiling) {
        if (arguments->argp) {
            FILE* stream = fopen(arguments->argv[arguments->argp], "w");
            if (stream)
                fxStopProfiling(machine, stream);
            else
                fprintf(stderr, "cannot write profile %s: %s\n", arguments->argv[arguments->argp], strerror(errno));
        } else {
            fxStopProfiling(machine, C_NULL);
        }
    }

    if (machine->abortStatus) error = machine->abortStatus;

    xsDeleteMachine(machine);

    // dump_struct_with_context(machine, "After xsnapTeardownMachine...");

    return error;
}

int xsnapRunCommand(xsnapArguments* arguments, xsMachine* machine, xsSnapshot* snapshot) {
    int argi;
    char path[C_PATH_MAX];
    char* dot;

    // dump_struct_with_context(machine, "Before xsnapRunCommand...");
    xsBeginHost(machine);
    {
        xsVars(1);
        for (argi = 1; argi < arguments->argc; argi++) {
            if (!strcmp(arguments->argv[argi], "-i")) {
                argi++;
                continue;
            }
            if (!strcmp(arguments->argv[argi], "-l")) {
                argi++;
                continue;
            }
            if (arguments->argv[argi][0] == '-')
                continue;
            if (argi == arguments->argp)
                continue;
            if (argi == arguments->argr)
                continue;
            if (argi == arguments->argw)
                continue;
            if (arguments->option == 1) {
                // dump_struct_with_context(machine, "Before Eval...");
                xsResult = xsString(arguments->argv[argi]);
                xsCall1(xsGlobal, xsID("eval"), xsResult);
                // dump_struct_with_context(machine, "After Eval...");
            } else {
                if (!c_realpath(arguments->argv[argi], path))
                    xsURIError("file not found: %s", arguments->argv[argi]);
                dot = strrchr(path, '.');
                if (((arguments->option == 0) && dot && !c_strcmp(dot, ".mjs")) || (arguments->option == 2))
                    xsRunModuleFile(path);
                else
                    xsRunProgramFile(path);
            }
        }
    }
    xsRunLoop(machine);
    // dump_struct_with_context(machine, "After RunLoop...");
    xsEndHost(machine);
    // dump_struct_with_context(machine, "After EndHost...");
    if (arguments->argw) {
        snapshot->stream = fopen(arguments->argv[arguments->argw], "wb");
        if (snapshot->stream) {
            xsWriteSnapshot(machine, snapshot);
            fclose(snapshot->stream);
        } else
            snapshot->error = errno;
        if (snapshot->error) {
            fprintf(stderr, "cannot write snapshot %s: %s\n", arguments->argv[arguments->argw], strerror(snapshot->error));
        }
    }

    // dump_struct_with_context(machine, "After xsnapRunCommand...");
    return 0;
}

int xsnapInitializeSharedRuntime(xsnapRuntime* runtime) {
    if (__global__xsnap_runtime__pointer__) {
        fprintf(stderr, "cannot initialize shared runtime: already initialized\n");
        return 1;
    } else {
        xsInitializeSharedCluster();
        xsnapInitalizeCreation(runtime->creation);
        xsnapInitalizeSnapshot(runtime->snapshot);
        __global__xsnap_runtime__pointer__ = runtime;
        return 0;
    }
}

int xsnapTerminateSharedRuntime(xsnapRuntime* runtime) {
    if (runtime == NULL) {
        fprintf(stderr, "cannot terminate shared runtime: not initialized\n");
        return 1;
    } else if (__global__xsnap_runtime__pointer__ != runtime) {
        fprintf(stderr, "cannot terminate shared runtime: not the same runtime\n");
        return 1;
    } else {
        xsTerminateSharedCluster();
        __global__xsnap_runtime__pointer__ = NULL;
        return 0;
    }
}

#ifdef __wasm__

// wasmExport(runScript)

#endif

int main(int argc, char* argv[]) {
    xsnapArguments arguments = {argc, argv, 0, 0, 0, 0, 0, 0, 0, 0, 0};

    {
        int argi;

        for (argi = 1; argi < argc; argi++) {
            if (argv[argi][0] != '-') {
                continue;
            } else if (!strcmp(argv[argi], "-d")) {
                argi++;
                if (argi < argc)
                    arguments.argd = argi;
                else
                    return xsnapPrintUsage(), 1;
                arguments.option = 5;
            } else if (!strcmp(argv[argi], "-e")) {
                arguments.option = 1;
            } else if (!strcmp(argv[argi], "-h")) {
                xsPrintUsage();
            } else if (!strcmp(argv[argi], "-i")) {
                argi++;
                if (argi < argc)
                    arguments.interval = atoi(argv[argi]);
                else
                    return xsnapPrintUsage(), 1;
            } else if (!strcmp(argv[argi], "-l")) {
                argi++;
                if (argi < argc)
                    arguments.meteringLimit = atoi(argv[argi]);
                else
                    return xsnapPrintUsage(), 1;
            } else if (!strcmp(argv[argi], "-m")) {
                arguments.option = 2;
            } else if (!strcmp(argv[argi], "-p")) {
                arguments.profiling = 1;
                argi++;
                if ((argi < argc) && (argv[argi][0] != '-'))
                    arguments.argp = argi;
                else
                    argi--;
            } else if (!strcmp(argv[argi], "-q")) {
                arguments.meteringPrint = 1;
            } else if (!strcmp(argv[argi], "-r")) {
                argi++;
                if (argi < argc)
                    arguments.argr = argi;
                else
                    return xsnapPrintUsage(), 1;
            } else if (!strcmp(argv[argi], "-s")) {
                arguments.option = 3;
            } else if (!strcmp(argv[argi], "-t")) {
                arguments.option = 4;
            } else if (!strcmp(argv[argi], "-v")) {
                if (xsnapPrintVersion()) return 1;
            } else if (!strcmp(argv[argi], "-w")) {
                argi++;
                if (argi < argc)
                    arguments.argw = argi;
                else
                    return xsnapPrintUsage(), 1;
            } else {
                return xsnapPrintUsage(), 1;
            }
        }

        if (arguments.meteringLimit)
            if (arguments.interval == 0) arguments.interval = 1;
    }

    gxMeteringLimit = (xsUnsignedValue)arguments.meteringLimit;
    gxMeteringPrint = (xsBooleanValue)arguments.meteringPrint;

    xsnapRuntime runtime = {&__global__xsnap_snapshot__, &__global__xsnap_creation__, NULL};

    if (xsnapInitializeSharedRuntime(&runtime)) {
        fprintf(stderr, "cannot initialize shared runtime\n");
        return 1;
    } else {
        int error = 0;

        runtime.machine = xsnapCreateMachine(&arguments, runtime.snapshot, runtime.creation);

        if (runtime.machine == NULL) {
            error = 1;
            fprintf(stderr, "cannot create machine\n");
        } else {
            xsBeginMetering(runtime.machine, xsMeteringCallback, arguments.interval);
            if (arguments.option == 5) {
                if (xsnapDumpSnapshot(runtime.machine, runtime.snapshot, arguments.argv[arguments.argd])) return 1;
            } else if (arguments.option == 4) {
                fprintf(stderr, "%p\n", runtime.machine);
                xsReplay(runtime.machine);
            } else {
                if (xsnapRunCommand(&arguments, runtime.machine, runtime.snapshot)) return error = 1;
            }
            xsEndMetering(runtime.machine);
            error = xsnapTeardownMachine(&arguments, runtime.machine);
        }

        if (xsnapTerminateSharedRuntime(&runtime)) {
            error = 1;
            fprintf(stderr, "cannot terminate shared runtime\n");
        }

        return error;
    }
}

void xsBuildAgent(xsMachine* machine) 
{
	xsBeginHost(machine);
	xsVars(1);
	
// 	xsResult = xsNewHostFunction(xs_clearTimer, 1);
// 	xsDefine(xsGlobal, xsID("clearImmediate"), xsResult, xsDontEnum);
	xsResult = xsNewHostFunction(xs_setImmediate, 1);
	xsDefine(xsGlobal, xsID("setImmediate"), xsResult, xsDontEnum);
	
// 	xsResult = xsNewHostFunction(xs_clearTimer, 1);
// 	xsDefine(xsGlobal, xsID("clearInterval"), xsResult, xsDontEnum);
// 	xsResult = xsNewHostFunction(xs_setInterval, 1);
// 	xsDefine(xsGlobal, xsID("setInterval"), xsResult, xsDontEnum);

// 	xsResult = xsNewHostFunction(xs_clearTimer, 1);
// 	xsDefine(xsGlobal, xsID("clearTimeout"), xsResult, xsDontEnum);
// 	xsResult = xsNewHostFunction(xs_setTimeout, 1);
// 	xsDefine(xsGlobal, xsID("setTimeout"), xsResult, xsDontEnum);
	
	xsResult = xsNewHostFunction(xs_gc, 1);
	xsDefine(xsGlobal, xsID("gc"), xsResult, xsDontEnum);
	xsResult = xsNewHostFunction(xs_print, 1);
	xsDefine(xsGlobal, xsID("print"), xsResult, xsDontEnum);
	
	xsResult = xsNewHostFunction(xs_issueCommand, 1);
	xsDefine(xsGlobal, xsID("issueCommand"), xsResult, xsDontEnum);
	
	xsResult = xsNewObject();
	xsVar(0) = xsNewHostFunction(xs_performance_now, 0);
	xsDefine(xsResult, xsID("now"), xsVar(0), xsDontEnum);
	xsDefine(xsGlobal, xsID("performance"), xsResult, xsDontEnum);
	
	xsResult = xsNewHostFunction(xs_currentMeterLimit, 1);
	xsDefine(xsGlobal, xsID("currentMeterLimit"), xsResult, xsDontEnum);
	xsResult = xsNewHostFunction(xs_resetMeter, 1);
	xsDefine(xsGlobal, xsID("resetMeter"), xsResult, xsDontEnum);

	modInstallTextDecoder(the);
	modInstallTextEncoder(the);
	modInstallBase64(the);
// 	
 	xsResult = xsNewHostFunction(fx_harden, 1);
 	xsDefine(xsGlobal, xsID("harden"), xsResult, xsDontEnum);
// 	xsResult = xsNewHostFunction(xs_lockdown, 0);
// 	xsDefine(xsGlobal, xsID("lockdown"), xsResult, xsDontEnum);
// 	xsResult = xsNewHostFunction(fx_petrify, 1);
// 	xsDefine(xsGlobal, xsID("petrify"), xsResult, xsDontEnum);
// 	xsResult = xsNewHostFunction(fx_mutabilities, 1);
// 	xsDefine(xsGlobal, xsID("mutabilities"), xsResult, xsDontEnum);

	xsEndHost(machine);
}

void xsPrintUsage()
{
	printf("xsnap [-h] [-e] [i <interval] [l <limit] [-m] [-r <snapshot>] [-s] [-v] [-w <snapshot>] strings...\n");
	printf("\t-d <snapshot>: dump snapshot to stderr\n");
	printf("\t-e: eval strings\n");
	printf("\t-h: print this help message\n");
	printf("\t-i <interval>: metering interval (default to 1)\n");
	printf("\t-l <limit>: metering limit (default to none)\n");
	printf("\t-m: strings are paths to modules\n");
	printf("\t-r <snapshot>: read snapshot to create the XS machine\n");
	printf("\t-s: strings are paths to scripts\n");
	printf("\t-v: print XS version\n");
	printf("\t-w <snapshot>: write snapshot of the XS machine at exit\n");
	printf("without -e, -m, -s:\n");
	printf("\tif the extension is .mjs, strings are paths to modules\n");
	printf("\telse strings are paths to scripts\n");
}

static int gxStep = 0;

void xsReplay(xsMachine* machine)
{
	char path[C_PATH_MAX];
	char* names[6] = { "-evaluate.dat", "-issueCommand.dat", "-snapshot.dat", "-command.dat", "-reply.dat", "-options.json", };
	for (;;) {
		int which;
		for (which = 0; which < 6; which++) {
			sprintf(path, "%05d%s", gxStep, names[which]);
			{
			#if mxWindows
				DWORD attributes = GetFileAttributes(path);
				if ((attributes != 0xFFFFFFFF) && (!(attributes & FILE_ATTRIBUTE_DIRECTORY)))
			#else
				struct stat a_stat;
				if ((stat(path, &a_stat) == 0) && (S_ISREG(a_stat.st_mode)))
			#endif
				{
					gxStep++;
					fprintf(stderr, "### %s\n", path);
					FILE* file = fopen(path, "rb");
					if (file) {
						size_t length;
						fseek(file, 0, SEEK_END);
						length = ftell(file);
						fseek(file, 0, SEEK_SET);
						if (which == 0) {
							xsBeginHost(machine);
							xsStringValue string;
							xsResult = xsStringBuffer(NULL, (xsIntegerValue)length);
							string = xsToString(xsResult);
							length = fread(string, 1, length, file);
							string[length] = 0;
							fclose(file);
							xsCall1(xsGlobal, xsID("eval"), xsResult);
							fxRunLoop(machine);
							xsEndHost(machine);
						}
						else if (which == 1) {
							xsBeginHost(machine);
							xsResult = xsArrayBuffer(NULL, (xsIntegerValue)length);
							length = fread(xsToArrayBuffer(xsResult), 1, length, file);	
							fclose(file);
							xsCall1(xsGlobal, xsID("handleCommand"), xsResult);
							fxRunLoop(machine);
							xsEndHost(machine);
						}
						else if (which == 2) {
// 							xsBeginHost(machine);
// 							xsCollectGarbage();
// 							xsEndHost(machine);
// 							fclose(file);
							char buffer[1024];
							char* slash;
							xsSnapshot snapshot = {
								SNAPSHOT_SIGNATURE,
								sizeof(SNAPSHOT_SIGNATURE) - 1,
								gxSnapshotCallbacks,
								mxSnapshotCallbackCount,
								xsSnapshopRead,
								xsSnapshopWrite,
								NULL,
								0,
								NULL,
								NULL,
								NULL,
								0,
								NULL
							};
							length = fread(buffer, 1, length, file);
							buffer[length] = 0;
							fclose(file);
							slash = c_strrchr(buffer, '/');
							if (slash) slash++;
							else slash = buffer;
							snapshot.stream = fopen(slash, "wb");
							if (snapshot.stream) {
								xsWriteSnapshot(machine, &snapshot);
								fclose(snapshot.stream);
							}
						}
						else
							fclose(file);
					}
					break;
				}
			}
		}
		if (which == 6)
			break;
	}
}

void xs_clearTimer(xsMachine* the)
{
	xsClearTimer();
}

void xs_currentMeterLimit(xsMachine* the)
{
#if mxMetering
	xsResult = xsInteger(gxCurrentMeter);
#endif
}

void xs_gc(xsMachine* the)
{
	fprintf(stderr, "gc()\n");
	xsCollectGarbage();
}

void xs_issueCommand(xsMachine* the)
{
	char path[C_PATH_MAX];
	FILE* file;
	size_t length;
	void* data;
	size_t argLength;
	void* argData;
	
	sprintf(path, "%05d-command.dat", gxStep);
	gxStep++;
	
	file = fopen(path, "rb");
	if (!file) xsUnknownError("cannot open %s", path);
	fseek(file, 0, SEEK_END);
	length = ftell(file);
	fseek(file, 0, SEEK_SET);
	data = c_malloc(length);
	length = fread(data, 1, length, file);	
	fclose(file);
	
	argLength = xsGetArrayBufferLength(xsArg(0));
	argData = xsToArrayBuffer(xsArg(0));
	
	if ((length != argLength) || c_memcmp(data, argData, length)) {
		fprintf(stderr, "### %s %.*s\n", path, (int)argLength, (char*)argData);
// 		fprintf(stderr, "@@@ %s %.*s\n", path, (int)length, (char*)data);
	}
	else
		fprintf(stderr, "### %s\n", path);
	c_free(data);
	
	sprintf(path, "%05d-reply.dat", gxStep);
	fprintf(stderr, "### %s\n", path);
	gxStep++;
	file = fopen(path, "rb");
	if (!file) xsUnknownError("cannot open %s", path);
	fseek(file, 0, SEEK_END);
	length = ftell(file);
	fseek(file, 0, SEEK_SET);
	xsResult = xsArrayBuffer(NULL, (xsIntegerValue)length);
	data = xsToArrayBuffer(xsResult);
	length = fread(data, 1, length, file);	
	fclose(file);
}

void xs_lockdown(xsMachine *the)
{
	fx_lockdown(the);
	
	xsResult = xsGet(xsGlobal, xsID("Base64"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("TextDecoder"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("TextEncoder"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	
// 	xsResult = xsGet(xsGlobal, xsID("clearImmediate"));
// 	xsCall1(xsGlobal, xsID("harden"), xsResult);
// 	xsResult = xsGet(xsGlobal, xsID("clearInterval"));
// 	xsCall1(xsGlobal, xsID("harden"), xsResult);
// 	xsResult = xsGet(xsGlobal, xsID("clearTimeout"));
// 	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("currentMeterLimit"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("gc"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("harden"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("issueCommand"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("lockdown"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("mutabilities"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("performance"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("petrify"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("print"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("resetMeter"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
	xsResult = xsGet(xsGlobal, xsID("setImmediate"));
	xsCall1(xsGlobal, xsID("harden"), xsResult);
// 	xsResult = xsGet(xsGlobal, xsID("setInterval"));
// 	xsCall1(xsGlobal, xsID("harden"), xsResult);
// 	xsResult = xsGet(xsGlobal, xsID("setTimeout"));
// 	xsCall1(xsGlobal, xsID("harden"), xsResult);
}

void xs_performance_now(xsMachine *the)
{
	c_timeval tv;
	c_gettimeofday(&tv, NULL);
	xsResult = xsNumber((double)(tv.tv_sec * 1000.0) + ((double)(tv.tv_usec) / 1000.0));
}

void xs_print(xsMachine* the)
{
	xsIntegerValue c = xsToInteger(xsArgc), i;
	xsStringValue string, p, q;
	xsVars(1);
	xsVar(0) = xsGet(xsGlobal, xsID("String"));
	for (i = 0; i < c; i++) {
		xsArg(i) = xsCallFunction1(xsVar(0), xsUndefined, xsArg(i));
	}
#ifdef mxMetering
	if (gxMeteringPrint)
		fprintf(stdout, "[%u] ", xsGetCurrentMeter(the));
#endif
	for (i = 0; i < c; i++) {
		if (i)
			fprintf(stdout, " ");
		xsArg(i) = xsCallFunction1(xsVar(0), xsUndefined, xsArg(i));
		p = string = xsToString(xsArg(i));
	#if mxCESU8
		for (;;) {
			xsIntegerValue character;
			q = fxUTF8Decode(p, &character);
		again:
			if (character == C_EOF)
				break;
			if (character == 0) {
				if (p > string) {
					char c = *p;
					*p = 0;
					fprintf(stdout, "%s", string);
					*p = c;
				}
				string = q;
			}
			else if ((0x0000D800 <= character) && (character <= 0x0000DBFF)) {
				xsStringValue r = q;
				xsIntegerValue surrogate;
				q = fxUTF8Decode(r, &surrogate);
				if ((0x0000DC00 <= surrogate) && (surrogate <= 0x0000DFFF)) {
					char buffer[5];
					character = (xsIntegerValue)(0x00010000 + ((character & 0x03FF) << 10) + (surrogate & 0x03FF));
					if (p > string) {
						char c = *p;
						*p = 0;
						fprintf(stdout, "%s", string);
						*p = c;
					}
					p = fxUTF8Encode(buffer, character);
					*p = 0;
					fprintf(stdout, "%s", buffer);
					string = q;
				}
				else {
					p = r;
					character = surrogate;
					goto again;
				}
			}
			p = q;
		}
	#endif	
		fprintf(stdout, "%s", string);
	}
	fprintf(stdout, "\n");
}

void xs_resetMeter(xsMachine* the)
{
#if mxMetering
	xsIntegerValue argc = xsToInteger(xsArgc);
	if (argc < 2) {
		xsTypeError("expected newMeterLimit, newMeterIndex");
	}
	xsResult = xsInteger(xsGetCurrentMeter(the));
	gxCurrentMeter = xsToInteger(xsArg(0));
	xsSetCurrentMeter(the, xsToInteger(xsArg(1)));
#endif
}

void xs_setImmediate(xsMachine* the)
{
	xsSetTimer(0, 0);
}

void xs_setInterval(xsMachine* the)
{
	xsSetTimer(xsToNumber(xsArg(1)), 1);
}

void xs_setTimeout(xsMachine* the)
{
	xsSetTimer(xsToNumber(xsArg(1)), 0);
}




