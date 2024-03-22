import { Factory, HookFn } from 'fishery';

type User = {
  id: string;
  name: string;
  address?: { city: string; state: string };
};

const userFactory = Factory.define<User>(({ onCreate, sequence }) => {
  onCreate(user => user);
  const name = 'Bob';
  return {
    id: `user-${sequence}`,
    name,
    address: {
      city: 'Detroit',
      state: 'MI',
    },
  };
});

type Post = {
  id: number;
};

type Author = {
  id: number;
  posts?: Post[];
};

const postFactory = Factory.define<Post>(({ sequence }) => {
  return {
    id: sequence,
  };
});

const authorFactory = Factory.define<Author>(({ sequence }) => ({
  id: sequence,
  posts: postFactory.buildList(5),
}));

describe('factory.build', () => {
  it('builds the object', () => {
    const user = userFactory.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
    expect(user.address?.state).toEqual('MI');
  });

  it('accepts partials of nested objects', () => {
    const user = userFactory.build({ address: { city: 'Ann Arbor' } });
    expect(user.address).toMatchObject({ city: 'Ann Arbor', state: 'MI' });
  });
});

describe('factory.buildList', () => {
  it('builds a list of objects with the specified properties', () => {
    const users = userFactory.buildList(2, { name: 'susan' });
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });

  it('build lists with different posts for each author', () => {
    const authorList = authorFactory.buildList(2);
    console.log(JSON.stringify(authorList, null, 2));
    expect(authorList[0].id).not.toEqual(authorList[1].id);

    const firstAuthor = authorList[0];
    const firstAuthorPosts = firstAuthor?.posts;
    const secondAuthor = authorList[1];
    const secondAuthorPosts = secondAuthor?.posts;

    // expect to have different posts for each author
    expect(firstAuthorPosts?.[0].id).not.toEqual(secondAuthorPosts?.[0].id);
  });

  it('build lists with same posts for each author', () => {
    const authorList = authorFactory.buildList(2, {
      posts: postFactory.buildList(5),
    });
    console.log(JSON.stringify(authorList, null, 2));
    expect(authorList[0].id).not.toEqual(authorList[1].id);

    const firstAuthor = authorList[0];
    const firstAuthorPosts = firstAuthor?.posts;
    const secondAuthor = authorList[1];
    const secondAuthorPosts = secondAuthor?.posts;

    // expect to have same posts for each author
    expect(firstAuthorPosts?.[0].id).toEqual(secondAuthorPosts?.[0].id);
  });

  it('calls afterBuild for each item', () => {
    const afterBuildFn = jest.fn(user => {
      user.name = 'Bill';
    });

    const factory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(afterBuildFn);
      return { id: '1', name: 'Ralph' };
    });

    expect(factory.buildList(2).every(u => u.name === 'Bill')).toBeTruthy();
    expect(afterBuildFn).toHaveBeenCalledTimes(2);
  });
});

describe('factory.create', () => {
  it('creates the object with a promise', async () => {
    const promise = userFactory.create({ name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const user = await promise;
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
    expect(user.address?.state).toEqual('MI');
  });

  it('returns the type specified by the third type parameter', async () => {
    type UserBeforeSave = {
      name: string;
    };

    type User = {
      name: string;
      id: number;
    };

    const factory = Factory.define<UserBeforeSave, any, User>(
      ({ onCreate }) => {
        onCreate(async user => {
          return { ...user, id: 2 };
        });

        return { name: 'Ralph' };
      },
    );

    const user = factory.build();
    const user2 = await factory.create();

    // @ts-expect-error
    user.id;

    expect(user2.id).toEqual(2);
  });
});

describe('factory.createList', () => {
  it('creates a list of objects with the specified properties', async () => {
    const promise = userFactory.createList(2, { name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const users = await promise;
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });

  it('calls onCreate for each item', async () => {
    const onCreateFn = jest.fn(user => {
      user.name = 'Bill';
      return Promise.resolve(user);
    });

    const factory = Factory.define<User>(({ onCreate }) => {
      onCreate(onCreateFn);
      return { id: '1', name: 'Ralph' };
    });

    const promise = factory.createList(2, { name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const users = await promise;
    expect(users.every(u => u.name === 'Bill')).toBeTruthy();
    expect(onCreateFn).toHaveBeenCalledTimes(2);
  });
});

describe('afterBuild', () => {
  it('passes the object for manipulation', () => {
    const factory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(user => {
        user.id = 'bla';
      });

      return { id: '1', name: 'Ralph' };
    });

    expect(factory.build().id).toEqual('bla');
  });

  describe('when not a function', () => {
    it('raises an error', () => {
      const factory = Factory.define<User>(({ afterBuild }) => {
        afterBuild('5' as unknown as HookFn<User>);
        return { id: '1', name: 'Ralph' };
      });

      expect(() => {
        factory.build();
      }).toThrowError(/must be a function/);
    });
  });
});

describe('onCreate', () => {
  it('defines a function that is called on create', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(({ onCreate }) => {
      onCreate(user => {
        user.id = 'bla';
        return Promise.resolve(user);
      });

      return { id: '1' };
    });

    const user = await factory.create();
    expect(user.id).toEqual('bla');
  });
});
