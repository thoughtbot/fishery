import { Factory } from 'fishery';
import { sleep } from '../helpers/sleep';

type Post = { id: string };
type User = {
  id: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  adminId: string | null;
  registered: boolean;
  memberId: string | null;
  post: Post;
};

const postFactory = Factory.define<Post>(() => ({ id: '1' }));

type TransientParams = { registered: boolean };
class UserFactory extends Factory<User, TransientParams> {
  admin(adminId = '') {
    return this.params({
      admin: true,
      adminId: adminId || `admin-${this.sequence()}`,
    });
  }

  registered() {
    return this.transient({ registered: true });
  }
}

const userFactory = UserFactory.define(({ associations, transientParams }) => {
  const { registered = false } = transientParams;
  const memberId = registered ? '1' : null;

  return {
    id: '1',
    admin: false,
    adminId: null,
    firstName: 'Yussef',
    lastName: 'Sanchez',
    registered,
    memberId,
    post: associations.post || postFactory.build(),
  };
});

describe('afterBuild', () => {
  it('defines a function that is called after build', () => {
    const afterBuild = jest.fn(user => {
      user.id = '123';
      return user;
    });
    const user = userFactory.afterBuild(afterBuild).build();
    expect(user.id).toEqual('123');
    expect(afterBuild).toHaveBeenCalledWith(user);
  });

  it('calls chained or inherited afterBuilds sequentially', () => {
    const afterBuild1 = jest.fn(user => {
      user.id = 'a';
      return user;
    });
    const afterBuild2 = jest.fn(user => {
      user.id = 'b';
      return user;
    });

    const user = userFactory
      .afterBuild(afterBuild1)
      .afterBuild(afterBuild2)
      .build();
    expect(user.id).toEqual('b');
    expect(afterBuild1).toHaveBeenCalledTimes(1);
    expect(afterBuild2).toHaveBeenCalledTimes(1);
  });

  it('calls afterBuild from the generator function before those later defined by builder', () => {
    const afterBuildGenerator = jest.fn(user => {
      user.id = 'generator';
      return user;
    });
    const afterBuildBuilder = jest.fn(user => {
      user.id = 'builder';
      return user;
    });

    type User = { id: string };
    const userFactory = Factory.define<User>(({ afterBuild }) => {
      afterBuild(afterBuildGenerator);
      return { id: '1' };
    });

    const user = userFactory.afterBuild(afterBuildBuilder).build();
    expect(user.id).toEqual('builder');
    expect(afterBuildGenerator).toHaveBeenCalledTimes(1);
    expect(afterBuildBuilder).toHaveBeenCalledTimes(1);
  });

  it('does not modify the original factory', async () => {
    const afterBuild = (user: User) => {
      user.id = 'afterBuild';
      return user;
    };

    userFactory.afterBuild(afterBuild);
    const user = userFactory.build();
    expect(user.id).toEqual('1');
  });
});

describe('onCreate', () => {
  it('defines a function that is called on create', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(() => ({ id: '1' }));

    const user = await factory
      .onCreate(user => {
        user.id = 'bla';
        return user;
      })
      .create();
    expect(user.id).toEqual('bla');
  });

  it('overrides onCreate from the generator', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(({ onCreate }) => {
      onCreate(user => {
        user.id = 'generator';
        return user;
      });

      return { id: '1' };
    });

    const user = await factory
      .onCreate(user => {
        user.id = 'builder';
        return user;
      })
      .create();
    expect(user.id).toEqual('builder');
  });

  it('raises an error if onCreate was not defined', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(() => ({ id: '1' }));

    await expect(() => factory.create()).rejects.toHaveProperty(
      'message',
      'Attempted to call `create`, but no onCreate defined',
    );
  });
});

describe('afterCreate', () => {
  it('defines a function that is called after the onCreate', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(() => ({ id: '1' }));
    const afterCreate = jest.fn(user => {
      user.id = 'afterCreate';
      return Promise.resolve(user);
    });

    const user = await factory
      .onCreate(user => {
        user.id = 'onCreate';
        return user;
      })
      .afterCreate(afterCreate)
      .create();

    expect(user.id).toEqual('afterCreate');
  });

  it('calls chained or inherited afterCreates sequentially', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(() => ({ id: '1' }));

    const afterCreate1 = jest.fn(async user => {
      user.id = 'afterCreate1';
      sleep(10);
      return user;
    });

    const afterCreate2 = jest.fn(user => {
      user.id = 'afterCreate2';
      return Promise.resolve(user);
    });

    const user = await factory
      .onCreate(u => u)
      .afterCreate(afterCreate1)
      .afterCreate(afterCreate2)
      .create();
    expect(user.id).toEqual('afterCreate2');
    expect(afterCreate1).toHaveBeenCalledTimes(1);
    expect(afterCreate2).toHaveBeenCalledTimes(1);
  });

  it('calls afterCreate from the generator function before those later defined by builder', async () => {
    const afterCreateGenerator = jest.fn(user => {
      user.id = 'generator';
      return Promise.resolve(user);
    });
    const afterCreateBuilder = jest.fn(user => {
      user.id = 'builder';
      return Promise.resolve(user);
    });

    type User = { id: string };
    const userFactory = Factory.define<User>(({ afterCreate, onCreate }) => {
      onCreate(user => user);
      afterCreate(afterCreateGenerator);
      return { id: '1', name: '1' };
    });

    const user = await userFactory.afterCreate(afterCreateBuilder).create();
    expect(user.id).toEqual('builder');
    expect(afterCreateGenerator).toHaveBeenCalledTimes(1);
    expect(afterCreateBuilder).toHaveBeenCalledTimes(1);
  });

  it('chains return values from afterCreate hooks', async () => {
    type User = { id: string };
    const factory = Factory.define<User>(() => ({ id: '1' }));

    const afterCreate1 = jest.fn(async (user: User) => {
      user.id = 'afterCreate1';
      return user;
    });

    const afterCreate2 = jest.fn(async user => {
      user.id = 'afterCreate2';
      return user;
    });

    const user = await factory
      .onCreate(user => {
        user.id = 'onCreate';
        return user;
      })
      .afterCreate(afterCreate1)
      .afterCreate(afterCreate2)
      .create();
    expect(user.id).toEqual('afterCreate2');
  });

  it('rejects if afterCreate fails', async () => {
    const afterCreate = jest.fn(async user => {
      return Promise.reject('failed');
    });
    await expect(
      userFactory
        .onCreate(user => user)
        .afterCreate(afterCreate)
        .create(),
    ).rejects.toEqual('failed');
  });
});

describe('associations', () => {
  it('adds associations that are then used for build', () => {
    const user = userFactory.associations({ post: { id: '2' } }).build();
    expect(user.post.id).toEqual('2');
  });

  it('does not persist the associations to the factory', () => {
    userFactory.associations({ post: { id: '2' } });
    expect(userFactory.build().post.id).toEqual('1');
  });
});

describe('params', () => {
  it('adds parameters that are then used for build', () => {
    const user = userFactory.params({ admin: true }).build();
    expect(user.admin).toBe(true);
  });

  it('does not persist the parameters to the factory', () => {
    userFactory.params({ admin: true });
    expect(userFactory.build().admin).toBe(false);
  });

  it('persists the parameters to the returned factory for reuse', () => {
    const adminFactory = userFactory.admin();
    expect(adminFactory.build().admin).toBe(true);
    expect(adminFactory.build().admin).toBe(true);
  });
});

describe('transient', () => {
  it('adds transient params to the factory', () => {
    const user = userFactory.transient({ registered: true }).build();
    expect(user.memberId).toEqual('1');
  });

  it('does not persist the transient params to the factory', () => {
    userFactory.transient({ registered: true });
    expect(userFactory.build().registered).toBe(false);
  });
});
