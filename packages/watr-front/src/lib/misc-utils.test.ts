import { getOrDie } from './misc-utils';

describe('getOrDie', () => {

  type Foo = 'foo' | 'bar';
  it('coerce type args properly', () => {

    const a: Foo = null as any as Foo;

    try {
      const gotA = getOrDie(a);

      console.log(gotA);
    } catch (err) {
      // ok
    }

    const b: Foo = 'bar';

    try {
      const got = getOrDie(b);
      console.log(got);
    } catch (err) {
      // ok
    }

  });

});
