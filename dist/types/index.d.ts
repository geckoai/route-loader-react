/**
 * MIT License
 *
 * Copyright (c) 2021 @geckoai/route-loader-react RanYunLong<549510622@qq.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { ClassTransformer } from "@geckoai/class-transformer";
import { Container, FactoryProvider, Newable } from "@geckoai/gecko-core";
import { HttpClient } from "@geckoai/http";
import { LoaderFunctionArgs } from "react-router-dom";
import { BooleanOptional, IParseOptions } from "qs";
import { Dispatch, SetStateAction } from "react";
/**
 * 预加载数据
 */
declare class Preloaded<D, P> {
    private target;
    private readonly data;
    private readonly params;
    private readonly originParams;
    constructor(target: Newable<P>, data: D, params: P, originParams: object);
    get query(): P;
    get type(): Newable<P, any[]>;
    useState(): [D, Dispatch<SetStateAction<P>>];
}
/**
 * 预加载器
 */
declare class Preload<R = any, P extends object = any> {
    private target;
    private provide;
    private getter?;
    private transform?;
    constructor(target: Newable<P>, provide: FactoryProvider<HttpClient>, getter?: PreloadGetParams<P>, transform?: (values: any) => R);
    get type(): Newable<P, any[]>;
    fetch(container: Container, transformer: ClassTransformer, origin: object): Promise<[P, R]>;
}
declare class PreParser<P extends object = any> {
    private target;
    private getter?;
    constructor(target: Newable<P>, getter?: PreloadGetParams<P>);
    get type(): Newable<P, any[]>;
    parse(container: Container, transformer: ClassTransformer, origin: object): Promise<P>;
    static for<P extends object>(target: Newable<P>, getter?: PreloadGetParams<P>): PreParser<P>;
}
/**
 * 预加载builder 用于创建 Preload
 */
declare class PreloadBuilder<P extends object> {
    private target;
    private provide;
    private getter?;
    constructor(target: Newable<P>, provide: FactoryProvider<HttpClient>, getter?: PreloadGetParams<P>);
    static for<P extends object>(target: Newable<P>, provide: FactoryProvider<HttpClient>, getter?: PreloadGetParams<P>): PreloadBuilder<P>;
    setProvide(provide: FactoryProvider<HttpClient>): void;
    setTarget(target: Newable<P>): void;
    setParamGetter(getter: PreloadGetParams<P>): void;
    build<H extends (value: any) => any>(handler: H): Preload<ReturnType<H>, P>;
    build<R>(): Preload<R, P>;
}
/**
 * 路由数据加载器
 */
export declare class RouteLoader<T extends Array<Preload | PreParser>> {
    static PreloadBuilder: typeof PreloadBuilder;
    static Preloaded: typeof Preloaded;
    static Preload: typeof Preload;
    static PreParser: typeof PreParser;
    private static options;
    static setOptions(options: IParseOptions<BooleanOptional>): void;
    static mergeOptions(options: IParseOptions<BooleanOptional>): void;
    private __loads;
    constructor(...loads: T);
    static for<T extends Array<Preload | PreParser>>(...builders: T): RouteLoader<T>;
    loader({ request, params }: LoaderFunctionArgs, container: Container): Promise<Preloaded<any, any>[]>;
    usePreloading(): boolean;
    usePreloadData(): LoadedReturns<T>;
}
export type PreloadGetParams<T extends object> = (container: Container, body: T, origin: T & Record<string | number, unknown>) => Promise<Partial<T>> | Partial<T>;
export type LoadedReturn<T> = T extends Preload<infer U, infer P> ? Preloaded<U, P> : T extends PreParser<infer U> ? Preloaded<U, U> : never;
export type LoadedReturns<T extends Array<Preload | PreParser>> = T extends [infer First, ...infer Rest extends Preload[]] ? [LoadedReturn<First>, ...LoadedReturns<Rest>] : [];
export {};
