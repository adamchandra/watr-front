import _ from 'lodash';
import through from 'through2';
import { expandDirRecursive, getDirWalkerStream } from './dirstream';
import { prettyPrint } from 'commonlib-shared';
import fs from 'fs-extra';

describe('File corpus operations', () => {
  const testDirPath = './test/resources/test-dirs';

  it('should traverse all files/directories using readable stream', async (done) => {

    const filesRead: string[] = [];

    const dirStream = getDirWalkerStream(testDirPath, false);

    dirStream.pipe(through.obj(
      (chunk: string, _enc: string, next: (err: any, v: any) => void) => {
        filesRead.push(chunk);
        next(null, chunk);
      },
      (end) => {
        expect(filesRead.length).toBeGreaterThan(0);
        expect(filesRead.every(f => fs.statSync(f).isDirectory()))
        end();
        done();
      }
    ));
  });

  it('should full expand a directory of files', async (done) => {
    const expanded = await expandDirRecursive(testDirPath, true);
    expect(expanded.length).toBeGreaterThan(0);
    expect(expanded.some(f => fs.statSync(f).isDirectory()))
    expect(expanded.some(f => fs.statSync(f).isFile()))
    done();
  });

  it('should handle a non-existing input dir', async (done) => {
    const expanded = await expandDirRecursive('/no/valid/path', true);
    expect(expanded.length).toBe(0);
    done();
  });


});
