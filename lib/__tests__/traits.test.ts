import { createFactory } from 'fishery';
import { User } from './helpers/test-types';

describe('traits', () => {
  it('returns a new factory with correct type', () => {
    type User = { name: string; admin: boolean };
    type AdminUser = User & { admin: true };

    const factory = createFactory({
      build: () => ({ name: 'Bob', admin: false } as User),
      traits: {
        admin: () => ({ admin: true as const }),
        adminStatus: (status: boolean) => ({ admin: status }),
        bill: () => ({ name: 'Bill' }),
      },
    });

    // @ts-expect-error wrong args
    factory.adminStatus('this', 'is', 'wrong');

    // @ts-expect-error does not exist
    factory.foo;

    const adminFactory = factory.admin();
    const admin = adminFactory.build({});

    // @ts-expect-error will always return false
    admin.admin === false;

    expect(admin.admin).toBe(true);
  });

  it('errors if does not return partial<T>', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Jen' } as User),

      //  Ideally, error would be at place of error, not here, This is
      //  achievable by changing traits type in else block from 'never' to
      //  TraitsInput<T>, but causes some issues with inferring T
      // @ts-expect-error
      traits: {
        admin: () => ({ admin: true }),
      },
    });

    // @ts-expect-error admin does not exist
    factory.admin();
  });

  it.todo('works with nested types');

  it('can take params', () => {
    enum Status {
      ACTIVE,
      INACTIVE,
    }
    type User = { name: string; status: Status };

    const factory = createFactory({
      build: () => ({ name: 'Bob', status: Status.INACTIVE } as User),
      traits: {
        withStatus: (status: Status) => ({ status: status }),
        active: () => ({ status: Status.ACTIVE as const }),
      },
    });

    // @ts-expect-error invalid status
    factory.withStatus('invalid-status');

    const activeStatusFactory = factory.withStatus(Status.ACTIVE);
    const user = activeStatusFactory.build();

    // does not currently error, compiler doesn't see status as literal
    user.status === Status.INACTIVE;

    expect(user.status).toEqual(Status.ACTIVE);

    const activeUser = factory.active().build();

    // @ts-expect-error will always return false, compiler knows status is active
    activeUser.status === Status.INACTIVE;
  });

  describe('when no traits defined', () => {
    it('errors on unsupported properties', () => {
      const factory = createFactory({ build: () => ({ id: 2 }) });

      // @ts-expect-error 'blah' doesn't exist on FactoryInstance
      factory.blah;
    });
  });
});
