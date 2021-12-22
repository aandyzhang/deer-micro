import { AppInfo } from "../type/types";
import { importEntry } from "import-html-entry";
import { SnapshotSandbox } from "../sandbox/snapshotSandbox";
import { ProxySandbox } from "../sandbox/proxySandbox";
import {
  getContentWrapper,
  createElement,
  getContainer,
  getAppWrapperGetter,
  patchAtBootstrapping
} from "../utils";

let initialAppWrapperElement:HTMLElement|null = null

export const syncAppWrapperElement2Sandbox = (element: HTMLElement | null) => initialAppWrapperElement = element;

export const loadHtml = async (app: AppInfo) => {
  const { entry, name: appName } = app;
  const appInstanceId = `${appName}_${+new Date()}_${Math.floor(
    Math.random() * 1000
  )}`;
  const {
    template,
    assetPublicPath,
    getExternalStyleSheets,
    getExternalScripts,
  } = await importEntry(entry);
  
  const appContent = getContentWrapper(appInstanceId, appName, template);
  const initialContainer = "container" in app ? app.container : undefined;
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = assetPublicPath
  initialAppWrapperElement = createElement(
    appContent,
    appName
  );
  const render = getRender();
  render({ element: initialAppWrapperElement, container: initialContainer });
  const initGetAppWrapperGetter = getAppWrapperGetter(
    () => initialAppWrapperElement
  );
  await getExternalStyleSheets();
  const scripts = await getExternalScripts();
  scripts.forEach((script) => {
    const childExport = runJs(script, app, initGetAppWrapperGetter);
    if (childExport) {
      app.bootstrap = childExport.bootstrap;
      app.mount = childExport.mount;
      app.unmount = childExport.unmount;
    }
  });
  return app;
};

type ElementRender = (props: {
  element: HTMLElement | null;
  container?: string | HTMLElement;
}) => any;
const rawAppendChild = HTMLElement.prototype.appendChild;
const rawRemoveChild = HTMLElement.prototype.removeChild;
const getRender = () => {
  const render: ElementRender = ({ element, container }) => {
    const containerElement = getContainer(container!);
    if (containerElement && !containerElement.contains(element)) {
      while (containerElement!.firstChild) {
        rawRemoveChild.call(containerElement, containerElement!.firstChild);
      }
      if (element) {
        rawAppendChild.call(containerElement, element);
      }
      return undefined;
    }
  };
  return render;
};

const runJs = (
  script: string,
  app: AppInfo,
  initialAppWrapperElement: () => HTMLElement
) => {
  if (!app.proxy) {
    if (!window.Proxy) {
      app.proxy = new SnapshotSandbox();
    } else {
      app.proxy = new ProxySandbox();
    }
    //@ts-ignore
    window.__current_proxy__ = app.proxy.proxy;
  }
  const { name: appName } = app;
  //直接使用qiankun patch方法，来处理动态样式和脚本
  const bootstrappingFreers = patchAtBootstrapping(
    appName,
    app.proxy,
    initialAppWrapperElement
  );
  bootstrappingFreers.forEach((rebuild) => rebuild());
  app.proxy.active();
  const code = `
		return (window => {
			${script}
			return window['${app.name}']
		})(window.__current_proxy__)
	`;
  return new Function(code)();
};
