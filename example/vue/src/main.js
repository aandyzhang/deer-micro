import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let app

// @ts-ignore
const isQiankunSubApp = !!window.__POWERED_BY_QIANKUN__
if (isQiankunSubApp && process.env.NODE_ENV === 'development') {
  /* eslint-disable */
  // @ts-ignore
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

export async function bootstrap(app) {
  await console.log('app bootstrap',app.name)
}

export async function mount(props) {
  await render(props)
}

export async function unmount(){
  app.$destroy()
}

const render = (props) =>{
  const { container } = props || {}
  app = new Vue({
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

if(!isQiankunSubApp) {
  render({})
}