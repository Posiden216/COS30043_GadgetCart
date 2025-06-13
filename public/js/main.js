const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Define routes
const routes = [
  { path: '/', component: window.GadgetCartComponents.MainPage },
  { path: '/products', component: window.GadgetCartComponents.ProductPage },
  { path: '/cart', component: window.GadgetCartComponents.ShoppingCartPage },
  { path: '/register', component: window.GadgetCartComponents.RegisterPage },
  { path: '/login', component: window.GadgetCartComponents.LoginPage },
  {
    path: '/account',
    component: window.GadgetCartComponents.UserAccountPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchases',
    component: window.GadgetCartComponents.UserPurchasesPage,
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

// Create router
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Route guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = window.GadgetCartStore.state.user !== null;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    // Initialize store before proceeding with navigation
    await window.GadgetCartStore.dispatch('initializeStore');
    next();
  }
});

// Create and mount app
const app = createApp({
  template:` 
    <div>
      <Navigation />
      <router-view></router-view>
    </div>`
  ,
  async created() {
    await this.$store.dispatch('initializeStore');
  }
});

// Register global components
app.component('Navigation', window.GadgetCartComponents.Navigation);
app.component('MainPage', window.GadgetCartComponents.MainPage);
app.component('ProductPage', window.GadgetCartComponents.ProductPage);
app.component('ShoppingCartPage', window.GadgetCartComponents.ShoppingCartPage);
app.component('RegisterPage', window.GadgetCartComponents.RegisterPage);
app.component('LoginPage', window.GadgetCartComponents.LoginPage);
app.component('UserAccountPage', window.GadgetCartComponents.UserAccountPage);
app.component('UserPurchasesPage', window.GadgetCartComponents.UserPurchasesPage);

// Register store and router
app.use(window.GadgetCartStore);
app.use(router);

// Mount to DOM
app.mount('#app');