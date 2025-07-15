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
import { Dispatch, SetStateAction } from "react";
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
declare class PreloadBuilder<R = any, P extends object = any> {
    private target;
    private provide;
    constructor(target: Newable<P>, provide: FactoryProvider<HttpClient>);
    get type(): Newable<P, any[]>;
    static for<R, P extends object>(target: Newable<P>, provide: FactoryProvider<HttpClient>): PreloadBuilder<R, P>;
    fetch(container: Container, transformer: ClassTransformer, origin: object): Promise<[P, R]>;
}
export type LoadedReturn<T> = T extends PreloadBuilder<infer U, infer P> ? Preloaded<U, P> : never;
export type LoadedReturns<T extends PreloadBuilder[]> = T extends [infer First, ...infer Rest extends PreloadBuilder[]] ? [LoadedReturn<First>, ...LoadedReturns<Rest>] : [];
export declare class RouteLoader<T extends PreloadBuilder[]> {
    static PreloadBuilder: typeof PreloadBuilder;
    static Preloaded: typeof Preloaded;
    private __loads;
    constructor(...loads: T);
    loader({ request, params }: LoaderFunctionArgs, container: Container): Promise<Preloaded<any, any>[]>;
    usePreloading(): boolean;
    usePreloadData(): LoadedReturns<T>;
    static for<T extends PreloadBuilder[]>(...builders: T): RouteLoader<T>;
}
export {};
