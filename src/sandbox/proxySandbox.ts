import { SandBoxType } from '../type/enum'
export class ProxySandbox {
  proxy: any;
  type: SandBoxType;
	proxySandboxRunning = false
  constructor() {
		const fakeWindow = {} as Window
    this.type = SandBoxType.Proxy;
    const rawWindow = window
    const proxy = new Proxy(fakeWindow, {
      set:(target:any, key:string, value:any) => {
				if(this.proxySandboxRunning) {
          console.log('target',target)
          if (!target.hasOwnProperty(key) && rawWindow.hasOwnProperty(key)) {
            const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
            const { writable, configurable, enumerable } = descriptor!;
            // writable = false window.event 赋值不生效，
            // 当且仅当属性的值可以被改变时为true,调用Object.defineProperty修改属性p，并返回该对象
            if (writable) {
              Object.defineProperty(target, key, {
                configurable,
                enumerable,
                writable,
                value,
              });
            }
          }else {
            target[key] = value
          }
				}
				return true
			},
      get(target:any, key:string):any {
        // window.window window.self
				switch (key) {
          case 'window':
          case 'self':
          case 'globalThis':
            return proxy
        }
				//处理window原有对象的属性
				if (
          !Object.prototype.hasOwnProperty.call(target, key) &&
          Object.prototype.hasOwnProperty.call(rawWindow,key)
        ) {
          // @ts-ignore
          const value = rawWindow[key]
          if (typeof value === 'function') return value.bind(rawWindow)
          return value
        }
				return target[key]
			},
    });
		this.proxy = proxy
	}
  active() {
		this.proxySandboxRunning = true
  }
  inactive() {
		this.proxySandboxRunning = false
	}
}
