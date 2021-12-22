import { cloneDeep } from "lodash";

let globalState: Record<string, any> = {};

const deps: Record<string, any> = {};

export const createStore = (state: Record<string, any> = {}) => {
  if (state === globalState) {
    console.warn("state has not changed !");
  } else {
    const prevGlobalState = cloneDeep(globalState);
    globalState = cloneDeep(state);
    emitGlobal(globalState, prevGlobalState);
  }
  return getMicroAppStateActions(`global-${+new Date()}`, true);
};

export const emitGlobal = (
  state: Record<string, any>,
  prevState: Record<string, any>
) => {
  Object.keys(deps).forEach((id: string) => {
		if (deps[id] instanceof Function) {
      deps[id](cloneDeep(state), cloneDeep(prevState));
    }
  });
};

export const getMicroAppStateActions = (id: string, isMaster: boolean = true) => {
  return {
    onGlobalStateChange(callback: Function, fireImmediately?: boolean) {
      if (!(callback instanceof Function)) {
        console.warn("onGlobalStateChange callback must be function");
        return;
      }
      if (deps[id]) {
        console.warn(
          `'${id}' global listener already exists before this, new listener will overwrite it.`
        );
      }
      deps[id] = callback;
      const cloneState = cloneDeep(globalState);
      if (fireImmediately) {
        callback(cloneState, cloneState);
      }
    },
		//只能修改已经初始化声明的变量值
    setGlobalState(state: Record<string, any>) {
      if (state === globalState) {
        console.warn("state has not changed！");
        return false;
      }
      const changeKeys: string[] = [];
			const prevGlobalState = cloneDeep(globalState);
			globalState = cloneDeep(
				Object.keys(state).reduce((_globalState,changeKey) => {
				if(isMaster && Object.hasOwnProperty.call(_globalState,changeKey)) {
					changeKeys.push(changeKey)
					return Object.assign(globalState,{
						[changeKey]: state[changeKey]
					})
				}
				console.warn(
					      `'${changeKey}' not declared when init state！`
					    );
				return _globalState
			},globalState))
			if (changeKeys.length === 0) {
				console.warn('state has not changed！');
				return false;
			}
			emitGlobal(globalState, prevGlobalState);
			return true;
    },
		// 注销该应用下的依赖
    offGlobalStateChange() {
      delete deps[id];
      return true;
    },
  };
};
