import 'chai/register-should'
import _ from 'lodash'

import {
  ref,
  watchEffect,
  watch
} from '@nuxtjs/composition-api'

import { watchAll } from './component-basics'

describe('Component Basics', () => {

  it('testing watch', () => {
    const dep1 = ref(1)
    const dep2 = ref(2)

    watch(dep1, (_nv, _ov, onCleanup: any) => {
      // this should not be triggered by dep2
      const d1 = dep1.value
      const d2 = dep2.value
      // putStrLn(`explicit watch(d1) triggered! dep1=${d1} dep2=${d2}`)
      onCleanup(() => {
        // Called just before the body of this watch is re-called
        // Does cleanup trigger other things?
        // const dd1 = dep1.value;
        // const dd2 = dep2.value;
        // putStrLn(`Cleanup on explicit watch(d1) dep1=${d1} dep2=${d2}`)
      })
    })

    const stopD2 = watch(dep2, () => {
      // this should not be triggered by dep1
      const d1 = dep1.value
      const d2 = dep2.value
      // putStrLn(`explicit watch(d2) triggered! dep1=${d1} dep2=${d2}`)
    })

    dep2.value = 20
    dep1.value = 10

    watchEffect(() => {
      const d1 = dep1.value
      const d2 = dep2.value
      // putStrLn(`implicit watch triggered! dep1=${d1} dep2=${d2}`)
    })

    watch(dep1, () => {
      // this should not be triggered by dep2
      const d1 = dep1.value
      const d2 = dep2.value
      // putStrLn(`explicit watch(d1)+options triggered! dep1=${d1} dep2=${d2}`)
      stopD2()

      // this should trigger other watches, but not d2
      dep2.value = 23
    }, {
      // lazy: false,
      deep: false
      // flush: 'pre',
    })

    dep1.value = 11
  })

  it('watchAll should signal the truthiness of all inputs', () => {
    const ns = _.range(0, 4)
    const rs = _.map(ns, () => ref(false))

    const allDone = watchAll(rs)

    _.each(ns, (n) => {
      rs[n].value = true
    })

    watch(allDone.curr, () => {
      const done = allDone.done.value
      const curr = allDone.curr.value
      const len = allDone.len.value
      // putStrLn(`test/allDone done= ${done}: on #${curr} of ${len}`)

      expect(done).toBe(curr === len)
    })
  })

  it('testing watch with self-stopping, only works with lazy=true', () => {
    const dep3 = ref(3)
    // self-stopping?
    const stopMe = watch(dep3, (_nv, _ov, onCleanup: any) => {
      // this should not be triggered by dep2
      // // putStrLn(`explicit watch(d3) triggered! dep1=${d1} dep2=${d2}`)
      const d3 = dep3.value
      // putStrLn(`1. explicit watch(d3=${d3}) triggered!`)
      if (d3 > 5) {
        stopMe()
      }
      dep3.value = d3 + 1

      onCleanup(() => {
        const dd3 = dep3.value
        // putStrLn(`1. Cleanup on explicit watch(d3=${dd3}) triggered!`)
      })
    }, {
      // lazy: true,
      immediate: false,
      deep: false
      // flush: 'pre',
    })

    dep3.value = 1
  })

});
