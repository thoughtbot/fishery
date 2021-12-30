import { createFactory } from 'fishery';

describe('factory.params', () => {
  it('returns a new factory with params added to type', () => {
    enum Status {
      ACTIVE,
      INACTIVE,
    }
    type User = { name: string; status: Status };

    const factory = createFactory({
      build: () => ({ name: 'Bob', status: Status.INACTIVE } as User),
    });

    const activeFactory = factory.params({ status: Status.ACTIVE });
    const user = activeFactory.build();

    // @ts-expect-error will always return false, compiler knows status is active
    user.status === Status.INACTIVE;

    expect(user.status).toEqual(Status.ACTIVE);
  });
});
