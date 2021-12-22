import { match } from "path-to-regexp";
import { appsTypes, AppInfo } from "../type/types";
import { AppStatus } from '../type/enum'

let apps: appsTypes[] = [];

export const setApps = (lists: appsTypes[]) => {
  apps = lists;
	apps.map(app => {
		(app as AppInfo).status = AppStatus.NOT_LOADED
	})
};
export const getApps = () => apps;

export const getAppListInfo = () => {
  const actives: AppInfo[] = [];
  const unmounts: AppInfo[] = [];
	const lists = getApps() as AppInfo[]
  lists.map((app) => {
    const active = match(app.activeRule, { end: false })(location.pathname);
		switch (app.status) {
      case AppStatus.NOT_LOADED:
      case AppStatus.LOADING:
      case AppStatus.LOADED:
      case AppStatus.BOOTSTRAPPING:
      case AppStatus.NOT_MOUNTED:
        active && actives.push(app)
        break
      case AppStatus.MOUNTED:
        !active && unmounts.push(app)
        break
    }
  });
  return { actives, unmounts };
};
