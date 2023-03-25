import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import PersonList from '../views/PersonList.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'PersonList',
    component: PersonList,
  },

];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
