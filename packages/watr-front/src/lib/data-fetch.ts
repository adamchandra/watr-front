import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as io from 'io-ts';
import { markRaw } from '@nuxtjs/composition-api';
import { getArtifactData, getEntryList } from './axios';
import { Transcript } from './transcript/transcript';

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
        });
        const report = PathReporter.report(E.left(errors));
        return report;
      }),
    ))),
  );
}

export const fetchAndDecodeTranscript = (entryId: string): TE.TaskEither<string, Transcript> => {
  const fetcher = () => getArtifactData<any>(entryId, 'transcript')
    .then(data => (data === undefined
      ? E.left([`could not fetch transcript ${entryId}`])
      : E.right(markRaw(data))));

  return pipe(
    fetchAndDecode(Transcript, fetcher),
    TE.mapLeft(errs => errs.join("\n"))
  )
};

const CorpusEntry = io.type({
  entryId: io.string,
});
export type CorpusEntry = io.TypeOf<typeof CorpusEntry>;

const CorpusEntryList = io.type({
  entries: io.array(CorpusEntry),
});
export type CorpusEntryList = io.TypeOf<typeof CorpusEntryList>;

export const fetchAndDecodeCorpusEntryList = (): TE.TaskEither<string, CorpusEntryList> => {
  const fetcher = () => getEntryList<any>()
    .then(data => (data === undefined
      ? E.left(['could not fetch corpus entry listing'])
      : E.right(data)));

  return pipe(
    fetchAndDecode(CorpusEntryList, fetcher),
    TE.mapLeft(errs => errs.join("\n"))
  );
};
