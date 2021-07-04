export type DeepPartial<T> = {
  [P in keyof T]?: unknown extends T[P]
    ? T[P]
    : T[P] extends Array<any>
    ? T[P]
    : DeepPartial<T[P]>;
};

export type GeneratorFnOptions<T, I> = {
  sequence: number;
  afterBuild: (fn: HookFn<T>) => any;
  onCreate: (fn: CreateFn<T>) => any;
  params: DeepPartial<T>;
  associations: Partial<T>;
  transientParams: Partial<I>;
};
export type GeneratorFn<T, I> = (opts: GeneratorFnOptions<T, I>) => T;
export type HookFn<T> = (object: T) => any;
export type CreateFn<T> = (object: T) => Promise<T>;
export type BuildOptions<T, I> = {
  associations?: Partial<T>;
  transient?: Partial<I>;
  bulkCreate?: boolean;
};
