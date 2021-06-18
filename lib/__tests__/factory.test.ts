import { CreateFn, Factory, HookFn } from 'fishery';

type User = {
  id: string;
  name: string;
  age?: number;
  email?: string | null;
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

  it('builds the object for optional undefined keys', () => {
    const user = userFactory.build({ name: 'susan', age: undefined });
    expect(user.age).toBeUndefined();
  });

  it('builds the object for optional keys', () => {
    const user = userFactory.build({
      name: 'susan',
      age: 40,
      email: 'person@example.com',
    });
    expect(user.age).toBe(40);
    expect(user.email).toBe('person@example.com');
  });

  it('builds the object for optional null keys', () => {
    const user = userFactory.build({ name: 'susan', email: null });
    expect(user.email).toBeNull();
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

describe('factory.create', () => {
  it('creates the object with a promise', async () => {
    const promise = userFactory.create({ name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const user = await promise;
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
    expect(user.address?.state).toEqual('MI');
  });
});

describe('factory.createList', () => {
  it('creates a list of objects with the specified properties', async () => {
    const promise = userFactory.createList(2, { name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const users = await promise;
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });

  it('calls onCreate for each item', async () => {
    const onCreateFn = jest.fn(user => {
      user.name = 'Bill';
      return Promise.resolve(user);
    });

    const factory = Factory.define<User>(({ onCreate }) => {
      onCreate(onCreateFn);
      return { id: '1', name: 'Ralph' };
    });

    const promise = factory.createList(2, { name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const users = await promise;
    expect(users.every(u => u.name === 'Bill')).toBeTruthy();
    expect(onCreateFn).toHaveBeenCalledTimes(2);
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

describe('onCreate', () => {
  it('passes the object for manipulation', async () => {
    const factory = Factory.define<User>(({ onCreate }) => {
      onCreate(user => {
        user.id = 'bla';
        return Promise.resolve(user);
      });

      return { id: '1', name: 'Ralph' };
    });

    const user = await factory.create();
    expect(user.id).toEqual('bla');
  });

  describe('when not a function', () => {
    it('raises an error', () => {
      const factory = Factory.define<User>(({ onCreate }) => {
        onCreate(('5' as unknown) as CreateFn<User>);
        return { id: '1', name: 'Ralph' };
      });

      return expect(factory.create()).rejects.toThrowError(
        /must be a function/,
      );
    });
  });
});

describe('merging params', () => {
  describe('nested objects', () => {
    type User = {
      attributes: {
        registered: boolean;
        admin?: boolean;
      };
    };

    it('preserves nested objects when merging trait-supplied params with build()-supplied', () => {
      const userFactory = Factory.define<User>(() => ({
        attributes: { registered: true },
      }));

      const user = userFactory
        .params({ attributes: { admin: true } })
        .build({ attributes: { registered: false } });

      expect(user.attributes).toMatchObject({
        admin: true,
        registered: false,
      });
    });

    it('preserves nested objects when merging trait-supplied params into each other', () => {
      const userFactory = Factory.define<User>(() => ({
        attributes: { registered: true },
      }));
      const user = userFactory
        .params({ attributes: { admin: true } })
        .params({ attributes: { registered: false } })
        .build({ attributes: { registered: false } });

      expect(user.attributes).toMatchObject({
        admin: true,
        registered: false,
      });
    });
  });

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
