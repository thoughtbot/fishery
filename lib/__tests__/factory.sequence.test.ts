import { Factory } from 'fishery';

describe('sequence', () => {
  it('increments by one on build', () => {
    const userFactory = Factory.define<number>(({ sequence }) => sequence);
    expect(userFactory.build()).toEqual(1);
    expect(userFactory.build()).toEqual(2);
  });

  it('increments on buildList for each item', () => {
    const userFactory = Factory.define<number>(({ sequence }) => sequence);
    expect(userFactory.buildList(2)).toEqual([1, 2]);
    expect(userFactory.build()).toEqual(3);
  });

  describe('when the factory is extended', () => {
    it('shares the sequence with the original factory', () => {
      const userFactory = Factory.define<{ id: number }>(({ sequence }) => ({
        id: sequence,
      }));
      const adminFactory = userFactory.params({});
      expect(adminFactory.build().id).toEqual(1);
      expect(userFactory.build().id).toEqual(2);
      expect(adminFactory.build().id).toEqual(3);
    });
  });

  describe('rewindSequence', () => {
    it('sets sequence back to one after build', () => {
      const factory = Factory.define<number>(({ sequence }) => sequence);
      expect(factory.build()).toEqual(1);
      factory.rewindSequence();
      expect(factory.build()).toEqual(1);
      expect(factory.build()).toEqual(2);
    });

    it('sets sequence back to one after buildList', () => {
      const factory = Factory.define<number>(({ sequence }) => sequence);
      expect(factory.buildList(2)).toEqual([1, 2]);
      factory.rewindSequence();
      expect(factory.buildList(2)).toEqual([1, 2]);
    });
  });
});
