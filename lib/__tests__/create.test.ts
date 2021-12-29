import { createFactory } from 'fishery';

describe('create', () => {
  it('infers the return type when defined', async () => {
    const factory = createFactory({
      build: () => ({ name: 'Bob', id: 1 }),
      create: async obj => ({ ...obj, id: 2 }),
    });

    const user = await factory.create();
    expect(user.id).toEqual(2);
  });

  it('only allows factory.create if defined with createFactory', () => {
    const factory = createFactory({ build: () => ({ name: 'Bob', id: 1 }) });

    // @ts-expect-error create not defined
    factory.create();
  });
});
