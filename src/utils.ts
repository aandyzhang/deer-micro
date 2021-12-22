import { snakeCase } from "lodash";
import { SandBoxType } from "./type/enum";
import {Freer,SandBox,ContainerConfig} from './type/types'

export function iter(obj: object, callbackFn: (prop: any) => void) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      callbackFn(prop);
    }
  }
}
export function getContainer(
  container: string | HTMLElement
): HTMLElement | null {
  return typeof container === "string"
    ? document.querySelector(container)
    : container;
}

export function getContentWrapper(
  appInstanceId: string,
  appName: string,
  template: string
) {
  return `<div id="${getWrapperId(
    appInstanceId
  )}" class="${appName}">${template}</div>`;
}

const getWrapperId = (id: string) => {
  return `deer_micro_app_${snakeCase(id)}`;
};


export function createElement(appContent:string, appName:string):HTMLElement{
  const containerElement = document.createElement('div');
  console.log('appName',appName)
  containerElement.innerHTML = appContent;
  const appElement = containerElement.firstChild as HTMLElement;
  return appElement
}


export function getAppWrapperGetter(
  elementGetter: () => HTMLElement | null,
) {
  return () => {
    const element = elementGetter();

    return element!;
  };
}
const SCRIPT_TAG_NAME = 'SCRIPT';
const LINK_TAG_NAME = 'LINK';
const STYLE_TAG_NAME = 'STYLE';
export function isHijackingTag(tagName?: string) {
  return (
    tagName?.toUpperCase() === LINK_TAG_NAME ||
    tagName?.toUpperCase() === STYLE_TAG_NAME ||
    tagName?.toUpperCase() === SCRIPT_TAG_NAME
  );
}


export function patchAtBootstrapping(
  appName: string,
  sandbox: SandBox,
  elementGetter: () => HTMLElement
): Freer[] {
  const patchersInSandbox = {
    [SandBoxType.Proxy]: [
      () => patchStrictSandbox(appName, sandbox.proxy, elementGetter),
    ],
    [SandBoxType.Snapshot]: [
      () => patchStrictSandbox(appName, sandbox.proxy, elementGetter),
    ],
  };

  return patchersInSandbox[sandbox.type]?.map((patch) => {
    return patch();
  });
}

const proxyAttachContainerConfigMap = new WeakMap<
  WindowProxy,
  ContainerConfig
>();
const elementAttachContainerConfigMap = new WeakMap<
  HTMLElement,
  ContainerConfig
>();


export function patchStrictSandbox(
  appName: string,
  proxy: Window,
  appWrapperGetter: () => HTMLElement | ShadowRoot
): Freer {
  let containerConfig = proxyAttachContainerConfigMap.get(proxy);
  if (!containerConfig) {
    containerConfig = {
      appName,
      proxy,
      appWrapperGetter,
      dynamicStyleSheetElements: [],
      strictGlobal: true,
    };
    proxyAttachContainerConfigMap.set(proxy, containerConfig);
  }
  const unpatchDocumentCreate = patchDocumentCreateElement();
  console.log(unpatchDocumentCreate)
  const unpatchDynamicAppendPrototypeFunctions =
    patchHTMLDynamicAppendPrototypeFunctions(
      (element) => elementAttachContainerConfigMap.has(element),
      (element) => elementAttachContainerConfigMap.get(element)!
    );
  console.log('unpatchDynamicAppendPrototypeFunctions',unpatchDynamicAppendPrototypeFunctions)
  const { dynamicStyleSheetElements } = containerConfig;
  console.log("dynamicStyleSheetElements", dynamicStyleSheetElements);
  return function free() {
    return function rebuild() {
      // console.log(1)
      console.log("重建");
    };
  };
}

const rawDocumentCreateElement = Document.prototype.createElement;
function patchDocumentCreateElement() {
  if (Document.prototype.createElement === rawDocumentCreateElement) {
    Document.prototype.createElement = function createElement<
      K extends keyof HTMLElementTagNameMap
    >(
      this: Document,
      tagName: K,
      options?: ElementCreationOptions
    ): HTMLElement {
      const element = rawDocumentCreateElement.call(this, tagName, options);
      if (isHijackingTag(tagName)) {
        // const currentRunningSandboxProxy = getCurrentRunningSandboxProxy();
        const currentRunningSandboxProxy = window.__current_proxy__;
        if (currentRunningSandboxProxy) {
          const proxyContainerConfig = proxyAttachContainerConfigMap.get(
            currentRunningSandboxProxy
          );
          if (proxyContainerConfig) {
            elementAttachContainerConfigMap.set(element, proxyContainerConfig);
          }
        }
      }

      return element;
    };
  }

  return function unpatch() {
    Document.prototype.createElement = rawDocumentCreateElement;
  };
}

export const rawHeadAppendChild = HTMLHeadElement.prototype.appendChild;
const rawHeadRemoveChild = HTMLHeadElement.prototype.removeChild;
const rawBodyAppendChild = HTMLBodyElement.prototype.appendChild;
const rawBodyRemoveChild = HTMLBodyElement.prototype.removeChild;
const rawHeadInsertBefore = HTMLHeadElement.prototype.insertBefore;

export function patchHTMLDynamicAppendPrototypeFunctions(
  isInvokedByMicroApp: (element: HTMLElement) => boolean,
  containerConfigGetter: (element: HTMLElement) => ContainerConfig,
) {
  // Just overwrite it while it have not been overwrite
  if (
    HTMLHeadElement.prototype.appendChild === rawHeadAppendChild &&
    HTMLBodyElement.prototype.appendChild === rawBodyAppendChild &&
    HTMLHeadElement.prototype.insertBefore === rawHeadInsertBefore
  ) {
    HTMLHeadElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadAppendChild,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawHeadAppendChild;
    HTMLBodyElement.prototype.appendChild = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawBodyAppendChild,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawBodyAppendChild;

    HTMLHeadElement.prototype.insertBefore = getOverwrittenAppendChildOrInsertBefore({
      rawDOMAppendOrInsertBefore: rawHeadInsertBefore as any,
      containerConfigGetter,
      isInvokedByMicroApp,
    }) as typeof rawHeadInsertBefore;
  }
  return function unpatch() {
    HTMLHeadElement.prototype.appendChild = rawHeadAppendChild;
    HTMLHeadElement.prototype.removeChild = rawHeadRemoveChild;
    HTMLBodyElement.prototype.appendChild = rawBodyAppendChild;
    HTMLBodyElement.prototype.removeChild = rawBodyRemoveChild;

    HTMLHeadElement.prototype.insertBefore = rawHeadInsertBefore;
  };
}
function getOverwrittenAppendChildOrInsertBefore(opts: {
  rawDOMAppendOrInsertBefore: <T extends Node>(newChild: T, refChild?: Node | null) => T;
  isInvokedByMicroApp: (element: HTMLElement) => boolean;
  containerConfigGetter: (element: HTMLElement) => ContainerConfig;
}) {
  return function appendChildOrInsertBefore<T extends Node>(
    this: HTMLHeadElement | HTMLBodyElement,
    newChild: T,
    refChild?: Node | null,
  ) {
    let element = newChild as any;
    const { rawDOMAppendOrInsertBefore, isInvokedByMicroApp, containerConfigGetter } = opts;
    if (!isHijackingTag(element.tagName) || !isInvokedByMicroApp(element)) {
      return rawDOMAppendOrInsertBefore.call(this, element, refChild) as T;
    }
    if (element.tagName) {
      const containerConfig = containerConfigGetter(element);
      const {
        appWrapperGetter,
        dynamicStyleSheetElements,
      } = containerConfig;

      switch (element.tagName) {
        case LINK_TAG_NAME:
        case STYLE_TAG_NAME: {
          let stylesheetElement: HTMLLinkElement | HTMLStyleElement = newChild as any;
          const mountDOM = appWrapperGetter();
          // eslint-disable-next-line no-shadow
          dynamicStyleSheetElements.push(stylesheetElement);
          const referenceNode = mountDOM.contains(refChild) ? refChild : null;
          return rawDOMAppendOrInsertBefore.call(mountDOM, stylesheetElement, referenceNode);
        }
        default:
          break;
      }
    }

    return rawDOMAppendOrInsertBefore.call(this, element, refChild);
  };
}
