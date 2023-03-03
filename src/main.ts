import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { initMockData } from '@/mock'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import './assets/common.scss'

// 开发环境初始化数据
if(process.env.NODE_ENV === 'development'){
  initMockData()
}

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.use(ElementPlus).mount('#app')
