import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('creates the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });

  // https://www.typescriptlang.org/docs/handbook/generics.html
  // I wonder if it might make sense to require classes to be made for types, then can do like createInstance in above??
  describe('build shorthand', () => {
    it('calls build', () => {
      const user = factories.user.build({ name: 'susan' });
      expect(user.id).not.toBeNull();
    });
  });
});
