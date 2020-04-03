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

  it('calls afterBuild for each item', () => {
    const afterBuildFn = jest.fn(user => {
      user.name = 'Bill';
    });

    const factory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(afterBuildFn);
      return { id: '1', name: 'Ralph' };
    });

    register({ user: factory });
    expect(factory.buildList(2).every(u => u.name === 'Bill')).toBeTruthy();
    expect(afterBuildFn).toHaveBeenCalledTimes(2);
  });
});

describe('factory.create', () => {
  it('creates the object and returns a promise as defined in factory `onCreate` method', async () => {
    expect.assertions(1);
    type User = { name: string };
    const userFactory = Factory.defineUnregistered<User>(({ onCreate }) => {
      onCreate(user => {
        user.name = 'Susan';
        return Promise.resolve(user);
      });

      return { name: 'Bob' };
    });
    const user = await userFactory.create();
    expect(user.name).toEqual('Susan');
  });

  it('raises an error if create is not defined', async () => {
    expect.assertions(1);
    type User = { name: string };
    const userFactory = Factory.defineUnregistered<User>(() => ({
      name: 'Bob',
    }));

    await userFactory.create().catch(err => {
      expect(err.message).toMatch(/Tried to call `create`/);
    });
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

    register({ user: factory });
    expect(factory.build().id).toEqual('bla');
  });

  describe('when not a function', () => {
    it('raises an error', () => {
      const factory = Factory.define<User>(({ afterBuild }) => {
        afterBuild(('5' as unknown) as HookFn<User>);
        return { id: '1', name: 'Ralph' };
      });

      register({ user: factory });
      expect(() => {
        factory.build();
      }).toThrowError(/must be a function/);
    });
  });
});
