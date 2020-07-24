import { Factory, HookFn } from 'fishery';

type User = {
  id: string;
  name: string;
  address?: { city: string; state: string };
};

const userFactory = Factory.define<User>(({ sequence }) => {
  const name = 'Bob';
  return {
    id: `user-${sequence}`,
    name,
    address: {
      city: 'Detroit',
      state: 'MI',
    },
  };
});

describe('factory.build', () => {
  it('builds the object', () => {
    const user = userFactory.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
    expect(user.address?.state).toEqual('MI');
  });

  it('accepts partials of nested objects', () => {
    const user = userFactory.build({ address: { city: 'Ann Arbor' } });
    expect(user.address).toMatchObject({ city: 'Ann Arbor', state: 'MI' });
  });
});

describe('factory.buildList', () => {
  it('builds a list of objects with the specified properties', () => {
    const users = userFactory.buildList(2, { name: 'susan' });
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });

  it('calls afterBuild for each item', () => {
    const afterBuildFn = jest.fn(user => {
      user.name = 'Bill';
    });

    const factory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(afterBuildFn);
      return { id: '1', name: 'Ralph' };
    });

    expect(factory.buildList(2).every(u => u.name === 'Bill')).toBeTruthy();
    expect(afterBuildFn).toHaveBeenCalledTimes(2);
  });
});

describe('afterBuild', () => {
  it('passes the object for manipulation', () => {
    const factory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(user => {
        user.id = 'bla';
      });

      return { id: '1', name: 'Ralph' };
    });

    expect(factory.build().id).toEqual('bla');
  });

  describe('when not a function', () => {
    it('raises an error', () => {
      const factory = Factory.define<User>(({ afterBuild }) => {
        afterBuild(('5' as unknown) as HookFn<User>);
        return { id: '1', name: 'Ralph' };
      });

      expect(() => {
        factory.build();
      }).toThrowError(/must be a function/);
    });
  });
});

describe('factory.rewindSequence', () => {
  it('sets sequence back to one after build', () => {
    const factory = Factory.define<User>(({ sequence }) => {
      return { id: `user-${sequence}`, name: 'Ralph' };
    });

    expect(factory.build().id).toBe('user-1');

    factory.rewindSequence();
    expect(factory.build().id).toBe('user-1');
    expect(factory.build().id).toBe('user-2');
  });

  it('sets sequence back to one after buildList', () => {
    const factory = Factory.define<User>(({ sequence }) => {
      return { id: `user-${sequence}`, name: 'Ralph' };
    });

    expect(factory.buildList(2)).toEqual([
      { id: 'user-1', name: 'Ralph' },
      { id: 'user-2', name: 'Ralph' },
    ]);

    factory.rewindSequence();

    expect(factory.buildList(2)).toEqual([
      { id: 'user-1', name: 'Ralph' },
      { id: 'user-2', name: 'Ralph' },
    ]);
  });
});

describe('merging params', () => {
  describe('factory.tuples', () => {
    const tupleFactory = Factory.define<{ items: [string] }>(() => ({
      items: ['STRING'],
    }));

    it('builds a tuple with default value', () => {
      expect(tupleFactory.build().items).toEqual(['STRING']);
    });

    it('generates a compile error when tuple not defined', () => {
      // @ts-expect-error
      tupleFactory.build({ items: [] });
    });

    it('overrides the tuple when passed to build', () => {
      expect(
        Factory.define<[string]>(() => ['STRING']).build(['VALUE']),
      ).toEqual(['VALUE']);
    });
  });

  describe('factory.arrays', () => {
    const arrayFactory = Factory.define<{ items: string[] }>(() => ({
      items: ['STRING'],
    }));

    it('builds an empty array of strings', () => {
      expect(arrayFactory.build({ items: [] }).items).toEqual([]);
    });

    it('builds a non-empty array of string', () => {
      expect(arrayFactory.build().items).toEqual(['STRING']);
    });

    it('overrides the array', () => {
      expect(arrayFactory.build({ items: ['VALUE'] }).items).toEqual(['VALUE']);
    });

    it('doesnt allow passing a partial of an array object', () => {
      type User = {
        id: string;
        name: string;
      };

      const arrayFactory = Factory.define<{ users: User[] }>(() => ({
        users: [{ id: '1', name: 'Oscar' }],
      }));

      // @ts-expect-error
      arrayFactory.build({ users: [{ id: '2' }] });
    });

    it('correctly types "params" in the factory to the full array with no compiler error', () => {
      Factory.define<{ items: string[] }>(({ params }) => ({
        items: params.items || ['hello'],
      }));
    });
  });

  describe('factories.unknown', () => {
    it('does not generate compiler error for unknown', () => {
      interface User {
        something: unknown;
        somethingOptional?: unknown;
      }

      const userFactory = Factory.define<User>(() => ({
        something: 'blah',
      }));

      userFactory.build({ something: 1, somethingOptional: 'sdf' });
      userFactory.build();
    });

    it('does not generate compiler error with unknown inside of arrays', () => {
      interface Entity1 {
        entity2: Entity2;
      }

      interface Entity2 {
        id: string;
        entity3: Array<Entity3>;
        entity3Optional?: Array<Entity3>;
      }

      interface Entity3 {
        _permissions: unknown;
      }

      const entity2Factory = Factory.define<Entity2>(() => ({
        id: 'abc',
        entity3: [],
        entity3Optional: [],
      }));

      const entity2 = entity2Factory.build();

      const entity1Factory = Factory.define<Entity1>(() => ({
        entity2: entity2Factory.build(),
      }));

      entity1Factory.build({ entity2: entity2 });
    });

    it('does not generate compiler error with unknown nested in object', () => {
      interface Entity1 {
        entity2: Entity2;
      }

      interface Entity2 {
        entity3: { _permissions: unknown };
      }

      const entity2Factory = Factory.define<Entity2>(() => ({
        id: 'abc',
        entity3: { _permissions: 'foo' },
      }));

      const entity2 = entity2Factory.build();

      const entity1Factory = Factory.define<Entity1>(() => ({
        entity2: entity2Factory.build(),
      }));

      entity1Factory.build({ entity2 });
    });
  });
});
