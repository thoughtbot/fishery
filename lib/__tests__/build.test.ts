import { createFactory } from 'fishery';

describe('build', () => {
  it('builds the object', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' }),
    });

    const user = factory.build({ id: 2, name: 'Susan' });
    expect(user.id).toBe(2);
    expect(user.name).toEqual('Susan');

    // @ts-expect-error id should be typed as number
    factory.build({ id: '1' });

    // @ts-expect-error extra param should error
    factory.build({ sdf: true, name: 'Susan' });
  });

  it('can leave out params when building', () => {
    const factory = createFactory({ build: () => ({ id: 1, name: 'John' }) });

    // can leave out params
    const user = factory.build({ name: 'Susan' });
    expect(user.id).toEqual(1);
  });

  it('works with nested parameters', () => {
    const factory = createFactory({
      build: () => ({ id: 1, address: { city: 'Austin', state: 'TX' } }),
    });

    factory.build({
      // @ts-expect-error extra nested property should be error
      address: { foo: 'sdf', state: 'sdf' },
    });

    const user = factory.build({
      id: 2,
      address: { city: 'San Antonio' },
    });

    expect(user.id).toBe(2);
    expect(user.address.city).toEqual('San Antonio');
    expect(user.address.state).toEqual('TX'); // preserves nested default
  });
});
