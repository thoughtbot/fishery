import { Factory, HookFn, register } from 'fishery';

describe('Using with classes', () => {
  it('works correctly with read-only properties', () => {
    class User {
      constructor(readonly name: string) {}
      greet() {
        return `Hello, ${this.name}`;
      }
    }

    const userFactory = Factory.define<User>(() => new User('Sharon'));

    register({
      user: userFactory,
    });

    const user = userFactory.build();
    expect(user).toBeInstanceOf(User);
    expect(user.greet()).toEqual('Hello, Sharon');
    expect(userFactory.build({ name: 'Bob' }).name).toEqual('Bob');
  });

  // TODO: show that doesn't allow private properties (feature or bug?)
});
