(function () {
  const Navigation = {
    template: `
      <div>
        <!-- Toast for popup errors -->
        <div 
          v-if="toast.show" 
          class="custom-toast toast-container position-fixed top-0 end-0 m-3"
          :class="'bg-' + toast.type + ' text-white p-3 rounded shadow'"
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div class="me-2">{{ toast.message }}</div>
            <button type="button" class="btn-close btn-close-white ms-2" @click="toast.show = false" aria-label="Close"></button>
          </div>
        </div>

        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
          <div class="container">
            <router-link class="navbar-brand" to="/">
              <i class="bi bi-phone me-2"></i>GadgetCart
            </router-link>

            <button 
              class="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <router-link class="nav-link" to="/" exact-active-class="active">
                    <i class="bi bi-house-door me-1"></i>Home
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/products" active-class="active">
                    <i class="bi bi-grid me-1"></i>Products
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/cart" active-class="active">
                    <i class="bi bi-cart me-1"></i>Cart
                    <span v-if="cartItemCount > 0" class="badge bg-primary ms-1">
                      {{ cartItemCount }}
                    </span>
                  </router-link>
                </li>
              </ul>

              <div class="d-flex align-items-center">
                <template v-if="isAuthenticated">
                  <div class="dropdown">
                    <button 
                      class="btn btn-outline-light dropdown-toggle w-100" 
                      type="button" 
                      id="userDropdown"
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      <i class="bi bi-person-circle me-1"></i>
                      {{ user.name || 'Account' }}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end w-100 mt-1" aria-labelledby="userDropdown">
                      <li>
                        <div class="dropdown-item text-muted small">
                          {{ maskedEmail }}
                        </div>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <router-link class="dropdown-item" to="/account">
                          <i class="bi bi-person me-2"></i>My Account
                        </router-link>
                      </li>
                      <li>
                        <router-link class="dropdown-item" to="/purchases">
                          <i class="bi bi-receipt me-2"></i>My Purchases
                        </router-link>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <button class="dropdown-item" @click="logout">
                          <i class="bi bi-box-arrow-right me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </template>
                <template v-else>
                  <router-link class="btn btn-outline-light me-2" to="/login">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Login
                  </router-link>
                  <router-link class="btn btn-primary" to="/register">
                    <i class="bi bi-person-plus me-1"></i>Register
                  </router-link>
                </template>
              </div>
            </div>
          </div>
        </nav>
      </div>
    `,

    setup() {
      const store = Vuex.useStore();
      const route = VueRouter.useRoute();
      const router = VueRouter.useRouter();

      const user = Vue.computed(() => store.state.user);
      const isAuthenticated = Vue.computed(() => !!user.value);
      const cartItemCount = Vue.computed(() => store.getters.cartItemCount);

      const toast = Vue.ref({
        show: false,
        message: '',
        type: 'danger'
      });

      const showToast = (message, type = 'danger') => {
        toast.value.message = message;
        toast.value.type = type;
        toast.value.show = true;
        setTimeout(() => {
          toast.value.show = false;
        }, 4000);
      };

      // Watch for user login/logout and initialize cart
      Vue.watch(user, async (newUser, oldUser) => {
        if (newUser && !store.state.cartInitialized) {
          await store.dispatch('initializeStore');
        }
      });

      Vue.onMounted(async () => {
        if (!store.state.cartInitialized) {
          await store.dispatch('initializeStore');
        }
      });

      const maskedEmail = Vue.computed(() => {
        const email = user.value?.email || '';
        const [name, domain] = email.split('@');
        return email && domain ? `${name.charAt(0)}****@${domain}` : '';
      });

      const logout = async () => {
        try {
          await store.dispatch('logout');
          if (route.meta?.requiresAuth) {
            router.push('/login');
          }
          showToast('You have been logged out', 'success');
        } catch (error) {
          console.error('Logout error:', error);
          showToast('Logout failed. Please try again.', 'danger');
        }
      };

      return {
        user,
        isAuthenticated,
        cartItemCount,
        maskedEmail,
        logout,
        toast,
        showToast
      };
    }
  };

  window.GadgetCartComponents = window.GadgetCartComponents || {};
  window.GadgetCartComponents.Navigation = Navigation;
})();
