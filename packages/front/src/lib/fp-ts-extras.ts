import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';

export function taskifyPromise<E, A>(pa: Promise<A>): TE.TaskEither<E, A> {
  return () => pa.then(E.right);
}
