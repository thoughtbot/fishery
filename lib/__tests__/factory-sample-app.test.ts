import { factories } from './sample-app/factories';

describe('Factory.build', () => {
  it('builds the object', () => {
    const user = factories.user.build({ name: 'susan' });
    expect(user.id).not.toBeNull();
    expect(user.created).not.toBe(true);
    expect(user.name).toEqual('susan');
  });
});

describe('Factory.create', () => {
  it('creates the object', async () => {
    const promise = factories.user.create({ name: 'susan' });
    expect(promise).toBeInstanceOf(Promise);

    const user = await promise;
    expect(user.id).not.toBeNull();
    expect(user.created).toBe(true);
    expect(user.name).toEqual('susan');
  });
});
