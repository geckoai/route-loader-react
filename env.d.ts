/// <reference types="axios/index.d.ts" />
declare module "axios/unsafe/defaults" {}

declare module "axios/unsafe/core/InterceptorManager" {
  const InterceptorManager: AxiosInterceptorManager<V>;
  export default InterceptorManager;
}