import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('builds the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });
});
