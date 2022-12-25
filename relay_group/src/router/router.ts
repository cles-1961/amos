import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export interface RouteMeta {
  name: string;
}

export enum RouteName {
  HOME = 'home',
}

const routes: Array<RouteRecordRaw> = [
  {
    path: `/`,
    name: RouteName.HOME,
    component: () => import('../views/the-home.vue')
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
