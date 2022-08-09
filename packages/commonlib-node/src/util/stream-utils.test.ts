import 'chai';
import { prettyPrint } from '@watr/commonlib-shared';

import pumpify from 'pumpify';

import util from 'util';
import stream from 'stream';
import {
  stanzaChunker,
  throughFunc,
  charStream,
  arrayStream,
  tapStream,
} from './stream-utils';

const pipeline = util.promisify(stream.pipeline);

describe('Stream utils', () => {
  const delay = (t: number) => new Promise(resolve => { setTimeout(resolve, t); });

  async function doAsyncStuff(s: string): Promise<string> {
    return delay(300).then(() => `${s}_${s}`);
  }

  it('process async throughput in order', done => {
    const astr = charStream('abc');

    const output: string[] = [];
    pipeline(
      astr,
      throughFunc(doAsyncStuff),
      tapStream((data: string) => {
        output.push(data);
      }),
    ).then(() => {
      expect(output).toEqual(['a_a', 'b_b', 'c_c']);
      done();
    });
  });

  it('should turn stream of lines into stanzas (line groups)', done => {
    // const astr = es.readArray("{ a b c } { d } { e }".split(" "));
    const astr = arrayStream('{ a b c } { d } { e }'.split(' '));

    const chunker = stanzaChunker(
      l => l === '{',
      l => l === '}',
    );
    const pipe = pumpify.obj(
      astr,
      // prettyPrintTrans("line"),
      chunker,
    );

    pipe.on('data', (data: string) => {
      const lines = data.split('\n');
      prettyPrint({ lines, data });
    });

    pipe.on('end', () => {
      prettyPrint({ msg: 'done' });
      done();
    });
  });
});
