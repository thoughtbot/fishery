import { register, Factory, HookFn } from 'fishery';

interface Post {
  id: number;
}

interface User {
  post: Post;
}

const userFactory = Factory.define<User>(({ factories }) => ({
  post: factories.post.build(),
}));
const postFactory = Factory.define<Post>(() => ({ id: 1 }));

describe('register', () => {
  it('returns an object of the same type as passed in, with factories set', () => {
    const factories = register({
      user: userFactory,
      post: postFactory,
    });

    expect(factories.user).toEqual(userFactory);
    expect(factories.post).toEqual(postFactory);
    expect(factories.user.build().post.id).toBe(1);
  });

  it('raises an error if trying to access `factories` argument when factory not registered', () => {
    const userFactory = Factory.define<User>(({ factories }) => ({
      post: factories.post.build(),
    }));

    expect(() => userFactory.build()).toThrowError(
      "Attempted to call 'factories.post', but 'factories' is undefined. Register your factories with 'register' before use if using the 'factories' argument",
    );
  });

  it("can use a factory without registering as long as it doesn't access 'factories'", () => {
    const postFactory = Factory.define<Post>(() => ({
      id: 1,
    }));

    expect(postFactory.build().id).toEqual(1);
  });
});
