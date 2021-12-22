import { EventType } from "../type/types";
import { getAppListInfo } from "../apps";
import { beforeLoad,bootstrap,mount,unmount } from "../lifeCycle";

const originPush = window.history.pushState;
const originReplace = window.history.replaceState;

let historyEvent: PopStateEvent | null = null;
const capturedListeners: Record<EventType, Function[]> = {
  hashchange: [],
  popstate: [],
}
let lastUrl: string | null = null;
const listeners: Record<EventType, Function[]> = {
  hashchange: [],
  popstate: [],
};
//拦截重写router
export const rewriteRoute = () => {
  window.history.pushState = (...args) => {
    originPush.apply(window.history, args);
    historyEvent = new PopStateEvent("popstate");
    // 获取url地址
    const url: any = args && args[2];
    if (url) {
      startRunSpa(url);
    }
  };
  window.history.replaceState = (...args) => {
    originReplace.apply(window.history, args);
    historyEvent = new PopStateEvent("popstate");
    // 获取url地址
    const url: any = args && args[2];
    if (url) {
      startRunSpa(url);
    }
  };
  //监听事件
  window.addEventListener("hashchange", handleUrlChange);
  window.addEventListener("popstate", handleUrlChange);
  //重写监听事件
  window.addEventListener = rewriteEventListener(window.addEventListener);
  window.removeEventListener = rewriteEventListener(window.removeEventListener);
};

const handleUrlChange = () => {
  // console.log("historyEvent", historyEvent);
  startRunSpa(location.href);
};
const hasListener = (name: EventType, fn: Function) => {
  return listeners[name].filter((listener) => listener === fn).length;
};
const rewriteEventListener = (event: Function): any => {
  return function (name: string, fn: Function) {
    if (name === "hashchange" || name === "popstate") {
      if (!hasListener(name, fn)) {
        listeners[name].push(fn);
        return;
      } else {
        listeners[name] = listeners[name].filter((listener) => listener !== fn);
      }
    }
    return event.apply(window, arguments);
  };
};

export const startRunSpa = (url: string) => {
  if (lastUrl !== url) {
    const { actives, unmounts } = getAppListInfo();
    console.log('unmounts',unmounts)
    Promise.all(
      unmounts
        .map(async (app) => {
          await unmount(app)
        })
        .concat(
          actives.map(async (app) => {
            await beforeLoad(app)
            await bootstrap(app)
            await mount(app)
          })
        )
    ).then(()=> {
      //执行路由监听函数事件
      callCapturedListeners()
    })
  }
  lastUrl = url || window.location.href
};

export function callCapturedListeners() {
  if (historyEvent) {
    Object.keys(capturedListeners).forEach((eventName) => {
      const listeners = capturedListeners[eventName as EventType]
      if (listeners.length) {
        listeners.forEach((listener) => {
          // @ts-ignore
          listener.call(this, historyEvent)
        })
      }
    })
    historyEvent = null
  }
}