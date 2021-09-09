import _ from 'lodash';

import {
  Ref,
  ref as deepRef,
  watch,
  reactive,
  toRefs,
} from '@nuxtjs/composition-api';

import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';

export async function awaitRef<T>(tref: Ref<T | null | undefined>): Promise<T> {
  return new Promise((resolve) => {
    watchOnceFor(tref, (t) => resolve(t));
  });
}

export function awaitRefTask<T>(ref: Ref<T>): TE.TaskEither<never, T> {
  return () => awaitRef(ref).then(x => E.right(x));
}

/**
 * watch (once) a ref for non-null/undefined values, then run callback
 */
export function watchOnceFor<T>(tref: Ref<T | null | undefined>, fn: (t: T) => void): void {
  const tv = tref.value;
  if (tv !== null && tv !== undefined) {
    // Check initial ref value, as the watch must be run lazily (skip initial check)
    //   to use the stop function
    fn(tv);
    return;
  }
  const stop = watch(tref, (tval) => {
    if (!tval) return;
    stop();
    fn(tval);
  }, {
    // lazy: true TODO check that this api change behaves correctly
    immediate: false
  });
}

/**
 * Create a watchable object that signals when all passed in
 * refs have a value !== null/undefined
 */
export function watchAll(rs?: Ref<any>[]): any {
  if (!rs) return toRefs(reactive({
    done: true,
    len: 0,
    curr: 0
  }));

  const curr = rs;
  const next = deepRef(0);
  const state = toRefs(reactive({
    done: false,
    len: rs.length,
    curr: 0
  }));

  const stop = watch(next, () => {
    if (curr.length === 0) {
      state.done.value = true;
      stop();
      return;
    }

    const startFlag = deepRef(false);
    const rhead = curr.shift()!;

    const stopInner = watch([rhead, startFlag], () => {
      const rval = rhead.value;
      if (rval !== null && rval !== undefined) {
        stopInner();
        state.curr.value += 1;
        next.value += 1;
      }

    }, { immediate: false });

    startFlag.value = true;
  }, {
    immediate: false
  });

  next.value += 1;

  return state;
}

export async function resolveWhen<T>(t: T, ...refs: Ref<any>[]): Promise<T> {
  return new Promise((resolve) => {
    const ready = watchAll(refs);
    watchOnceFor(ready.done, () => resolve(t));
  });
}
