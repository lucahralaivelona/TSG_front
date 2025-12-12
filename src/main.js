/*!

 =========================================================
 * Vue Light Bootstrap Dashboard - v2.1.0 (Bootstrap 4)
 =========================================================

 * Product Page: http://www.creative-tim.com/product/light-bootstrap-dashboard
 * Copyright 2023 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard/blob/master/LICENSE.md)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import "core-js/stable";
import "regenerator-runtime/runtime";
import axiosInstance, { auth } from './utils/axiosConfig'
// LightBootstrap plugin
import LightBootstrap from "./light-bootstrap-main";
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

// router setup
import routes from "./routes/routes";

import "./registerServiceWorker";
import VModal from "vue-js-modal";

Vue.use(VModal);
// plugin setup
Vue.use(VueRouter);
Vue.use(LightBootstrap);

// Attacher axiosInstance et auth à Vue prototype
Vue.prototype.$axios = axiosInstance
Vue.prototype.$auth = auth

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "nav-item active",
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  // Si la route nécessite une authentification
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  }
  // Si la route est réservée aux invités (non connectés)
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (auth.isAuthenticated()) {
      next({ path: '/admin/overview' })
    } else {
      next()
    }
  }
  // Pour toutes les autres routes
  else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  created() {
    // Vérifier l'authentification au démarrage de l'application
    if (auth.isAuthenticated()) {
      // Optionnel: Vérifier la validité du token
      auth.verifyToken().catch(() => {
        // Token invalide, nettoyer
        auth.logout()
      })
    }
  }
});