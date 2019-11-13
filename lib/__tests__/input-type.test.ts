import { Factory, HookFn, register } from 'fishery';
import { factories } from './sample-app/factories';

describe('Input types', () => {
  interface User {
    firstName: string;
    lastName: string;
    address: { city: string; state: string; country: string };
  }

  interface UserTransientParams {
    city: string;
    state: string;
    country: string;
    name: string;
  }

  const userFactory = Factory.define<User, any, UserTransientParams>(
    ({ transientParams }) => {
      const {
        name = 'Sharon Jones',
        city = 'Grand Rapids',
        state = 'MI',
        country = 'USA',
      } = transientParams;

      const [firstName, lastName] = name.split(' ');

      return {
        firstName,
        lastName,
        address: {
          city,
          state,
          country,
        },
      };
    },
  );

  const factories = register({
    user: userFactory,
  });

  it('uses default when no transient param passed', () => {
    const user = factories.user.build();
    expect(user.address.country).toEqual('USA');
  });

  it('allows specifying different input type than output type', () => {
    const userUSA = factories.user.build(null, { state: 'IL' });
    expect(userUSA.address.state).toEqual('IL');
  });

  it('does not copy the input type properties to the built object', () => {
    const user = factories.user.build(null, { country: 'USA' });
    expect((user as any).country).toBeUndefined();
  });

  it('can override transient params with regular params', () => {
    const user = factories.user.build(
      { firstName: 'Sue' },
      { name: 'Joe Smith' },
    );
    expect(user).toMatchObject({
      firstName: 'Sue',
      lastName: 'Smith',
    });
  });
});
