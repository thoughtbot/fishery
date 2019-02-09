import { Factory, HookFn, register } from 'fishery';

interface Post {
  title: string;
  user: User;
}
interface User {
  name: string;
  posts: Array<Post>;
}

interface Factories {
  user: Factory<User>;
  post: Factory<Post>;
}

describe('associations', () => {
  it('can access named factories object in generator fn', () => {
    expect.assertions(2);
    const factory = Factory.define<User, Factories>(({ factories }) => {
      // TODO: type assertions https://github.com/Microsoft/dtslint#write-tests
      expect((factories as any).bla.build).not.toBeUndefined();
      expect(factories.post).toBeUndefined();
      return {} as User;
    });

    register({ bla: factory });
    factory.build();
  });

  it('can create inverse associations', () => {
    const userFactory = Factory.define<User, Factories>(
      ({ factories, instance }) => ({
        name: 'Bob',
        posts: [factories.post.build({ user: instance })],
      }),
    );

    const postFactory = Factory.define<Post, Factories>(
      ({ factories, instance, params }) => ({
        title: 'A Post',
        user: params.user || factories.user.build({ posts: [instance] }),
      }),
    );

    register({
      user: userFactory,
      post: postFactory,
    });

    const user = userFactory.build();
    expect(user.name).toEqual('Bob');
    expect(user.posts[0]).toMatchObject({ title: 'A Post', user });
  });
});
