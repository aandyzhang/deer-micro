import { iter } from "../utils";
import type { SandBox } from '../type/types'
import { SandBoxType } from '../type/enum'

export class SnapshotSandbox implements SandBox {
  private windowSnapshot: any;
  proxy: any;
  type: SandBoxType;
  private modifyPropsMap: Record<any, any> = {};
  snapshotSandboxRunning = true
  constructor() {
		//存储环境值
    this.proxy = window
    this.type = SandBoxType.Snapshot;
    this.windowSnapshot = new Map();
  }
  active() {
    //保存当前环境
    // this.windowSnapshot = {} as Window;
    iter(window, (props) => {
      this.windowSnapshot[props] = window[props];
    });

    //恢复之前子应用变更
    Object.keys(this.modifyPropsMap).forEach((props: any) => {
      window[props] = this.modifyPropsMap[props];
    });
    this.snapshotSandboxRunning = true;
  }

  inactive() {
    this.modifyPropsMap = {};
    // 记录当前快照上改动的属性
    iter(window, (prop) => {
      if (window[prop] !== this.windowSnapshot[prop]) {
        // 记录变更，恢复环境
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    });
    this.snapshotSandboxRunning = false
  }
}
