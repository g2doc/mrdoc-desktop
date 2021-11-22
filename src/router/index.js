import Vue from 'vue'
import VueRouter from 'vue-router'
import { ipcRenderer } from "electron";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home')
  },
  {
    path: '/options/',
    name: 'Options',
    component: () => import('@/pages/Options')
  },

]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

// 与electron进行通信，侦听其href事件
ipcRenderer.on('href',(event,arg)=>{
  if(arg){
    router.push({name:arg})
  }
});

export default router