import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { PathReporter } from 'io-ts/lib/PathReporter'
import { getArtifactData, getEntryList } from './axios';
import { Tracelog } from './transcript/tracelogs';
import * as io from 'io-ts'
import { Transcript } from './transcript/transcript';
import { prettyPrint } from '@watr/commonlib-shared';

export function fetchAndDecode<A, IO>(
  ioType: io.Type<A, IO, IO>,
  fetcher: () => Promise<E.Either<string[], IO>>,
): TE.TaskEither<string[], A> {
  return pipe(
    () => fetcher(),
    TE.chain(json => () => Promise.resolve(pipe(
      ioType.decode(json),
      E.mapLeft(errors => {
        errors.map(err => {
          console.log({ err });
        })
        const report = PathReporter.report(E.left(errors))
        return report;
      })
    ))),
  );
}

export const fetchAndDecodeTracelog = (entryId: string): TE.TaskEither<string[], Tracelog> => {
  const fetcher = () => getArtifactData<any>(entryId, 'tracelog', 'tracelog')
    .then(data => data === undefined ?
      E.left([`could not fetch tracelog ${entryId}`])
      : E.right(data));

  return fetchAndDecode(Tracelog, fetcher);
}

export const fetchAndDecodeTranscript = (entryId: string): TE.TaskEither<string[], Transcript> => {
  const fetcher = () => getArtifactData<any>(entryId, 'transcript')
    .then(data => data === undefined ?
      E.left([`could not fetch transcript ${entryId}`])
      : E.right(data));

  return fetchAndDecode(Transcript, fetcher);
}

const CorpusEntry = io.type({
  entryId: io.string
});
export type CorpusEntry = io.TypeOf<typeof CorpusEntry>;

const CorpusEntryList = io.type({
  entries: io.array(CorpusEntry)
});
export type CorpusEntryList = io.TypeOf<typeof CorpusEntryList>;

export const fetchAndDecodeCorpusEntryList = (): TE.TaskEither<string[], CorpusEntryList> => {
  const fetcher = () => getEntryList<any>()
    .then(data => data === undefined ?
      E.left(['could not fetch corpus entry listing'])
      : E.right(data));

  return fetchAndDecode(CorpusEntryList, fetcher);
}
