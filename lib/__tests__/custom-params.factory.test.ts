import { Factory, DeepPartial } from 'fishery';

class DateTime {
  private constructor(public date: Date) {}

  toISO(): string {
    return this.date.toISOString();
  }

  static fromISO(iso: string): DateTime {
    return new DateTime(new Date(iso));
  }
}

type User = {
  id: string;
  createdAt: DateTime;
  updatedAt: DateTime;
};

type UserWithOptionalCreatedAt = DeepPartial<User> & {
  createdAt?: DateTime;
};

Factory.define<User, {}, User>(
  // @ts-expect-error
  ({ params }) => {
    const createdAt = DateTime.fromISO(new Date().toISOString());
    // As params.createdAt is DeepPartialObject<DateTime>, updatedAt ends up being DeepPartialObject<DateTime>
    const updatedAt = params.createdAt ?? createdAt;

    return {
      id: '3',
      createdAt,
      updatedAt,
    };
  },
);

const userFactory = Factory.define<User, {}, User, UserWithOptionalCreatedAt>(
  ({ params }) => {
    const createdAt = DateTime.fromISO(new Date().toISOString());
    const updatedAt = params.createdAt ?? createdAt;

    return {
      id: '3',
      createdAt,
      updatedAt,
    };
  },
);

describe('factory.build', () => {
  it('builds the object without params', () => {
    const user = userFactory.build();
    expect(user.id).not.toBeNull();
    expect(user.createdAt.toISO()).not.toBeNull();
    expect(user.updatedAt.toISO()).toEqual(user.createdAt.toISO());
  });

  it('builds the object with a custom params', () => {
    const date = DateTime.fromISO('2022');
    const user = userFactory.build({ createdAt: date });
    expect(user.id).not.toBeNull();
    expect(user.createdAt.toISO()).toEqual(date.toISO());
    expect(user.updatedAt.toISO()).toEqual(date.toISO());
  });
});
