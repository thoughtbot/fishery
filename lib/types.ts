export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type GeneratorFnOptions<T, F, I> = {
  sequence: number;
  afterBuild: (fn: HookFn<T>) => any;
  onCreate: (fn: CreateFn<T>) => any;
  params: DeepPartial<T>;
  associations: Partial<T>;
  transientParams: Partial<I>;
  factories: F;
};
export type GeneratorFn<T, F, I> = (opts: GeneratorFnOptions<T, F, I>) => T;
export type HookFn<T> = (object: T) => any;
export type CreateFn<T> = (object: T) => Promise<T>;
export type BuildOptions<T, I> = {
  associations?: Partial<T>;
  transient?: Partial<I>;
};
