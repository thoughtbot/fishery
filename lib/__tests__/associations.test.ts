import { Factory, register } from 'fishery';

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

  it('can create bi-directional has-many/belongs-to associations', () => {
    const userFactory = Factory.define<User, Factories>(
      ({ factories, afterBuild, transientParams }) => {
        const { skipPosts } = transientParams;

        afterBuild(user => {
          if (!skipPosts) {
            user.posts.push(
              factories.post.build({}, { associations: { user } }),
            );
          }
        });

        return {
          name: 'Bob',
          posts: [],
        };
      },
    );

    const postFactory = Factory.define<Post, Factories>(
      ({ factories, associations }) => {
        return {
          title: 'A Post',
          user:
            associations.user ||
            factories.user.build({}, { transient: { skipPosts: true } }),
        };
      },
    );

    register({
      user: userFactory,
      post: postFactory,
    });

    const user = userFactory.build();
    expect(user.name).toEqual('Bob');
    expect(user.posts[0].user).toEqual(user);
  });
});
