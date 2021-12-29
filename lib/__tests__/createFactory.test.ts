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

        expect(factory.build({ name: 'Jan' }).id).toBe(2);

        // @ts-expect-error factory correctly typed as User
        factory.build({ foo: 'bar' });
      });

      it.todo('is shared when extending the factory');
      it.todo('can be reset');
    });

    describe('params', () => {
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

      it('requires some type help if params and create are used at same time', () => {
        const factory = createFactory({
          build: ({ params }) => ({ id: 1, name: 'Jan' }),
          create: async user => user,
        });

        // no error, typed as unknown, to fix!
        const user = factory.build({ foo: 'bar' });

        expect(user.foo).toEqual('bar');

        // @ts-expect-error return type now matches the params
        user.id;

        // typing the user on 'create' hints the type to the type-checker
        const factory2 = createFactory({
          build: ({ params }) => ({ id: 1, name: params.name || 'Jan' }),
          create: async (user: User) => user,
        });

        // @ts-expect-error factory correctly typed as User
        factory2.build({ foo: 'bar' });
      });
    });
  });

  describe('create', () => {
    it('infers the return type when defined', async () => {
      const factory = createFactory({
        build: () => ({ name: 'Bob', id: 1 }),
        create: async obj => ({ ...obj, id: 2 }),
      });

      const user = await factory.create();
      expect(user.id).toEqual(2);
    });

    it('only allows factory.create if defined with createFactory', () => {
      const factory = createFactory({ build: () => ({ name: 'Bob', id: 1 }) });

      // @ts-expect-error create not defined
      factory.create();
    });
  });

  it('example with lots of options', () => {
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
          bill: () => ({ foo: 'bar' }),
        },
      },
      { admin: true },
    );

    const user = factory.build({ admin: true, name: 'Susan' });

    // create
    factory.create({});

    const userWithPostsFactory = factory.extend({ posts: [] as Post[] });
    const userWithPosts = userWithPostsFactory.build({
      posts: [{ id: 1, body: 'post' }],
    });

    expect(userWithPosts.posts[0].id).toBe(1);

    // traits
    const adminFactory = factory.admin();
    const admin: AdminUser = adminFactory.build({});
  });
});
