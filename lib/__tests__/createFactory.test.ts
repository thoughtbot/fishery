import { createFactory, factoryType } from 'fishery';
import { User } from './helpers/test-types';

describe('createFactory', () => {
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

  describe('type', () => {
    it('types T and P explicitly', () => {
      const factory = createFactory({
        // type: factoryType<User>(),
        build: ({ params }) => ({ id: 1, name: 'Jan' }),
        // create: async user => user,
      });

      // @ts-expect-error Params typed as User
      const user = factory.build({ foo: 'bar' });

      // @ts-expect-error builds a User
      expect(user.foo).toEqual('bar');

      user.id;
    });
  });
});
