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

import {ClassTransformer} from "@geckoai/class-transformer";
import {Container, FactoryProvider, Newable} from "@geckoai/gecko-core";
import {HttpClient} from "@geckoai/http";
import {LoaderFunctionArgs, useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import qs, {BooleanOptional, IParseOptions} from "qs";
import {Dispatch, SetStateAction} from "react";


/**
 * 预加载数据
 */
class Preloaded<D, P> {
  constructor(private target: Newable<P>, private readonly data: D, private readonly params: P, private readonly originParams: object) {
    this.useState = this.useState.bind(this);
  }

  public get query() {
    return this.params;
  }

  public get type() {
    return this.target;
  }

  public useState(): [D, Dispatch<SetStateAction<P>>] {
    const navigate = useNavigate();
    return [this.data, (value) => {
      if (typeof value === 'function') {
        navigate('?' + qs.stringify({
          ...this.originParams,
          ...(value as any)(this.params)
        }, {
          serializeDate: d => String(d.getTime())
        }));
      } else {
        navigate('?' + qs.stringify({...this.originParams, ...value}, {
          serializeDate: d => String(d.getTime())
        }));
      }
    }]
  }
}

/**
 * 预加载器
 */
class Preload<R = any, P extends object = any> {
  constructor(
    private target: Newable<P>,
    private provide: FactoryProvider<HttpClient>,
    private getter?: PreloadGetParams<P>,
    private transform?: (values: any) => R,
  ) {
    this.fetch = this.fetch.bind(this);
  }

  public get type() {
    return this.target;
  }

  public async fetch(container: Container, transformer: ClassTransformer, origin: object) {
    const body = transformer.transform(this.target, origin);
    const httpClient = container.get<HttpClient>(this.provide.provide);
    if (this.getter) {
      const data = await this.getter(container, body, origin as any) as any;
      Object.keys(data).forEach((key) => {
        (body as any)[key] = data[key];
      })
    }
    const result = await httpClient.fetch(body);
    if (this.transform) {
      return [body, this.transform(result.data)] as [P, R]
    }
    return [body, result.data] as [P, R]
  }
}

class PreParser<P extends object = any> {
  constructor(
    private target: Newable<P>,
    private getter?: PreloadGetParams<P>
  ) {}

  public get type() {
    return this.target;
  }

  public async parse(container: Container, transformer: ClassTransformer, origin: object): Promise<P> {
    const start = transformer.transform(this.target, origin);
    if (this.getter) {
      const data = await this.getter(container, start, origin as any) as any;
      return transformer.transform(this.target, {...start, ...data});
    }
    return start;
  }

  public static for<P extends object>(target: Newable<P>, getter?: PreloadGetParams<P>) {
    return new PreParser<P>(target, getter);
  }
}

/**
 * 预加载builder 用于创建 Preload
 */
class PreloadBuilder<P extends object> {
  constructor(private target: Newable<P>, private provide: FactoryProvider<HttpClient>, private getter?: PreloadGetParams<P>) {
  }

  public static for<P extends object>(target: Newable<P>, provide: FactoryProvider<HttpClient>, getter?: PreloadGetParams<P>) {
    return new PreloadBuilder<P>(target, provide, getter);
  }

  public setProvide(provide: FactoryProvider<HttpClient>) {
    this.provide = provide;
  }

  public setTarget(target: Newable<P>) {
    this.target = target;
  }

  public setParamGetter(getter: PreloadGetParams<P>) {
    this.getter = getter;
  }

  public build<H extends (value: any) => any>(handler: H): Preload<ReturnType<H>, P>;
  public build<R>(): Preload<R, P>;
  public build(handler?: (value: any) => any): Preload {
    if (handler) {
      return new Preload(this.target, this.provide, this.getter, handler);
    }
    return new Preload(this.target, this.provide, this.getter);
  }
}

/**
 * 路由数据加载器
 */
export class RouteLoader<T extends Array<Preload | PreParser>> {
  public static PreloadBuilder = PreloadBuilder;
  public static Preloaded = Preloaded;
  public static Preload = Preload;
  public static PreParser = PreParser;

  private static options: IParseOptions<BooleanOptional> = {
    arrayLimit: 10000
  }

  public static setOptions(options: IParseOptions<BooleanOptional>) {
    this.options = options
  }

  public static mergeOptions(options: IParseOptions<BooleanOptional>) {
    this.options = Object.assign(options, this.options);
  }

  private __loads: T;

  constructor(...loads: T) {
    this.__loads = loads;
    this.loader = this.loader.bind(this);
    this.usePreloadData = this.usePreloadData.bind(this);
  }

  public static for<T extends Array<Preload | PreParser>>(...builders: T): RouteLoader<T> {
    return new RouteLoader<T>(...builders);
  }

  public async loader({request, params}: LoaderFunctionArgs, container: Container) {
    const url = new URL(request.url);
    const query = qs.parse(url.search.replace(/^\?/, ''), RouteLoader.options);
    const transformer = container.get(ClassTransformer);
    const origin = Object.assign({}, params, query);
    return await Promise.all(this.__loads.map(async prod => {
      if (prod instanceof PreParser) {
        const params = await prod.parse(container, transformer, origin);
        return new Preloaded(prod.type, params, params, origin)
      }
      const [params, data] = await prod.fetch(container, transformer, origin);
      return new Preloaded(prod.type, data, params, origin);
    }))
  }

  public usePreloading(): boolean {
    const navigation = useNavigation();
    return Boolean(navigation.location)
  }

  public usePreloadData(): LoadedReturns<T> {
    return useLoaderData() as any;
  }
}

export type PreloadGetParams<T extends object> = (container: Container, body: T, origin: T & Record<string | number, unknown>) => Promise<Partial<T>> | Partial<T>;
export type LoadedReturn<T> = T extends Preload<infer U, infer P> ? Preloaded<U, P> : T extends PreParser<infer U> ? Preloaded<U, U> : never;
export type LoadedReturns<T extends Array<Preload | PreParser>> = T extends [infer First, ...infer Rest extends Preload[]] ? [LoadedReturn<First>, ...LoadedReturns<Rest>] : [];