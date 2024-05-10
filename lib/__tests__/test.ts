import { Factory } from '../factory';

type Post = {
  id: number;
};

type Author = {
  id: number;
  posts?: Post[];
};

type AuthorTransientParams = {
  shouldHavePosts: boolean;
};

const PostFactory = Factory.define<Post>(({ sequence }) => {
  return {
    id: sequence,
  };
});

const AuthorFactory = Factory.define<Author>(({ sequence }) => ({
  id: sequence,
  posts: PostFactory.buildList(5), // Attach 'commonPost' trait to posts
}));

const AuthorFactoryWithOptionalPosts = Factory.define<
  Author,
  AuthorTransientParams
>(({ sequence, transientParams }) => {
  const { shouldHavePosts = true } = transientParams;
  return {
    id: sequence,
    posts: shouldHavePosts ? PostFactory.buildList(5) : undefined,
  };
});

class UserFactory extends Factory<Author> {
  withPosts(posts?: Post[]) {
    return this.params({
      posts: posts || PostFactory.buildList(5),
    });
  }
}

const userFactorySamePosts = UserFactory.define(({ sequence }) => {
  return {
    id: sequence,
  };
});

const userFactoryDifferentPosts = UserFactory.define(({ sequence }) => {
  return {
    id: sequence,
    posts: PostFactory.buildList(5),
  };
});

class UltimateUserFactory extends Factory<Author, AuthorTransientParams> {
  withPosts(posts?: Post[]) {
    return this.params({
      posts: posts || PostFactory.buildList(5),
    });
  }
}

const ultimateUserFactory = UltimateUserFactory.define(
  ({ sequence, transientParams }) => {
    const { shouldHavePosts = true } = transientParams;
    return {
      id: sequence,
      posts: shouldHavePosts ? PostFactory.buildList(5) : undefined,
    };
  },
);

describe('Different factories', () => {
  describe('AuthorFactoryWithOptionalPosts', () => {
    it('builds users with unique posts', () => {
      const users = AuthorFactoryWithOptionalPosts.buildList(
        5,
        {},
        {
          transient: {
            shouldHavePosts: true,
          },
        },
      );
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).not.toEqual(users[1].posts[0].id);
      }
    });
    it('builds users with no posts', () => {
      const users = AuthorFactoryWithOptionalPosts.buildList(
        5,
        {},
        {
          transient: {
            shouldHavePosts: false,
          },
        },
      );
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toBeUndefined();
      });
    });
  });
  describe('userFactorySamePosts', () => {
    it('case withPosts builds users with same posts', () => {
      const users = userFactorySamePosts.withPosts().buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).toEqual(users[1].posts[0].id);
      }
    });
    it('case without withPosts', () => {
      const users = userFactorySamePosts.buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toBeUndefined();
      });
    });
  });
  describe('userFactoryDifferentPosts', () => {
    it('case without withPosts builds users with unique posts', () => {
      const users = userFactoryDifferentPosts.buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).not.toEqual(users[1].posts[0].id);
      }
    });
    it('case withPosts builds users with same posts', () => {
      const users = userFactoryDifferentPosts.withPosts().buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).toEqual(users[1].posts[0].id);
      }
    });
    it('builds users with no posts', () => {
      // Not possible to build users with no posts
    });
  });
  describe('ultimateUserFactory', () => {
    it('builds users with unique posts', () => {
      const users = ultimateUserFactory.buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).not.toEqual(users[1].posts[0].id);
      }
    });
    it('case withPosts builds users with same posts', () => {
      const users = ultimateUserFactory.withPosts().buildList(5);
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toHaveLength(5);
      });
      if (users[0].posts && users[1].posts) {
        expect(users[0].posts[0].id).toEqual(users[1].posts[0].id);
      }
    });
    it('builds users with no posts', () => {
      const users = ultimateUserFactory.buildList(
        5,
        {},
        {
          transient: {
            shouldHavePosts: false,
          },
        },
      );
      expect(users).toHaveLength(5);
      users.forEach(user => {
        expect(user.posts).toBeUndefined();
      });
    });
  });
});
