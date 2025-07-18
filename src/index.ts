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
import qs from "qs";
import {Dispatch, SetStateAction} from "react";


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


export type PreloadGetParams<T extends object> = (container: Container) => Partial<T>;

class PreloadBuilder<R = any, P extends object = any> {
  constructor(private target: Newable<P>, private provide: FactoryProvider<HttpClient>, private get?: PreloadGetParams<P>) {
    this.fetch = this.fetch.bind(this);
  }

  public get type() {
    return this.target;
  }

  public static for<R, P extends object>(target: Newable<P>, provide: FactoryProvider<HttpClient>, get?: PreloadGetParams<P>) {
    return new PreloadBuilder<R, P>(target, provide, get);
  }

  public async fetch(container: Container, transformer: ClassTransformer, origin: object) {
    const body = transformer.transform(this.target, origin);
    const httpClient = container.get<HttpClient>(this.provide.provide);
    if (this.get) {
      const data = this.get(container) as any;
      Object.keys(data).forEach((key) => {
        (body as any)[key] = data[key];
      })
    }
    const result = await httpClient.fetch(body);
    return [body, result.data] as [P, R]
  }
}

export type LoadedReturn<T> = T extends PreloadBuilder<infer U, infer P> ? Preloaded<U, P> : never;
export type LoadedReturns<T extends PreloadBuilder[]> = T extends [infer First, ...infer Rest extends PreloadBuilder[]] ? [LoadedReturn<First>, ...LoadedReturns<Rest>] : [];


export class RouteLoader<T extends PreloadBuilder[]> {
  public static PreloadBuilder = PreloadBuilder;
  public static Preloaded = Preloaded;
  private __loads: T;
  constructor(...loads: T) {
    this.__loads = loads;
    this.loader = this.loader.bind(this);
    this.usePreloadData = this.usePreloadData.bind(this);
  }

  public async loader({request, params}: LoaderFunctionArgs, container: Container) {
    const url = new URL(request.url);
    const query = qs.parse(url.search.replace(/^\?/, ''));
    const transformer = container.get(ClassTransformer);
    const origin = Object.assign({}, params, query);
    return await Promise.all(this.__loads.map(async prod => {
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

  public static for<T extends PreloadBuilder[]>(...builders: T): RouteLoader<T> {
    return new RouteLoader<T>(...builders);
  }
}