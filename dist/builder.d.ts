import { GeneratorFn, HookFn, DeepPartial } from './types';
export declare class FactoryBuilder<T, I> {
    private generator;
    private sequence;
    private params;
    private transientParams;
    private associations;
    private afterBuilds;
    constructor(generator: GeneratorFn<T, I>, sequence: number, params: DeepPartial<T>, transientParams: Partial<I>, associations: Partial<T>, afterBuilds: HookFn<T>[]);
    build(): T;
    setAfterBuild: (hook: HookFn<T>) => void;
    _callAfterBuilds(object: T): void;
}
