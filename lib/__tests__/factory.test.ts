import { Factory } from '../factory';

type User = {
  id: string;
  name: string;
};

const userFactory = Factory.define<User>(({ sequence }) => {
  const name = 'Bob';
  return {
    id: `user-${sequence}`,
    name,
  };
});

describe('factory.build', () => {
  it('creates the object', () => {
    const user = userFactory.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });
});

describe('factory.buildList', () => {
  it('creates a list of objects with the specified properties', () => {
    const users = userFactory.buildList(2, { name: 'susan' });
    expect(users.length).toBe(2);
    expect(users[0].id).not.toEqual(users[1].id);
    expect(users.map(u => u.name)).toEqual(['susan', 'susan']);
  });
});
