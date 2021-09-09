import { Factory } from 'fishery';

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
  it('defines a function that is called to create', async () => {
    const onCreate = jest.fn(user => {
      user.id = '123';
      return Promise.resolve(user);
    });
    const user = await userFactory.onCreate(onCreate).create();
    expect(user.id).toEqual('123');
    expect(onCreate).toHaveBeenCalledWith(user);
  });

  it('calls chained or inherited onCreates sequentially', async () => {
    const onCreate1 = jest.fn(user => {
      user.id = 'a';
      return Promise.resolve(user);
    });
    const onCreate2 = jest.fn(user => {
      user.id = 'b';
      return Promise.resolve(user);
    });

    const user = await userFactory
      .onCreate(onCreate1)
      .onCreate(onCreate2)
      .create();
    expect(user.id).toEqual('b');
    expect(onCreate1).toHaveBeenCalledTimes(1);
    expect(onCreate2).toHaveBeenCalledTimes(1);
  });

  it('calls onCreate from the generator function before those later defined by builder', async () => {
    const onCreateGenerator = jest.fn(user => {
      user.id = 'generator';
      return Promise.resolve(user);
    });
    const onCreateBuilder = jest.fn(user => {
      user.id = 'builder';
      return Promise.resolve(user);
    });

    type User = { id: string };
    const userFactory = Factory.define<User>(({ onCreate }) => {
      onCreate(onCreateGenerator);
      return { id: '1' };
    });

    const user = await userFactory.onCreate(onCreateBuilder).create();
    expect(user.id).toEqual('builder');
    expect(onCreateGenerator).toHaveBeenCalledTimes(1);
    expect(onCreateBuilder).toHaveBeenCalledTimes(1);
  });

  it('does not modify the original factory', async () => {
    const onCreate = (user: User) => {
      user.id = 'onCreate';
      return Promise.resolve(user);
    };

    userFactory.onCreate(onCreate);
    const user = await userFactory.create();
    expect(user.id).toEqual('1');
  });

  it('chains return values from onCreate hooks', async () => {
    const onCreate1 = jest.fn(async user => {
      return Promise.resolve(userFactory.build({ id: 'onCreate1' }));
    });
    const onCreate2 = jest.fn(async user => {
      user.firstName = 'onCreate2';
      return Promise.resolve(user);
    });
    const user = await userFactory
      .onCreate(onCreate1)
      .onCreate(onCreate2)
      .create();
    expect(user.id).toEqual('onCreate1');
    expect(user.firstName).toEqual('onCreate2');
  });

  it('rejections are handled', async () => {
    const onCreate = jest.fn(async user => {
      user.id = 'rejection';
      return Promise.reject(user);
    });
    await expect(userFactory.onCreate(onCreate).create()).rejects.toMatchObject(
      { id: 'rejection' },
    );
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
  interface AdminUser extends User {
    admin: true;
    adminPrivileges: string[];
  }

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

  it('adds parameters for a sub-type which are then also accepted in build()', () => {
    const adminFactory = userFactory.params<AdminUser>({
      admin: true,
      adminPrivileges: ['any-privilege'],
    });

    expect(adminFactory.build()).toEqual({
      admin: true,
      adminId: null,
      adminPrivileges: ['any-privilege'],
      firstName: 'Yussef',
      id: '1',
      lastName: 'Sanchez',
      memberId: null,
      post: { id: '1' },
      registered: false,
    });
    expect(
      adminFactory.build({ adminPrivileges: ['changed-privilege'] }),
    ).toEqual({
      admin: true,
      adminId: null,
      adminPrivileges: ['changed-privilege'],
      firstName: 'Yussef',
      id: '1',
      lastName: 'Sanchez',
      memberId: null,
      post: { id: '1' },
      registered: false,
    });
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
