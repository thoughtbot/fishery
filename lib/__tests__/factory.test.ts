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

describe('factory.tuples', () => {
  it('builds a tuple', () => {
    expect(
      Factory.define<[string]>(() => ['STRING']).build(),
    ).toEqual(['STRING']);
  });

  it('not overrides the tuple with empty array', () => {
    expect(
      Factory.define<[string]>(() => ['STRING']).build([]),
    ).toEqual(['STRING']);
  });

  it('overrides the tuple', () => {
    expect(
      Factory.define<[string]>(() => ['STRING']).build(['VALUE']),
    ).toEqual(['VALUE']);
  });
});

describe('factory.arrays', () => {
  it('builds an empty array of strings', () => {
    expect(
      Factory.define<string[]>(() => []).build(),
    ).toEqual([]);
  });

  it('builds a non-empty array of string', () => {
    expect(
      Factory.define<string[]>(() => ['STRING']).build(),
    ).toEqual(['STRING']);
  });

  it('overrides the array', () => {
    expect(
      Factory.define<string[]>(() => ['STRING']).build(['VALUE']),
    ).toEqual(['VALUE']);
  });

  it('overrides the array with empty array', () => {
    expect(
      Factory.define<string[]>(() => ['STRING']).build([]),
    ).toEqual([]);
  });
});
