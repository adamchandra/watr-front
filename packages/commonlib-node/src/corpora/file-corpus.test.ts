import _ from 'lodash';
import through from 'through2';
import fs from 'fs-extra';
import { expandDirRecursive, getDirWalkerStream } from './dirstream';

import { createPump } from '../util/stream-pump';

describe('File corpus operations', () => {
  const testDirPath = './test/resources/test-dirs';

  it('should traverse all files/directories using readable stream', done => {
    const filesRead: string[] = [];

    const dirStream = getDirWalkerStream(testDirPath, false);

    const pipe = dirStream.pipe(through.obj(
      (chunk: string, _enc: string, next: (err: any, v: any) => void) => {
        filesRead.push(chunk);
        next(null, chunk);
      },
      function () {
        this.push(null);
        expect(filesRead.length).toBeGreaterThan(0);
        expect(filesRead.every(f => fs.statSync(f).isDirectory())).toEqual(true);
      },
    ));

    createPump().viaStream(pipe).gather()
      .toPromise()
      .then(() => {
        done();
      });
  });

  it('should full expand a directory of files', async () => {
    const expanded = await expandDirRecursive(testDirPath, true);
    expect(expanded.length).toBeGreaterThan(0);
    expect(expanded.some(f => fs.statSync(f).isDirectory())).toEqual(true);
    expect(expanded.some(f => fs.statSync(f).isFile())).toEqual(true);
  });

  it('should handle a non-existing input dir', async () => {
    const expanded = await expandDirRecursive('/no/valid/path', true);
    expect(expanded.length).toBe(0);
  });
});
