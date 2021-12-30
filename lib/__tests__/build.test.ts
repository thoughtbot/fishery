import { createFactory } from 'fishery';
import { BuildOptions } from 'lib/createFactory';

describe('build', () => {
  it('builds the object', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' }),
    });

    const user = factory.build({ id: 2, name: 'Susan' });
    expect(user.id).toBe(2);
    expect(user.name).toEqual('Susan');

    // @ts-expect-error id should be typed as number
    factory.build({ id: '1' });

    // @ts-expect-error extra param should error
    factory.build({ sdf: true, name: 'Susan' });
  });

  it('is typed correctly when factory created with params', () => {
    const factory = createFactory({
      build: ({ params }) => ({ id: 1, name: 'Bob' }),
    });

    // @ts-expect-error id should be typed as number
    factory.build({ id: '1' });

    // @ts-expect-error extra param should error
    factory.build({ sdf: true, name: 'Susan' });
  });

  it('generates appropriate type errors', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' }),
    });

    // @ts-expect-error id should be typed as number
    factory.build({ id: '1' });

    // @ts-expect-error extra param should error
    factory.build({ sdf: true, name: 'Susan' });
  });

  it('can leave out params when building', () => {
    const factory = createFactory({ build: () => ({ id: 1, name: 'John' }) });

    // can leave out params
    const user = factory.build({ name: 'Susan' });
    expect(user.id).toEqual(1);
  });

  it('works with nested parameters', () => {
    type User = {
      id: number;
      address: { city: string; state: string };
    };

    const factory = createFactory({
      build: () => ({ id: 1, address: { city: 'Austin', state: 'TX' } }),
    });

    factory.build({
      // @ts-expect-error extra nested property should be error
      address: { foo: 'sdf', state: 'sdf' },
    });

    const user = factory.build({
      id: 2,
      address: { city: 'San Antonio' },
    });

    expect(user.id).toBe(2);
    expect(user.address.city).toEqual('San Antonio');
    expect(user.address.state).toEqual('TX'); // preserves nested default
  });

  describe('sequence param', () => {
    it('starts at 1 and increments', () => {
      const factory = createFactory({
        build: ({ sequence }) => ({ id: sequence, name: 'John' }),
      });

      expect(factory.build().id).toBe(1);

      expect(factory.build({ name: 'Jan' }).id).toBe(2);

      // @ts-expect-error factory correctly typed as User
      factory.build({ foo: 'bar' });
    });

    it.todo('is shared when extending the factory');
    it.todo('can be reset');
  });

  describe('buildOptions params', () => {
    it('passes the passed params for use by the factory', () => {
      type User = { name: string; email: string };

      const factory = createFactory({
        build: ({ params }: BuildOptions<User>) => {
          const name = params.name || 'John';
          const email = `${name}@example.com`;
          return { name, email } as User;
        },
        create: async user => user,
      });

      // @ts-expect-error factory correctly typed as User
      factory.build({ foo: 'bar' });

      expect(factory.build({ name: 'Sue' })).toMatchObject({
        name: 'Sue',
        email: 'Sue@example.com',
      });
    });
  });
});
