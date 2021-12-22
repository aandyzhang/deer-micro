import Vue from "vue";
import Router from 'vue-router'
import App from "./App.vue";
Vue.use(Router)
import { registerMicroApps, start,createStore } from "../../../dist";
Vue.config.productionTip = false;
const store = createStore({
  pageName: '测试',
  mainName: 'core'
})
store.setGlobalState({
  mainName: '主系统名称'
})
const apps = [
  {
    name: "react",
    container: "#mainContainer",
    entry: "http://localhost:3000/",
    activeRule: "/react",
    props: {
      name: 'react'
    }
  },
  {
    name: "vue",
    container: "#mainContainer",
    entry: " http://localhost:8888",
    activeRule: "/vue",
    props: {
      name: 'vue'
    }
  }
];
registerMicroApps(apps, {
  beforeLoad: [
    (app) => {
      console.log("[LifeCycle] before load %c%s", "color: green;", app.name);
    },
  ],
  beforeMount: [
    (app) => {
      console.log("[LifeCycle] before mount %c%s", "color: green;", app.name);
    },
  ],
  mounted: [
    (app) => {
      console.log("[LifeCycle] mounted %c%s", "color: green;", app.name);
    },
  ],
  unmounted: [
    (app) => {
      console.log("[LifeCycle] after unmounted %c%s", "color: green;", app.name);
    },
  ],
});

start({
  // prefetch: ['vue','react']
});
new Vue({
  render: (h) => h(App),
  
}).$mount("#app");
