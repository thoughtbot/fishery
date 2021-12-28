import { createFactory } from 'fishery';
import { BuildOptions } from '../createFactory';
import { User } from './helpers/test-types';

describe('createFactory', () => {
  describe('buildOptions', () => {
    describe('sequence', () => {
      it('starts at 1 and increments', () => {
        const factory = createFactory({
          build: ({ sequence }) => ({ id: sequence, name: 'John' }),
        });

        expect(factory.build().id).toBe(1);
        expect(factory.build().id).toBe(2);
      });

      it('is shared when extending the factory');
      it('can be reset');
    });

    describe('params', () => {
      it('passes the passed params for use by the factory', () => {
        type User = { name: string; email: string };

        const factory = createFactory({
          build: ({ params }: BuildOptions<User>) => {
            // const name = 'John'
            const name = params.name || 'John';
            const email = `${name}@example.com`;
            return { name, email } as User;
          },
          create: async user => user,
        });

        expect(factory.build({ name: 'Sue' })).toMatchObject({
          name: 'Sue',
          email: 'Sue@example.com',
        });
      });
    });
  });

  it('creates the factory with build', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' } as User),
    });

    const user = factory.build({ id: 2 as const, name: 'Susan' });
    expect(user.id).toBe(1);
    expect(user.name).toEqual('Susan');

    // extra param
    // @ts-expect-error extra param
    factory.build({ sdf: true, name: 'Susan' });

    // can leave out params
    factory.build({ name: 'Susan' });
  });

  it('works with nested parameters', () => {
    type User = { id: number; address: { city: string; state: string } };
    const factory = createFactory({
      build: () =>
        ({ id: 1, address: { city: 'Austin', state: 'TX' } } as User),
    });

    factory.build;
    const user = factory.build({
      id: 2 as const,
      // @ts-expect-error extra nested property
      address: { foo: 'sdf', state: 'sdf' },
    });
    expect(user.id).toBe(1);

    // extra param
    // @ts-expect-error
    factory.build({ sdf: true, name: 'Susan' });
  });
});

it('creates the factory', () => {
  type User = { name: string; admin: boolean };
  type AdminUser = User & { admin: true };
  type SavedUser = User & { id: number };
  type Post = { id: number; body: string };

  const factory = createFactory(
    {
      build: () =>
        ({
          name: 'Bob',
          admin: false,
        } as User),
      create: obj => Promise.resolve({ ...obj, id: 1 }),
      traits: {
        admin: () => ({ admin: true as const }),
      },
    },
    { admin: true },
  );

  const user = factory.build({ admin: true, name: 'Susan' });
  user.admin;

  // create
  factory.create({});

  const userWithPostsFactory = factory.extend({ posts: [] as Post[] });
  const userWithPosts = userWithPostsFactory.build({
    posts: [{ id: 1, body: 'post' }],
  });

  // traits
  const adminFactory = factory.admin();
  const admin: AdminUser = adminFactory.build({});
});

describe('create', () => {
  it('doesnt mess up return types', () => {
    const factory = createFactory({
      build: () =>
        ({
          name: 'Bob',
          id: 1,
        } as User),
      create: async obj => obj,
    });

    const user = factory.build();
  });
});
