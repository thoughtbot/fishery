import { register, Factory } from 'fishery';

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
class UserFactory extends Factory<User, any, TransientParams> {
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

register({ user: userFactory, post: postFactory });

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
    const userFactory = Factory.defineUnregistered<User>(({ afterBuild }) => {
      afterBuild(afterBuildGenerator);
      return { id: '1' };
    });

    const user = userFactory.afterBuild(afterBuildBuilder).build();
    expect(user.id).toEqual('builder');
    expect(afterBuildGenerator).toHaveBeenCalledTimes(1);
    expect(afterBuildBuilder).toHaveBeenCalledTimes(1);
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
