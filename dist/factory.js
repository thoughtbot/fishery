"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = void 0;
var builder_1 = require("./builder");
var SEQUENCE_START_VALUE = 1;
var Factory = /** @class */ (function () {
    function Factory(generator) {
        this.generator = generator;
        this.nextId = SEQUENCE_START_VALUE;
        this._afterBuilds = [];
        this._associations = {};
        this._params = {};
        this._transient = {};
    }
    /**
     * Define a factory. This factory needs to be registered with
     * `register` before use.
     * @template T The object the factory builds
     * @template I The transient parameters that your factory supports
     * @param generator - your factory function
     */
    Factory.define = function (generator) {
        return new this(generator);
    };
    /**
     * Build an object using your factory
     * @param params
     * @param options
     */
    Factory.prototype.build = function (params, options) {
        if (params === void 0) { params = {}; }
        if (options === void 0) { options = {}; }
        return new builder_1.FactoryBuilder(this.generator, this.sequence(), __assign(__assign({}, this._params), params), __assign(__assign({}, this._transient), options.transient), __assign(__assign({}, this._associations), options.associations), this._afterBuilds).build();
    };
    Factory.prototype.buildList = function (number, params, options) {
        if (params === void 0) { params = {}; }
        if (options === void 0) { options = {}; }
        var list = [];
        for (var i = 0; i < number; i++) {
            list.push(this.build(params, options));
        }
        return list;
    };
    /**
     * Extend the factory by adding a function to be called after an object is built.
     * @param afterBuildFn - the function to call. It accepts your object of type T. The value this function returns gets returned from "build"
     * @returns a new factory
     */
    Factory.prototype.afterBuild = function (afterBuildFn) {
        var factory = this.clone();
        factory._afterBuilds.push(afterBuildFn);
        return factory;
    };
    /**
     * Extend the factory by adding default associations to be passed to the factory when "build" is called
     * @param associations
     * @returns a new factory
     */
    Factory.prototype.associations = function (associations) {
        var factory = this.clone();
        factory._associations = __assign(__assign({}, this._associations), associations);
        return factory;
    };
    /**
     * Extend the factory by adding default parameters to be passed to the factory when "build" is called
     * @param params
     * @returns a new factory
     */
    Factory.prototype.params = function (params) {
        var factory = this.clone();
        factory._params = __assign(__assign({}, this._params), params);
        return factory;
    };
    /**
     * Extend the factory by adding default transient parameters to be passed to the factory when "build" is called
     * @param transient - transient params
     * @returns a new factory
     */
    Factory.prototype.transient = function (transient) {
        var factory = this.clone();
        factory._transient = __assign(__assign({}, this._transient), transient);
        return factory;
    };
    /**
     * Sets sequence back to its default value
     */
    Factory.prototype.rewindSequence = function () {
        this.nextId = SEQUENCE_START_VALUE;
    };
    Factory.prototype.clone = function () {
        var copy = new this.constructor(this.generator);
        Object.assign(copy, this);
        return copy;
    };
    Factory.prototype.sequence = function () {
        return this.nextId++;
    };
    return Factory;
}());
exports.Factory = Factory;
