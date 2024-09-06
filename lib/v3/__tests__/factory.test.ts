import { getFactory } from '../factory';

type User = {
  id: string;
  name: string;
  address?: { city: string; state: string };
};

const defaultUser: User = {
  id: 'user-1',
  name: 'Bob',
  address: {
    city: 'Detroit',
    state: 'MI',
  },
};

describe('factory.build', () => {
  it('builds the object', () => {
    const userFactory = getFactory();
    const user = userFactory.build(defaultUser, {
      name: 'susan',
    });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
    expect(user.address?.state).toEqual('MI');
  });

  it('accepts partials of nested objects', () => {
    const userFactory = getFactory();
    const user = userFactory.build(defaultUser, {
      address: { city: 'Ann Arbor' },
    });

    expect(user.address).toMatchObject({ city: 'Ann Arbor', state: 'MI' });
  });
});
