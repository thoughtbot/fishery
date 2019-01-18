import { Factory } from '../factory';

type User = {
  id: string;
  name: string;
};

Factory.define<User>('user', ({ sequence }) => {
  const name = 'Bob';
  return {
    id: `user-${sequence}`,
    name,
  };
});

describe('Factory.build', () => {
  it('creates the object', () => {
    const user = Factory.build<User>('user', { name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });

  // https://www.typescriptlang.org/docs/handbook/generics.html
  // I wonder if it might make sense to require classes to be made for types, then can do like createInstance in above??
  describe('build shorthand', () => {
    it('calls build', () => {
      const user = Factory.build<User>('user', { name: 'susan' });
      expect(user.id).not.toBeNull();
    });
  });
});
