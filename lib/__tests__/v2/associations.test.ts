import { Factory } from 'fishery';

interface Post {
  title: string;
  user: User;
}

interface User {
  name: string;
  posts: Array<Post>;
}

describe('associations', () => {
  it('can create bi-directional has-many/belongs-to associations', () => {
    const userFactory = Factory.define<User>(
      ({ afterBuild, transientParams }) => {
        const { skipPosts } = transientParams;

        afterBuild(user => {
          if (!skipPosts) {
            user.posts.push(postFactory.build({}, { associations: { user } }));
          }
        });

        return {
          name: 'Bob',
          posts: [],
        };
      },
    );

    const postFactory = Factory.define<Post>(({ associations }) => {
      return {
        title: 'A Post',
        user:
          associations.user ||
          userFactory.build({}, { transient: { skipPosts: true } }),
      };
    });

    const user = userFactory.build();
    expect(user.name).toEqual('Bob');
    expect(user.posts[0].user).toEqual(user);
  });
});
