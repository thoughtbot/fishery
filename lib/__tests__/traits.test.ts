import { createFactory } from 'fishery';

describe('traits', () => {
  it('returns a new factory with correct type', () => {
    type User = { name: string; admin: boolean };
    type AdminUser = User & { admin: true };

    const factory = createFactory({
      build: () => ({ name: 'Bob', admin: false } as User),
      traits: {
        admin: () => ({ admin: true as const }),
        bill: () => ({ foo: 'bar' }),
      },
    });

    const adminFactory = factory.admin();
    const admin: AdminUser = adminFactory.build({});

    // @ts-expect-error will always return false
    admin.admin === false;

    expect(admin.admin).toBe(true);
  });

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

  it('errors if doesnt return a partial of the factory type', () => {
    type User = { name: string; admin: boolean };

    const factory = createFactory({
      build: () => ({ name: 'Bob', admin: false } as User),
      traits: {
        // @ts-expect-error foo: 'bar' doesn't exist on User
        blah: () => ({ foo: 'bar' }),
      },
    });

    factory.blah();
  });
});
