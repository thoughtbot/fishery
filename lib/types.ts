export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type GeneratorFnOptions<T, I> = {
  sequence: number;
  afterBuild: (fn: HookFn<T>) => any;
  params: DeepPartial<T>;
  associations: Partial<T>;
  transientParams: Partial<I>;
};
export type GeneratorFn<T, I> = (opts: GeneratorFnOptions<T, I>) => T;
export type HookFn<T> = (object: T) => any;
export type BuildOptions<T, I> = {
  associations?: Partial<T>;
  transient?: Partial<I>;
};
