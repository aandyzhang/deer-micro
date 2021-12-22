import { AppStatus,SandBoxType } from "./enum";

export interface appsTypes {
  name: string;
  entry: string;
  container: any;
  activeRule: string;
  props?: Record<string, any>;
  assetPublicPath?: string
}

export interface startOptionTypes {
  prefetch?: prefetchOptions;
}

export type prefetchOptions = boolean | string | string[];

export interface lifeCycleTypes {
  beforeLoad?: LifeCycle | LifeCycle[];
  mounted?: LifeCycle | LifeCycle[];
  unmounted?: LifeCycle | LifeCycle[];
}

export interface AppInfo extends appsTypes {
  bootstrap?: LifeCycle;
  mount?: LifeCycle;
  unmount?: LifeCycle;
  proxy: any;
  status: AppStatus;
  onGlobalStateChange: Function;
  setGlobalState: Function;
}

export type SandBox = {
  snapshotSandboxRunning: boolean;
  proxy: WindowProxy;
  type: SandBoxType,
  /** 启动沙箱 */
  active: () => void;
  /** 关闭沙箱 */
  inactive: () => void;
};
export type LifeCycle = (app: appsTypes) => Promise<any>;

export type EventType = "hashchange" | "popstate";

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    __QIANKUN_DEVELOPMENT__?: boolean;
    __current_proxy__?: Window | null
  }
}

export type Rebuilder = () => void;
export type Freer = () => Rebuilder;


export type ContainerConfig = {
  appName: string;
  proxy: WindowProxy;
  strictGlobal: boolean;
  dynamicStyleSheetElements: HTMLStyleElement[];
  appWrapperGetter: CallableFunction;
  // scopedCSS: boolean;
  // excludeAssetFilter?: CallableFunction;
};