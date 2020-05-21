import { register, Factory, HookFn } from 'fishery';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  adminId: string | null;
}

class UserFactory extends Factory<User> {
  susan() {
    return this.params({ firstName: 'Susan' });
  }

  admin(adminId = '') {
    return this.params({
      admin: true,
      adminId: adminId || `admin-${this.sequence()}`,
    });
  }
}

const userFactory = UserFactory.define(() => ({
  id: '1',
  admin: false,
  adminId: null,
  firstName: 'Bob',
  lastName: 'Sanchez',
  registered: false,
  memberId: null,
}));

const factories = register({ user: userFactory });

describe('traits', () => {
  it('adds parameters that are then used for build', () => {
    const user = userFactory.admin().build();
    expect(user).toMatchObject({
      admin: true,
      adminId: expect.any(String),
    });
  });

  it('can be chained', () => {
    const user = userFactory
      .admin()
      .susan()
      .build();
    expect(user).toMatchObject({
      admin: true,
      firstName: 'Susan',
    });
  });

  it('does not persist the parameters to the factory', () => {
    userFactory.admin();
    const user = userFactory.build();
    expect(user.admin).toBe(false);
  });

  it('can be stored in a variable and reused as a new factory', () => {
    const adminFactory = userFactory.admin();
    expect(adminFactory.build().admin).toBe(true);
    expect(adminFactory.build().admin).toBe(true);
  });

  it('works with registered factories', () => {
    const user = factories.user.admin().build();
    expect(user.admin).toBe(true);
  });

  it('can be registered as a new factory', () => {
    const factories = register({
      user: userFactory,
      admin: userFactory.admin(),
    });
    const admin = factories.admin.build();
    expect(admin.admin).toBe(true);
  });
});
