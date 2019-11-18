import { Factory, HookFn, register } from 'fishery';

describe('Using with classes', () => {
  class Address {
    constructor(public city: string, public state: string) {}
  }

  class User {
    constructor(readonly name: string, public address?: Address) {}
    greet() {
      return `Hello, ${this.name}`;
    }
  }

  const userFactory = Factory.define<User>(
    () => new User('Sharon', new Address('Detroit', 'MI')),
  );

  register({
    user: userFactory,
  });

  it('works correctly with read-only properties', () => {
    const user = userFactory.build();
    expect(user).toBeInstanceOf(User);
    expect(user.greet()).toEqual('Hello, Sharon');
    expect(userFactory.build({ name: 'Bob' }).name).toEqual('Bob');
  });

  it('accepts partials of nested class objects', () => {
    const user = userFactory.build({ address: { city: 'Ann Arbor' } });
    expect(user.address).toMatchObject({ city: 'Ann Arbor', state: 'MI' });
  });

  // TODO: show that doesn't allow private properties (feature or bug?)
});
