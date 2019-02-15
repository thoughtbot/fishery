import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('creates the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });
});
