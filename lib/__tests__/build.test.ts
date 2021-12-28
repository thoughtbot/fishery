import { createFactory } from 'fishery';
import { User } from './helpers/test-types';

describe('build', () => {
  it('builds the object', () => {
    const factory = createFactory({
      build: () => ({ id: 1, name: 'Bob' } as User),
    });

    const user = factory.build({ id: 2 as const, name: 'Susan' });
    expect(user.id).toBe(1);
    expect(user.name).toEqual('Susan');

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
    type User = { id: number; address: { city: string; state: string } };
    const factory = createFactory({
      build: () =>
        ({ id: 1, address: { city: 'Austin', state: 'TX' } } as User),
    });

    factory.build({
      // @ts-expect-error extra nested property should be error
      address: { foo: 'sdf', state: 'sdf' },
    });

    const user = factory.build({
      id: 2 as const,
      // @ts-expect-error extra nested property should be error
      address: { foo: 'sdf', state: 'sdf' },
    });

    expect(user.id).toBe(1);
  });
});
