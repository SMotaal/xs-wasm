% : %.c
%.o : %.c

GOAL ?= debug
NAMESPACE = xsnap
VARIANT = emscripten
NAME = $(NAMESPACE)-$(VARIANT)
ifneq ($(VERBOSE),1)
MAKEFLAGS += --silent
endif

ifeq ($(notdir $(CC)), emcc)
	TARGET = wasm
	SUFFIX = .js
	WASM_OBJDUMP = npx -p wabt wasm-objdump
else
	SUFFIX = 
	TARGET = mac
	MACOS_ARCH ?= 
	MACOS_VERSION_MIN ?= -mmacosx-version-min=10.7
endif

BASE_DIR = $(abspath $(CURDIR)/../..)

BUILD_DIR = $(BASE_DIR)/build
BIN_DIR = $(BUILD_DIR)/bin/$(TARGET)/$(GOAL)/$(NAME)
TMP_DIR = $(BUILD_DIR)/tmp/$(TARGET)/$(GOAL)/$(NAME)

SRC_DIR = $(BASE_DIR)/upstream/@agoric-labs/xsnap-pub/xsnap/sources
# SRC_DIR = $(BASE_DIR)/sources

export MODDABLE ?= $(BASE_DIR)/upstream/@Moddable-OpenSource/moddable
XS_DIR = $(MODDABLE)/xs
XS_INC_DIR = $(XS_DIR)/includes
XS_PLT_DIR = $(XS_DIR)/platforms
XS_SRC_DIR = $(XS_DIR)/sources

C_OPTIONS = \
	-fno-common \
	$(MACOS_ARCH) \
	$(MACOS_VERSION_MIN) \
	-DINCLUDE_XSPLATFORM \
	-DXSPLATFORM=\"xsnapPlatform.h\" \
	-DmxLockdown=1 \
	-DmxMetering=1 \
	-DmxParse=1 \
	-DmxProfile=1 \
	-DmxRun=1 \
	-DmxSloppy=1 \
	-DmxSnapshot=1 \
	-DmxRegExpUnicodePropertyEscapes=1 \
	-DmxStringNormalize=1 \
	-DmxMinusZero=1 \
	-I$(XS_INC_DIR) \
	-I$(XS_PLT_DIR) \
	-I$(XS_SRC_DIR) \
	-I$(SRC_DIR) \
	-I$(TMP_DIR)

ifneq ("x$(SDKROOT)", "x")
	C_OPTIONS += -isysroot $(SDKROOT)
endif

ifeq ($(GOAL),debug)
	C_OPTIONS += -DmxDebug=1 -g -O0 -Wall -Wextra -Wno-missing-field-initializers -Wno-unused-parameter
else
	C_OPTIONS += -DmxBoundsCheck=1 -O3
endif

ifeq ($(XSNAP_RANDOM_INIT),1)
	C_OPTIONS += -DmxSnapshotRandomInit
endif

ifeq ($(notdir $(CC)), emcc)
	C_LINK_OPTIONS = -gsource-map -DxsnapWASI=1 -sSUPPORT_LONGJMP=wasm -fwasm-exceptions

	ifneq ("x$(SYSROOT_DIR)", "x")
		C_LINK_OPTIONS += --sysroot=$(SYSROOT_DIR)
	endif

	LINK_ONLY_OPTIONS += -sVERBOSE --verbose
	LINK_OPTIONS = \
		-O3 \
		-sNO_WASM_ASYNC_COMPILATION \
		-sNO_WARN_ON_UNDEFINED_SYMBOLS \
		-sALLOW_MEMORY_GROWTH=1 \
		-sMAXIMUM_MEMORY=4GB \
		-gsource-map \
		-sEXPORT_ALL \
		-sEXPORT_ES6 \
		-sMODULARIZE \
		-sEXPORT_NAME=$(NAMESPACE) \
		-sMALLOC="emmalloc" \
		-sWASM_BIGINT \
		-sSTRICT \
		-sFORCE_FILESYSTEM \
		-lnodefs.js \
		-lmemfs.js \
		-sENVIRONMENT=node \
		-sEXPORTED_FUNCTIONS='[_main]' \
		-sEXPORTED_RUNTIME_METHODS='[callMain, FS]'

	# EXPORTED_FUNCTIONS = _main

	# EXPORTED_RUNTIME_METHODS = callMain FS
	# # EXPORTED_RUNTIME_METHODS += cwrap ccall

	# ifneq ("x$(EXPORTED_FUNCTIONS)", "x")
	# 	LINK_OPTIONS += \
	# 		-sEXPORTED_FUNCTIONS='[$(shell echo $(EXPORTED_FUNCTIONS) | tr ' ' ',')]'
	# endif

	# ifneq ("x$(EXPORTED_RUNTIME_METHODS)", "x")
	# 	LINK_OPTIONS += \
	# 		-sEXPORTED_RUNTIME_METHODS='[$(shell echo $(EXPORTED_RUNTIME_METHODS) | tr ' ' ',')]'
	# endif

else

	LINK_OPTIONS = $(MACOS_VERSION_MIN) $(MACOS_ARCH)
	LIBRARIES = -framework CoreServices

endif

ifneq ("x$(SDKROOT)", "x")
	LINK_OPTIONS += -isysroot $(SDKROOT)
endif

OBJECTS = \
	$(TMP_DIR)/xsAll.o \
	$(TMP_DIR)/xsAPI.o \
	$(TMP_DIR)/xsArguments.o \
	$(TMP_DIR)/xsArray.o \
	$(TMP_DIR)/xsAtomics.o \
	$(TMP_DIR)/xsBigInt.o \
	$(TMP_DIR)/xsBoolean.o \
	$(TMP_DIR)/xsCode.o \
	$(TMP_DIR)/xsCommon.o \
	$(TMP_DIR)/xsDataView.o \
	$(TMP_DIR)/xsDate.o \
	$(TMP_DIR)/xsDebug.o \
	$(TMP_DIR)/xsDefaults.o \
	$(TMP_DIR)/xsError.o \
	$(TMP_DIR)/xsFunction.o \
	$(TMP_DIR)/xsGenerator.o \
	$(TMP_DIR)/xsGlobal.o \
	$(TMP_DIR)/xsJSON.o \
	$(TMP_DIR)/xsLexical.o \
	$(TMP_DIR)/xsLockdown.o \
	$(TMP_DIR)/xsMapSet.o \
	$(TMP_DIR)/xsMarshall.o \
	$(TMP_DIR)/xsMath.o \
	$(TMP_DIR)/xsMemory.o \
	$(TMP_DIR)/xsModule.o \
	$(TMP_DIR)/xsNumber.o \
	$(TMP_DIR)/xsObject.o \
	$(TMP_DIR)/xsPlatforms.o \
	$(TMP_DIR)/xsProfile.o \
	$(TMP_DIR)/xsPromise.o \
	$(TMP_DIR)/xsProperty.o \
	$(TMP_DIR)/xsProxy.o \
	$(TMP_DIR)/xsRegExp.o \
	$(TMP_DIR)/xsRun.o \
	$(TMP_DIR)/xsScope.o \
	$(TMP_DIR)/xsScript.o \
	$(TMP_DIR)/xsSnapshot.o \
	$(TMP_DIR)/xsSourceMap.o \
	$(TMP_DIR)/xsString.o \
	$(TMP_DIR)/xsSymbol.o \
	$(TMP_DIR)/xsSyntaxical.o \
	$(TMP_DIR)/xsTree.o \
	$(TMP_DIR)/xsType.o \
	$(TMP_DIR)/xsdtoa.o \
	$(TMP_DIR)/xsre.o \
	$(TMP_DIR)/xsmc.o \
	$(TMP_DIR)/xsnapPlatform.o \
	$(TMP_DIR)/textdecoder.o \
	$(TMP_DIR)/textencoder.o \
	$(TMP_DIR)/modBase64.o \
	$(TMP_DIR)/xsnap.o

VPATH += $(XS_SRC_DIR) $(SRC_DIR)
VPATH += $(MODDABLE)/modules/data/text/decoder
VPATH += $(MODDABLE)/modules/data/text/encoder
VPATH += $(MODDABLE)/modules/data/base64

define logged
echo "$(1)" | sed "s#$(BASE_DIR)/##g" | sed "s#$(CC)#$(notdir $(CC))#g" | tee -a $@.log > /dev/null; (echo; $(1); echo) 2>&1 | tee -a $@.log
endef

build: $(TMP_DIR) $(BIN_DIR) $(BIN_DIR)/$(NAME)

$(TMP_DIR):
	mkdir -p $(TMP_DIR)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

$(BIN_DIR)/$(NAME): $(OBJECTS)
	@echo "#" $(NAME) $(GOAL) ": $(notdir $(CC)) -o $@$(SUFFIX)"
	$(call logged,$(CC) $(C_LINK_OPTIONS) $(LINK_ONLY_OPTIONS) $(LINK_OPTIONS) $(LIBRARIES) $(OBJECTS) -o $@$(SUFFIX))
	# @echo "#$(NAME) $(GOAL): objdump -x $(@F).wasm"
	# $(call logged,$(WASM_OBJDUMP) -x $@.wasm > $@.wasm.objdump-x.log)

$(OBJECTS): $(SRC_DIR)/xsnap.h
$(OBJECTS): $(SRC_DIR)/xsnapPlatform.h
$(OBJECTS): $(XS_PLT_DIR)/xsPlatform.h
$(OBJECTS): $(XS_SRC_DIR)/xsCommon.h
$(OBJECTS): $(XS_SRC_DIR)/xsAll.h
$(OBJECTS): $(XS_SRC_DIR)/xsScript.h
$(OBJECTS): $(XS_SRC_DIR)/xsSnapshot.h
$(OBJECTS): $(XS_INC_DIR)/xs.h

$(TMP_DIR)/%.o: %.c
	@echo "#" $(NAME) $(GOAL) ": cc" $(<F)
	$(CC) $< $(C_LINK_OPTIONS) $(C_OPTIONS) -c -o $@

.PHONY : clean
clean :
	-rm -rf $(BUILD_DIR)/bin/$(TARGET)/debug/$(NAME)
	-rm -rf $(BUILD_DIR)/bin/$(TARGET)/release/$(NAME)
	-rm -rf $(BUILD_DIR)/tmp/$(TARGET)/debug/$(NAME)
	-rm -rf $(BUILD_DIR)/tmp/$(TARGET)/release/$(NAME)
