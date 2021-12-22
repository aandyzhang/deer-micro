import { appsTypes,lifeCycleTypes, startOptionTypes,AppInfo } from "./type/types";
import { setApps, getApps } from "./apps";
import { rewriteRoute, startRunSpa } from "./router";
import { setLifeCycle } from "./lifeCycle";
import { prefetchApp } from './prefetch'

export const registerMicroApps = (
  apps: appsTypes[],
  lifeCycle?: lifeCycleTypes
) => {
  setApps(apps);
  lifeCycle && setLifeCycle(lifeCycle);
};

export const start = (options: startOptionTypes = {}) => {
  const { prefetch } = options;
  const apps = getApps()
  if (!apps.length) {
    throw new Error("请先注册子应用");
  }
  //路由劫持
  rewriteRoute();
  startRunSpa(window.location.href);
  if (prefetch) {
    prefetchApp(apps as AppInfo[], prefetch);
  }
};
