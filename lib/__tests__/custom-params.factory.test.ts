import { Factory, DeepPartial, HookFn } from 'fishery';

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
};

type UserWithOptionalCreatedAt = DeepPartial<User> & {
  createdAt?: DateTime;
};

const userFactory = Factory.define<User, {}, User, UserWithOptionalCreatedAt>(
  ({ params }) => {
    const created =
      params.createdAt ?? DateTime.fromISO(new Date().toISOString());
    return {
      id: '3',
      createdAt: created,
    };
  },
);

describe('factory.build', () => {
  it('builds the object without params', () => {
    const user = userFactory.build();
    expect(user.id).not.toBeNull();
    expect(user.createdAt).not.toBeNull();
  });

  it('builds the object with a custom params', () => {
    const date = DateTime.fromISO('2022');
    const user = userFactory.build({ createdAt: date });
    expect(user.id).not.toBeNull();
    expect(user.createdAt.toISO()).toEqual(date.toISO());
  });
});
