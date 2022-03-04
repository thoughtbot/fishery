import { expectType } from 'tsd';
import { DeepPartial } from 'lib/types';

const unknown = 'x' as unknown;

describe('deepPartial', () => {
  it('works for various property types', () => {
    type MyType = {
      objectArray: { x: number }[];
      objectArrayNull: { x: number }[] | undefined | null;
      stringArray: string[];
      stringArrayNull: string[] | undefined | null;
      number: number;
      numberNull: number | null;
      fn: () => void;
      fnNull: (() => void) | null;
      set: Set<number>;
      setNull: Set<number> | null;
      readonlySetNull: ReadonlySet<number> | null;
      map: Map<string, number>;
      mapNull: Map<string, number> | null;
      readonlyMapNull: ReadonlyMap<string, number> | null;
      date: Date;
      dateNull?: Date | null;
    };

    type Expected = {
      objectArray?: { x: number }[];
      objectArrayNull?: { x: number }[] | undefined | null;
      stringArray?: string[] | undefined;
      stringArrayNull?: string[] | undefined | null;
      number?: number | undefined;
      numberNull?: number | undefined | null;
      fn?: () => void;
      fnNull?: (() => void) | null;
      set?: Set<number>;
      setNull?: Set<number> | null;
      readonlySetNull?: ReadonlySet<number> | null;
      map?: Map<string, number>;
      mapNull?: Map<string, number> | null;
      readonlyMapNull?: ReadonlyMap<string, number> | null;
      date?: Date;
      dateNull?: Date | null;
    };

    type Actual = DeepPartial<MyType>;

    // assert types are assignable to each other in both directions. Doing both
    // directions helps TS Server catch most errors. Some incompatibilities
    // might still only be caught when running `tsd`
    expectType<Expected>(unknown as Actual);
    expectType<Actual>(unknown as Expected);
  });

  it('works with indexed types', () => {
    type Params = {
      [name: string]: string[] | undefined | null;
    };

    type Expected = {
      [name: string]: string[] | undefined | null;
    };

    type Actual = DeepPartial<Params>;

    // assert types are assignable to each other in both directions
    expectType<Expected>(unknown as Actual);
    expectType<Actual>(unknown as Expected);
  });
});
