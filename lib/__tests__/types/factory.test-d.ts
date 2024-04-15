import { Factory } from 'fishery';
import { expectType } from 'tsd';
import { DeepPartial } from 'lib/types';

type Bar = {
  baz: string;
};

type Foo = {
  bar: Bar;
  baz: number;
};

const testFactory = Factory.define<Foo>(() => ({
  bar: {
    baz: 'foo',
  },
  baz: 123,
}));

describe('factory types', () => {
  describe('build', () => {
    it('has correct return type', () => {
      const buildResult = testFactory.build();
      expectType<Foo>(buildResult);
    });
  });

  describe('buildList', () => {
    it('returns empty list if amount is 0', () => {
      const buildResult = testFactory.buildList(0);
      expectType<never[]>(buildResult);
    });

    it('returns non-empty list if amount is not 0', () => {
      const buildResult = testFactory.buildList(3);
      expectType<[Foo, ...Foo[]]>(buildResult);
    });

    it('returns general list if amount is not known', () => {
      const num: number = 3;
      const buildResult = testFactory.buildList(num);
      expectType<Foo[]>(buildResult);
    });
  });

  describe('create', () => {
    it('has correct return type', () => {
      const buildResult = testFactory.create();
      expectType<Promise<Foo>>(buildResult);
    });
  });

  describe('createList', () => {
    it('resolves empty list if amount is 0', () => {
      const buildResult = testFactory.createList(0);
      expectType<Promise<never[]>>(buildResult);
    });

    it('resolves non-empty list if amount is not 0', () => {
      const buildResult = testFactory.createList(3);
      expectType<Promise<[Foo, ...Foo[]]>>(buildResult);
    });

    it('resolves general list if amount is not known', () => {
      const num: number = 3;
      const buildResult = testFactory.createList(num);
      expectType<Promise<Foo[]>>(buildResult);
    });
  });
});
