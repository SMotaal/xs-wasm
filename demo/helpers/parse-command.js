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

export const formats = {
  '-m': 'module',
  '-s': 'script',
  '-e': 'code',
  '-p': 'profile',
  '-w': 'snapshot',
  '-r': 'snapshot',
  '-d': 'snapshot',
};

export const flags = {
  '-v': 'printVersion',
  '-h': 'printHelp',
  '-q': 'meteringPrefixing',
  '-t': null,
};

export const switches = {
  '-p': 'writeProfile',
  '-w': 'writeSnapshot',
  '-r': 'readSnapshot',
  '-d': 'dumpSnapshot',
  '-l': 'meteringLimit',
  '-i': 'meteringInterval',
};

export const parse = command => {
  const parameters = {};
  const inputs = [];
  const outputs = [];
  const files = {};
  const problems = [];

  let lastArgumentString;
  let formatArgumentString;

  for (const [argumentIndex, argumentString] of command.entries()) {
    let parameter, previousValue, value;
    if (/^-[a-z]$/.test(argumentString)) {
      switch (argumentString) {
        case '-t':
          throw new Error('Not implemented');
        case '-m':
        case '-s':
        case '-e':
          parameter = 'format';
          previousValue = parameters[parameter];
          value = parameters[parameter] = formats[formatArgumentString = argumentString];
          if (previousValue !== undefined && previousValue !== value)
            problems.push({ parameter, value, previousValue, argumentIndex, argumentString });
          break;
        case '-p':
        case '-w':
        case '-r':
        case '-d':
        case '-l':
        case '-i':
          break;
        default:
          if (parameter = flags[argumentString]) parameters[parameter] = value = true;
          else problems.push({ parameter, value, argumentIndex, argumentString });
      }
    } else {
      let parameter = switches[lastArgumentString];
      let format = formats[lastArgumentString];
      let file;
      previousValue = parameters[parameter];
      switch (parameter) {
        case 'meteringLimit':
        case 'meteringInterval':
          parameters[parameter] = value = Number(argumentString);
          if (value !== value && typeof value === 'number')
            problems.push({ parameter, value, argumentIndex, argumentString });
          break;
        case 'writeProfile':
        case 'writeSnapshot':
          outputs.push(parameters[parameter] = value = file = files[argumentString] ??= { format, specifier: argumentString });
          break;
        case 'readSnapshot':
        case 'dumpSnapshot':
          inputs.push(parameters[parameter] = value = file = files[argumentString] ??= { format, specifier: argumentString });
          break;
        default:
          if ((format = formats[formatArgumentString] ?? (/.mjs$/.test(argumentString) ? 'module' : 'script')) === 'code')
            inputs.push({ format, text: argumentString });
          else
            inputs.push(file = files[argumentString] ??= { format, specifier: argumentString });
      }
      if (file && file.format !== format)
        problems.push({ file, format, argumentIndex, argumentString });
    }
    if (value !== undefined && previousValue !== undefined && previousValue !== value && previousValue === previousValue)
      problems.push({ parameter, value, previousValue, argumentIndex, argumentString });
    lastArgumentString = argumentString;
  }
  return { parameters, inputs, outputs, files, problems };
};