export type DeepPartial<T> = {
  [P in keyof T]?: unknown extends T[P]
    ? T[P]
    : T[P] extends Array<any>
    ? T[P]
    : DeepPartial<T[P]>;
};

export type GeneratorFnOptions<T, I, C> = {
  sequence: number;
  afterBuild: (fn: HookFn<T>) => any;
  afterCreate: (fn: AfterCreateFn<C>) => any;
  onCreate: (fn: OnCreateFn<T, C>) => any;
  params: DeepPartial<T>;
  associations: Partial<T>;
  transientParams: Partial<I>;
};
export type GeneratorFn<T, I, C> = (opts: GeneratorFnOptions<T, I, C>) => T;
export type HookFn<T> = (object: T) => any;
export type OnCreateFn<T, C = T> = (object: T) => C | Promise<C>;
export type AfterCreateFn<C> = (object: C) => C | Promise<C>;
export type BuildOptions<T, I> = {
  associations?: Partial<T>;
  transient?: Partial<I>;
};
