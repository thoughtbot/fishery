import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('creates the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.name).toEqual('susan');
  });
});

describe('Factory.rewindSequence', () => {
  beforeEach(() => {
    factories.user.rewindSequence();
  });

  it('creates the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).toBe('user-0');
    expect(user.name).toBe('susan');
  });

  it('sets sequence back to zero after beforeEach hook', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).toBe('user-0');
    expect(user.name).toBe('susan');
  });
});
