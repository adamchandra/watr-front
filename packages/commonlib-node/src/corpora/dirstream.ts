import _ from 'lodash';
import path from 'path';
import fs, { } from 'fs-extra';
import stream, { Readable, Transform } from 'stream';
import through from 'through2';
import { createPump } from '../util/stream-pump';

interface DirStackEntry {
  fullpath: string;
  expanded: boolean;
  files: string[];
}

export async function expandDirRecursive(
  rootDir: string,
  includeFiles: boolean = true
): Promise<string[]> {
  const corpusDirStream = getDirWalkerStream(rootDir, includeFiles);

  const allFilesP = createPump()
    .viaStream<string>(corpusDirStream)
    .gather()
    .toPromise()
    .then(files => {
      if (files === undefined) {
        return [];
      }
      return _.flatten(files);
    });

  return allFilesP;
}

export function getDirWalkerStream(
  root: string,
  includeFiles: boolean = false
): Readable {

  const rootExists = fs.existsSync(root);
  const rootIsDir = rootExists ? fs.statSync(root).isDirectory() : false;
  if (!rootIsDir) {
    const emptyStream = new stream.Readable({
      read() { this.push(null); }
    });
    return emptyStream;
  }

  let stack: DirStackEntry[] = [{ fullpath: root, expanded: false, files: [] }];

  function expand(): DirStackEntry | undefined {
    let top = _.last(stack)
    while (top && !top.expanded) {
      const topPath = top.fullpath;
      const dirEntries = fs.readdirSync(top.fullpath, { withFileTypes: true });
      const fileNames: string[] = _(dirEntries)
        .filter(e => e.isFile())
        .map(e => e.name)
        .sort()
        .map(e => path.join(topPath, e))
        .value();

      const dirNames = _(dirEntries)
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort()
        .reverse()
        .map(e => {
          const fullpath = path.join(topPath, e);
          return {
            fullpath,
            expanded: false,
            files: []
          }
        })
        .value();

      top.expanded = true;
      // top.files.push(...fileNames)
      top.files = _.concat(top.files, fileNames);
      // stack.push(...dirNames);
      stack = _.concat(stack, dirNames);
      top = _.last(stack)
    }
    const next = stack.pop();
    return next;
  }

  const streamOut = new stream.Readable({
    objectMode: true,
    read() {
      const data = expand();
      if (!data) {
        this.push(null);
        return;
      }

      this.push(data.fullpath);

      if (includeFiles) {
        data.files.forEach(f => this.push(f));
      }

    }
  });

  return streamOut;
}

export function stringStreamFilter(test: (p: string) => boolean): Transform {
  return through.obj(
    (chunk: string, _enc: string, next: (err: any, v: string | null) => void) => {
      if (test(chunk)) {
        return next(null, chunk);
      }
      return next(null, null);
    }
  );
}
