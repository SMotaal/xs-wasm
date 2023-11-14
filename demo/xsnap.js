import makeXSnapInstance from '../build/bin/wasm/debug/xsnap-emscripten/xsnap-emscripten.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from './helpers/parse-command.js';
import * as captureOutput from './helpers/capture-output.js';

const wasmRootPath = '/xsnap-wasm';
const examplesRootPath = '/xsnap-examples';
const hostRootPath = fileURLToPath(new URL('.', import.meta.url));
process.chdir(hostRootPath);

const hostRootReplacer = new RegExp(String.raw`(?:file://)?${process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|(?=[^\w-.]|$))`, 'g');
const wasmRootReplacer = wasmRootPath ? new RegExp(String.raw`(?:file://|\b\.)?${wasmRootPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|(?=[^\w-.]|$))`, 'g') : /^/;
const wasmPathReplacer = wasmRootPath ? new RegExp(String.raw`^${wasmRootPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=/|$)`, 'g') : /^/;

/** @param {{FS: FS, NODEFS: typeof NODEFS}} instance */
const mountFS = instance => {
  instance.FS.mkdir(wasmRootPath);
  instance.FS.mount(instance.NODEFS, { root: process.cwd(), }, wasmRootPath);
  instance.FS.chdir(wasmRootPath);
  instance.FS.mkdir(examplesRootPath);
  instance.FS.mount(instance.NODEFS, { root: path.resolve(process.cwd(), '../examples') }, examplesRootPath);
  return instance.FS;
};

const createInstance = (state = {}, settings) => makeXSnapInstance(state.module = {
  ...settings, noExitRuntime: true, noInitialRun: true,
  onAbort: (...args) => {
    console.error('abort' + (args.length ? `: ${Array(args.length).fill('%o').join(', ')}` : ''), ...args);
    state.aborted = true;
    state.onAbort = { arguments: args };
    state.exitCode ||= 1;
  },
});

if (process.argv.length > 2) {
  let state = {};
  let threw;

  state.exitCode = 0;
  state.returnValue = 0;

  state.command = process.argv.splice(2, process.argv.length - 2);

  const instance = await createInstance(state);

  if (state.exitCode) throw new Error(`exitcode: ${state.exitCode}`);

  const FS = mountFS(instance);
  const { parameters, inputs, outputs, files, problems } = state.parsedCommand = parse(state.command);
  const argv = [...state.command];

  for (const file of Object.values(files)) {
    file.hostPath = path.resolve(hostRootPath, file.specifier);
    file.wasmPath = path.posix.resolve(wasmRootPath, file.specifier);
  }

  for (const [index, arg] of Object.entries(argv))
    if (arg in files) argv[index] = files[arg].wasmPath.replace(wasmPathReplacer, '.');

  if (!!(state.returnValue = instance.callMain(argv)) || state.aborted) throw new Error(`EXITCODE = ${state.returnValue}`);

  process.exit(state.returnValue);

  // await makeXSnapInstance({
  //   /// SEE: https://emscripten.org/docs/api_reference/module.html
  //   noExitRuntime: true,
  //   preMain: module => { 
  //     console.log('preRun', module);
  //     mountFS(module); 
  //   },
  // });
} else {

  fs.rmSync('snapshots', { recursive: true, force: true });
  fs.rmSync('profiles', { recursive: true, force: true });
  fs.mkdirSync('snapshots', { recursive: true });
  fs.mkdirSync('profiles', { recursive: true });
  fs.mkdirSync('logs', { recursive: true });

  captureOutput.attach();

  const stats = { instances: 0, commands: 0, completed: 0, aborted: 0, passed: 0, failed: 0, exceptions: 0, expectedExceptions: 0, unexpectedExceptions: 0 };
  const failures = {};
  let state;
  let exception;

  for (const [exampleId, { settings = {}, scope, fallback, commands = [] }] of Object.entries({

    ...(await import('./modules/examples.js')).default,

    'smotaal-debug-global-this (profiling)': {
      scope: 'modules/debug',
      profile: 'profiles/smotaal-debug-global-this.cpuprofile',
      commands: [
        ['-m', 'modules/debug/global-this.js', '-p', 'profiles/smotaal-debug-global-this.cpuprofile'],
      ],
    },

    'smotaal-eval': {
      commands: [['-e', 'print("Hello World!")']],
    },

    'smotaal-snapshot (snapshot)': {
      scope: 'modules',
      snapshots: ['snapshots/smotaal-snapshot.xsm'],
      commands: [
        ['-m', 'modules/examples.js', '-w', 'snapshots/smotaal-snapshot.xsm'],
      ],
    },

    'smotaal-snapshot (snapshot dump)': {
      scope: 'modules',
      commands: [
        Object.assign(['-d', 'snapshots/smotaal-snapshot.xsm'], { throws: true }),
      ],
    },

  })) {
    state = {};
    if (commands.length === 0 || fallback === null) continue;
    console.group(`▶︎ %s\n`, exampleId);
    try {
      state.exitCode = 0;
      state.returnValue = 0;

      const instance = await createInstance(state, settings);
      // const instance = await makeXSnapInstance(state.module = {
      //   ...settings, noExitRuntime: true, noInitialRun: true,
      //   onAbort: (...args) => {
      //     console.error('abort' + (args.length ? `: ${Array(args.length).fill('%o').join(', ')}` : ''), ...args);
      //     state.aborted = true;
      //     state.onAbort = { arguments: args };
      //     state.exitCode ||= 1;
      //   },
      // });

      stats.instances++;
      state.instance = instance;

      if (state.exitCode) throw new Error(`exitcode: ${state.exitCode}`);

      const FS = mountFS(instance);
      const moduleScopeReplacer = scope ? new RegExp(String.raw`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`) : /^([^\n\t\0/]+\/)*(?=[^\n\t\0/]*)/;

      for (const command of commands) {
        let groupIndent = 0;
        let returned = false;
        let threw;
        let writes;
        const commandString = command.map(s => moduleScopeReplacer[Symbol.replace](s, './')).join(' ');

        try {
          const { parameters, inputs, outputs, files, problems } = state.parsedCommand = parse(state.command = command);

          console.group(`▷ [%s]`, commandString); groupIndent++;
          console.time('Time');

          if (problems.length > 0)
            throw new Error(`problems: ${JSON.stringify(problems, null, 2)}`);

          const argv = [...command];

          for (const file of Object.values(files)) {
            file.hostPath = path.resolve(hostRootPath, file.specifier);
            file.wasmPath = path.posix.resolve(wasmRootPath, file.specifier);
          }

          for (const [index, arg] of Object.entries(argv))
            if (arg in files) argv[index] = files[arg].wasmPath.replace(wasmPathReplacer, '.');

          console.log('');
          stats.commands++;
          writes = captureOutput.getWrites();

          if (threw = !!(state.returnValue = instance.callMain(argv)) || state.aborted)
            throw new Error(`EXITCODE = ${state.returnValue}`);

          if (command.throws)
            throw new Error(`Expected to throw`);

          writes === captureOutput.getWrites() || console.log('');
          stats.passed++, returned = true;
        } catch (error) {
          writes === captureOutput.getWrites() || console.log('');
          stats.exceptions++;

          if (command.throws && threw) stats.expectedExceptions++, stats.passed++;
          else stats.unexpectedExceptions++, stats.failed++;

          console.error(error, '\n');
          (failures[exampleId] ??= {})[commandString] = error;
          break;
        } finally {
          while (groupIndent--) console.groupEnd();
          console.group('Summary:');
          console.timeEnd('Time');
          if (returned) console.log(`Status: returned successfully\n`);
          else if (command.throws && threw) console.log(`Status: aborted expectedly\n`);
          else console.log(`Status: aborted unexpectedly\n`);
          console.groupEnd();
        }
      }

      if (state.aborted) stats.aborted++;
      else stats.completed++;

    } catch (error) {
      exception = error;
      break;
    } finally {
      console.groupEnd();
    }
  }

  if (exception) console.error('🛑 %O', exception);

  console.group('\nSummary:');
  console.log(`Instances: %O\t\tCompleted: %O\t\tAborted: %O`, stats.instances, stats.completed, stats.aborted);
  console.log(`Commands: %O\t\tPassing: %O\t\tFailing: %O`, stats.commands, stats.passed, stats.failed);
  console.log(`Exceptions: %O\t\tExpected: %O\t\tUnexpected: %O`, stats.exceptions, stats.expectedExceptions, stats.unexpectedExceptions);
  console.groupEnd();

  captureOutput.detach();

  console.log('');

  if (captureOutput) {
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const logPath = `logs/${timestamp} ${/^.+\/(?=[^/]+$)/[Symbol.replace](import.meta.url, '')}.log`;

    console.log('Writing log to: %O\n', logPath);

    fs.writeFileSync(
      logPath,
      captureOutput.toChunks().join('')
        // Remove ANSI escape codes
        .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
        // Clean up the log a bit
        .replace(/\n((?<indent> +)\d+\n)(?:(?:\k<indent>\d+\n){50,})(\k<indent>\d+\n)/g, '\n$1$2⋯\n$3')
        // Clean up the log a bit
        .replace(/\n((?<indent> +)\[\d+\] \d+ \d.*?\n)(?:(?:\k<indent>\[\d+\] \d+ \d.*?\n){50,})(\k<indent>\[\d+\] \d+ \d.*?\n)/g, '\n$1$2⋯\n$3')
        // Replace wasm root with `./`
        .replace(wasmRootReplacer, './')
        // Replace host root with `./`
        .replace(hostRootReplacer, './'),
    );
  }

  if (!stats.unexpectedExceptions) process.exit(0);

}
