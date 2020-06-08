import { Factory } from 'fishery';

describe('Transient params', () => {
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

  const userFactory = Factory.define<User, UserTransientParams>(
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

  const factories = {
    user: userFactory,
  };

  it('uses default when no transient param passed', () => {
    const user = factories.user.build();
    expect(user.address.country).toEqual('USA');
  });

  it('overrides default when passed', () => {
    const userUSA = factories.user.build({}, { transient: { state: 'IL' } });
    expect(userUSA.address.state).toEqual('IL');
  });

  it('does not copy the transient params to the built object', () => {
    const user = factories.user.build({}, { transient: { country: 'USA' } });
    expect((user as any).country).toBeUndefined();
  });

  it('can override transient params with regular params', () => {
    const user = factories.user.build(
      { firstName: 'Sue' },
      { transient: { name: 'Joe Smith' } },
    );
    expect(user).toMatchObject({
      firstName: 'Sue',
      lastName: 'Smith',
    });
  });

  it('works with buildList', () => {
    const users = factories.user.buildList(
      1,
      {},
      { transient: { city: 'Detroit' } },
    );

    expect(users[0].address.city).toEqual('Detroit');
  });
});
