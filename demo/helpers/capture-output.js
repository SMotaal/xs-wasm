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

export const capturedOutput = {
    output: [],

    streams: new Map([
        [process.stdout, { id: 'stdout', fd: 1, write: process.stdout.write }],
        [process.stderr, { id: 'stderr', fd: 2, write: process.stderr.write }],
    ]),

    writes: 0,

    write(...argumentList) {
        const mapping = capturedOutput.streams.get(this);

        if (!mapping)
            throw new Error(`Cannot redirect write for ${this}`);
        
        const { id, fd, write } = mapping;
        const [chunk, encoding] = argumentList;
        
        capturedOutput.output.push({ id, chunk, encoding });
        
        capturedOutput.writes++;

        return Reflect.apply(write, this, argumentList);
    },

    attach() {
        for (const [stream, mapping] of capturedOutput.streams)
            stream.write = capturedOutput.write.bind(stream);
    },

    detach() {
        for (const [stream, mapping] of capturedOutput.streams)
            stream.write = mapping.write;
    },

    toChunks() {
        const chunks = [];

        for (const { chunk } of capturedOutput.output)
            chunks.push(chunk);

        return chunks;
    },
};

export const attach = capturedOutput.attach.bind(capturedOutput);
export const detach = capturedOutput.detach.bind(capturedOutput);
export const toChunks = capturedOutput.toChunks.bind(capturedOutput);
export const getWrites = () => capturedOutput.writes;