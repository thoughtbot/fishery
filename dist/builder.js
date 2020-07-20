"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactoryBuilder = void 0;
var lodash_merge_1 = __importDefault(require("lodash.merge"));
var FactoryBuilder = /** @class */ (function () {
    function FactoryBuilder(generator, sequence, params, transientParams, associations, afterBuilds) {
        var _this = this;
        this.generator = generator;
        this.sequence = sequence;
        this.params = params;
        this.transientParams = transientParams;
        this.associations = associations;
        this.afterBuilds = afterBuilds;
        this.setAfterBuild = function (hook) {
            _this.afterBuilds = __spreadArrays([hook], _this.afterBuilds);
        };
    }
    FactoryBuilder.prototype.build = function () {
        var generatorOptions = {
            sequence: this.sequence,
            afterBuild: this.setAfterBuild,
            params: this.params,
            associations: this.associations,
            transientParams: this.transientParams,
        };
        var object = this.generator(generatorOptions);
        // merge params and associations into object. The only reason 'associations'
        // is separated is because it is typed differently from `params` (Partial<T>
        // vs DeepPartial<T>) so can do the following in a factory:
        // `user: associations.user || userFactory.build()`
        lodash_merge_1.default(object, this.params, this.associations);
        this._callAfterBuilds(object);
        return object;
    };
    FactoryBuilder.prototype._callAfterBuilds = function (object) {
        this.afterBuilds.forEach(function (afterBuild) {
            if (typeof afterBuild === 'function') {
                afterBuild(object);
            }
            else {
                throw new Error('"afterBuild" must be a function');
            }
        });
    };
    return FactoryBuilder;
}());
exports.FactoryBuilder = FactoryBuilder;
