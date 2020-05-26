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
