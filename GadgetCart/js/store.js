window.GadgetCartStore = Vuex.createStore({
  state() {
    return {
      cart: [],
      user: JSON.parse(localStorage.getItem('user')) || null,
      products: []
    };
  },

  getters: {
    cartItemCount(state) {
      return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  },

  mutations: {
    ADD_TO_CART(state, product) {
      const existing = state.cart.find(p => p.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
    },

    SET_PRODUCTS(state, products) {
      state.products = products;
    },

    SET_USER(state, user) {
      if (user) {
        const normalizedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address || '',
          paymentMethod: user.payment_method || user.paymentMethod || ''
        };
        state.user = normalizedUser;
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } else {
        state.user = null;
        localStorage.removeItem('user');
      }
    },

    UPDATE_CART_ITEM_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.find(p => p.id === productId);
      if (item) item.quantity = quantity;
    },

    REMOVE_FROM_CART(state, productId) {
      state.cart = state.cart.filter(p => p.id !== productId);
    },

    CLEAR_CART(state) {
      state.cart = [];
    },

    SET_NOTIFICATION(state, payload) {
      console.log('Notification:', payload.message); // placeholder
    }
  },

  actions: {
    async fetchProducts({ commit }) {
      try {
        const response = await fetch('data/products.json');
        const products = await response.json();
        commit('SET_PRODUCTS', products);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    },

    async login({ commit }, credentials) {
      try {
        const response = await fetch('php/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const result = await response.json();

        if (result.success && result.user) {
          commit('SET_USER', result.user);
          commit('SET_NOTIFICATION', {
            type: 'success',
            message: `Welcome back, ${result.user.name}!`
          });
          return true;
        } else {
          commit('SET_NOTIFICATION', {
            type: 'error',
            message: result.error || 'Invalid login.'
          });
          return false;
        }
      } catch (err) {
        console.error('Login failed:', err);
        commit('SET_NOTIFICATION', {
          type: 'error',
          message: 'Login request failed.'
        });
        return false;
      }
    },

    async register({ commit }, userData) {
      try {
        const response = await fetch('php/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const result = await response.json();

        if (result.success) {
          commit('SET_NOTIFICATION', {
            type: 'success',
            message: `Account created. Please log in.`
          });
          return true;
        } else {
          commit('SET_NOTIFICATION', {
            type: 'error',
            message: result.error || 'Registration failed.'
          });
          return false;
        }
      } catch (err) {
        console.error('Registration failed:', err);
        commit('SET_NOTIFICATION', {
          type: 'error',
          message: 'Registration request failed.'
        });
        return false;
      }
    },

    logout({ commit }) {
      commit('SET_USER', null);
      commit('SET_NOTIFICATION', {
        type: 'success',
        message: 'You have been logged out.'
      });
    },

    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product);
      commit('SET_NOTIFICATION', {
        type: 'success',
        message: `${product.name} added to cart`
      });
    },

    async updateUserProfile({ commit, state }, updatedData) {
      try {
        const response = await fetch('php/update_user.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: state.user.id, ...updatedData })
        });

        const result = await response.json();

        if (result.success && result.user) {
          commit('SET_USER', result.user);
          commit('SET_NOTIFICATION', {
            type: 'success',
            message: 'Profile updated successfully.'
          });
          return { success: true };
        } else {
          commit('SET_NOTIFICATION', {
            type: 'error',
            message: result.error || 'Update failed.'
          });
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Update failed:', error);
        commit('SET_NOTIFICATION', {
          type: 'error',
          message: 'Profile update request failed.'
        });
        return { success: false, error: 'Request error' };
      }
    }
  }
});
