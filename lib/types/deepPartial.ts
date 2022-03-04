// Adapted and modified from:
// https://github.com/sindresorhus/type-fest/blob/HEAD/source/partial-deep.d.ts
export type DeepPartial<T> = T extends Primitive
  ? Partial<T>
  : T extends Array<any>
  ? T
  : T extends Set<any>
  ? T
  : T extends ReadonlySet<any>
  ? T
  : T extends Map<any, any>
  ? T
  : T extends ReadonlyMap<any, any>
  ? T
  : T extends Date
  ? Date
  : T extends (...args: any[]) => unknown
  ? T | undefined
  : T extends object
  ? DeepPartialObject<T>
  : unknown;

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type DeepPartialObject<ObjectType extends object> = {
  [KeyType in keyof ObjectType]?: DeepPartial<ObjectType[KeyType]>;
};
