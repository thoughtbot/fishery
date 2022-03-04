import { Factory } from 'fishery';

describe('merging params', () => {
  it('doesnt mutate the params object', () => {
    type UserAttrs = { registered: boolean; admin?: boolean };
    type User = { attributes: UserAttrs };

    const defaultUserAttrs: UserAttrs = { registered: true };
    const userFactory = Factory.define<User>(() => ({
      attributes: defaultUserAttrs,
    }));

    userFactory.build({
      attributes: { ...defaultUserAttrs, registered: false, admin: true },
    });

    // not modified by factory
    expect(defaultUserAttrs.registered).toBe(true);
    expect(defaultUserAttrs.admin).toBe(undefined);
  });

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

  describe('factories.undefined', () => {
    it('overrides the initial value', () => {
      type User = { name?: string };
      const userFactory = Factory.define<User>(() => ({ name: 'Ann' }));
      expect(userFactory.build({ name: undefined }).name).toBeUndefined();
    });

    it('overrides an initial falsy value', () => {
      type User = { registered?: boolean };
      const userFactory = Factory.define<User>(() => ({ registered: false }));
      expect(
        userFactory.build({ registered: undefined }).registered,
      ).toBeUndefined();
    });

    it('overrides an initial null value', () => {
      type User = { registered?: boolean | null };
      const userFactory = Factory.define<User>(() => ({ registered: null }));
      expect(
        userFactory.build({ registered: undefined }).registered,
      ).toBeUndefined();
    });

    it('can be overridden by falsy value', () => {
      type User = { name?: string | null };
      const userFactory = Factory.define<User>(() => ({ name: undefined }));
      expect(userFactory.build({ name: null }).name).toBeNull();
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

  describe('indexed types', () => {
    it('compiles and merges successfully', () => {
      type Params = {
        [name: string]: string | string[] | undefined | null;
      };

      const requestFactory = Factory.define<Params>(({ params }) => {
        return {
          foo: 'bar',
        };
      });

      expect(
        requestFactory.build({ param1: ['value1'], param2: null }),
      ).toEqual({
        foo: 'bar',
        param1: ['value1'],
        param2: null,
      });
    });
  });
});
