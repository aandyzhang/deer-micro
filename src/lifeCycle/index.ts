import { lifeCycleTypes, appsTypes, AppInfo } from "../type/types";
import { loadHtml,syncAppWrapperElement2Sandbox } from "../loader";
import { getContainer } from "../utils";
import { getMicroAppStateActions }  from '../store'
import { AppStatus } from '../type/enum' 

let lifeCycle: lifeCycleTypes = {};

let rawPublicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__

export const setLifeCycle = (lifeCycleList: lifeCycleTypes) => {
  lifeCycle = lifeCycleList;
};

export const getLifeCycle = () => {
  return lifeCycle;
};

export const beforeLoad = async (app: AppInfo) => {
  window.__POWERED_BY_QIANKUN__ = true;
  app.status = AppStatus.LOADING;
  await runLifeCycle("beforeLoad", app);
  app = await loadHtml(app);
  app.status = AppStatus.LOADED;
};

export const bootstrap = async (app: AppInfo) => {
  window.__POWERED_BY_QIANKUN__ = true;
  if (app.status !== AppStatus.LOADED) {
    return app;
  }
  app.status = AppStatus.BOOTSTRAPPING;
  await app.bootstrap?.(app);
  app.status = AppStatus.NOT_MOUNTED;
};

export const mount = async (app: AppInfo) => {
  window.__POWERED_BY_QIANKUN__ = true;
  app.status = AppStatus.MOUNTING;
  const appInstanceId = `${app.name}_${+new Date()}_${Math.floor(Math.random() * 1000)}`;
  const { onGlobalStateChange, setGlobalState } = getMicroAppStateActions(appInstanceId)
  app.setGlobalState = setGlobalState
  app.onGlobalStateChange = onGlobalStateChange
  await app.mount?.({...app, container: getContainer(app.container)});
  app.status = AppStatus.MOUNTED;
  await runLifeCycle("mounted", app);
};

export const unmount = async (app: AppInfo) => {
  app.status = AppStatus.UNMOUNTING;
  app.proxy.inactive();
  await app.unmount?.({...app,container: getContainer(app.container)});
  app.status = AppStatus.NOT_MOUNTED;
  
  if(rawPublicPath === undefined) {
    delete window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
  } else {
    window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = rawPublicPath
  }
  syncAppWrapperElement2Sandbox(null)
  await runLifeCycle("unmounted", app);
  delete window.__POWERED_BY_QIANKUN__ 
};
const runLifeCycle = async (name: keyof lifeCycleTypes, app: appsTypes) => {
  const fn = lifeCycle[name];
  if (fn instanceof Array) {
    await Promise.all(fn.map((item) => item(app)));
  } else {
    await fn?.(app);
  }
};