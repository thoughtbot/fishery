import { register, Factory } from 'fishery';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  adminId: string | null;
  registered: boolean;
  memberId: string | null;
}

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

const userFactory = UserFactory.define(({ transientParams }) => {
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
  };
});

register({ user: userFactory });

describe('afterCreate', () => {
  it('defines a function that is called after build', () => {
    const afterCreate = jest.fn(user => {
      user.id = '123';
      return user;
    });
    const user = userFactory.afterCreate(afterCreate).build();
    expect(user.id).toEqual('123');
    expect(afterCreate).toHaveBeenCalledWith(user);
  });

  it('calls chained or inherited afterCreates sequentially', () => {
    const afterCreate1 = jest.fn(user => {
      user.id = 'a';
      return user;
    });
    const afterCreate2 = jest.fn(user => {
      user.id = 'b';
      return user;
    });

    const user = userFactory
      .afterCreate(afterCreate1)
      .afterCreate(afterCreate2)
      .build();
    expect(user.id).toEqual('b');
    expect(afterCreate1).toHaveBeenCalledTimes(1);
    expect(afterCreate2).toHaveBeenCalledTimes(1);
  });

  it('calls afterCreate from the generator function before those later defined by builder', () => {
    const afterCreateGenerator = jest.fn(user => {
      user.id = 'generator';
      return user;
    });
    const afterCreateBuilder = jest.fn(user => {
      user.id = 'builder';
      return user;
    });

    type User = { id: string };
    const userFactory = Factory.defineUnregistered<User>(({ afterCreate }) => {
      afterCreate(afterCreateGenerator);
      return { id: '1' };
    });

    const user = userFactory.afterCreate(afterCreateBuilder).build();
    expect(user.id).toEqual('builder');
    expect(afterCreateGenerator).toHaveBeenCalledTimes(1);
    expect(afterCreateBuilder).toHaveBeenCalledTimes(1);
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
