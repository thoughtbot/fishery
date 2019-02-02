import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('creates the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });
});

describe('Associations', () => {
  it('works, recursively', () => {
    const user = factories.user.build();
    expect(user.post).not.toBeNull();
    expect(user.post.title).toEqual('A Post');
    expect(user.post.user).toEqual(user);
  });
});
