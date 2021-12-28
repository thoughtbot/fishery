import { createFactory } from 'fishery';
import { User } from './helpers/test-types';

describe('createFactory', () => {
  describe('build', () => {
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

  it('sdf', () => {
    type User = {
      name: string;
      admin: boolean;
      address: { id: number; city: string };
    };

    // works, but returns a User without desired type narrowing based on params
    const build1 = (params: User) => params;

    // return type is more accurate as desired, but allows extra parameters
    const build2 = <T extends User>(
      params: keyof T extends keyof User ? T : User,
    ) => params;

    const build3 = (params: User) => params;

    // works, return type not ideal
    const user1 = build1({ name: 'sdf', admin: true });

    // Type error as desired: Object literal may only specify known properties, and 'foo' does not exist in type 'User'
    build1({ name: 'sdf', admin: true, foo: 'sdf' });

    // Types the resulting object as desired (eg. with `admin: true` instead of `boolean`)
    // but no type error due to the extra `foo` param
    const user2 = build2({
      name: 'sdf',
      admin: true,
      address: { ids: 1, city: 'sdf' },
    });

    build3({ name: 'sdf', admin: true, foo: 'sdf' });
    const user3 = build3({ name: 'sdf', admin: true });
    // const build = <T extends DeepPartial<User>>(params: T): User & T => {
    //   return {
    //     name: 'Bill',
    //     admin: false,
    //     ...params,
    //   };
    // };

    // build({ sdf: 'sdf', id: 1 });
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
});
