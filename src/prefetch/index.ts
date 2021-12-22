import { AppInfo, prefetchOptions } from "../type/types";
import { AppStatus } from "../type/enum";
import { importEntry } from "import-html-entry";

export const prefetchApp = (apps: AppInfo[], prefetch: prefetchOptions) => {
  const getNextLoadNames = (names: string[]): AppInfo[] =>
    apps.filter((app) => names.includes(app.name));

  if (Array.isArray(prefetch)) {
    prefetchFn(getNextLoadNames(prefetch));
  }

  switch (prefetch) {
    case "all":
      prefetchFn(apps);
      break;
    case true:
      prefetchFn(apps);
      break;
    default:
      break;
  }
};
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Navigator {
    connection: {
      saveData: boolean;
      effectiveType: string;
      type:
        | "bluetooth"
        | "cellular"
        | "ethernet"
        | "none"
        | "wifi"
        | "wimax"
        | "other"
        | "unknown";
    };
  }
}

const isSlowNetwork = navigator.connection
  ? navigator.connection.saveData ||
    (navigator.connection.type !== "wifi" &&
      navigator.connection.type !== "ethernet" &&
      /(2|3)g/.test(navigator.connection.effectiveType))
  : false;

const prefetchFn = (lists: AppInfo[]) => {
  if (isSlowNetwork) {
    return;
  }
  const notLoadedApps = lists.filter(
    (item) => item.status === AppStatus.NOT_LOADED
  );
  notLoadedApps.forEach((app: AppInfo) => {
    requestIdleCallback(async () => {
      const { getExternalScripts, getExternalStyleSheets } = await importEntry(
        app.entry
      );
      requestIdleCallback(getExternalStyleSheets);
      requestIdleCallback(getExternalScripts);
    });
  });
};
