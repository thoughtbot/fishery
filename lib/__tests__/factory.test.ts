import { register, Factory, HookFn } from 'fishery';

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

register({ user: userFactory });

describe('factory.build', () => {
  it('creates the object', () => {
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
  it('creates a list of objects with the specified properties', () => {
    const users = userFactory.buildList(2, { name: 'susan' });
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });

  it('calls afterCreate for each item', () => {
    const afterCreateFn = jest.fn(user => {
      user.name = 'Bill';
    });

    const factory = Factory.define<User>(({ afterCreate }) => {
      afterCreate(afterCreateFn);
      return { id: '1', name: 'Ralph' };
    });

    register({ user: factory });
    expect(factory.buildList(2).every(u => u.name === 'Bill')).toBeTruthy();
    expect(afterCreateFn).toHaveBeenCalledTimes(2);
  });
});

describe('afterCreate', () => {
  it('passes the object for manipulation', () => {
    const factory = Factory.define<User>(({ afterCreate }) => {
      afterCreate(user => {
        user.id = 'bla';
      });

      return { id: '1', name: 'Ralph' };
    });

    register({ user: factory });
    expect(factory.build().id).toEqual('bla');
  });

  describe('when not a function', () => {
    it('raises an error', () => {
      const factory = Factory.define<User>(({ afterCreate }) => {
        afterCreate(('5' as unknown) as HookFn<User>);
        return { id: '1', name: 'Ralph' };
      });

      register({ user: factory });
      expect(() => {
        factory.build();
      }).toThrowError(/must be a function/);
    });
  });
});

describe('factory.rewindSequence', () => {
  it('sets sequence back to zero after build', () => {
    const factory = Factory.define<User>(({ sequence }) => {
      return { id: `user-${sequence}`, name: 'Ralph' };
    });

    register({ user: factory });

    expect(factory.build().id).toBe('user-0');

    factory.rewindSequence();
    expect(factory.build().id).toBe('user-0');
    expect(factory.build().id).toBe('user-1');
  });

  it('sets sequence back to zero after buildList', () => {
    const factory = Factory.define<User>(({ sequence }) => {
      return { id: `user-${sequence}`, name: 'Ralph' };
    });

    register({ user: factory });

    expect(factory.buildList(2)).toEqual([
      { id: 'user-0', name: 'Ralph' },
      { id: 'user-1', name: 'Ralph' },
    ]);

    factory.rewindSequence();

    expect(factory.buildList(2)).toEqual([
      { id: 'user-0', name: 'Ralph' },
      { id: 'user-1', name: 'Ralph' },
    ]);
  });
});
