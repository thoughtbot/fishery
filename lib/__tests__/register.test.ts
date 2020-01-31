import { register, Factory, HookFn } from 'fishery';

interface Post {
  id: number;
}

describe('register', () => {
  it('returns an object of the same type as passed in, with factories set', () => {
    interface User {
      post: Post;
    }

    const userFactory = Factory.define<User>(({ factories }) => ({
      post: factories.post.build(),
    }));
    const postFactory = Factory.define<Post>(() => ({ id: 1 }));

    const factories = register({
      user: userFactory,
      post: postFactory,
    });

    expect(factories.user).toEqual(userFactory);
    expect(factories.post).toEqual(postFactory);
    expect(factories.user.build().post.id).toBe(1);
  });

  it('raises an error if trying to build with a factory when factory not registered', () => {
    const postFactory = Factory.define<Post>(() => ({ id: 1 }));
    expect(() => postFactory.build()).toThrowError(
      'Your factory has not been registered. Call `register` before using factories or define your factory with `defineUnregistered` instead of `define`',
    );
  });

  it("can use a factory without registering if defined with 'defineUnregistered'", () => {
    const postFactory = Factory.defineUnregistered<Post>(() => ({
      id: 1,
    }));

    expect(postFactory.build().id).toEqual(1);
  });
});
