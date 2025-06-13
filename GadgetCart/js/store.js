function saveCartToStorage(userId, cart) {
  if (userId) {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
  }
}

function loadCartFromStorage(userId) {
  if (userId) {
    return JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
  }
  return [];
}

async function loadCartFromDatabase(userId) {
  try {
    const response = await fetch(`/IDD/GadgetCart/php/get_cart.php?user_id=${encodeURIComponent(userId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
}
async function syncCartToDatabase(userId, cart) {
  if (!userId || !Array.isArray(cart)) return;
  try {
    const simplifiedCart = cart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    await fetch('/IDD/GadgetCart/php/update_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, cart: simplifiedCart })
    });
  } catch (error) {
    console.error('Failed to sync cart to database:', error);
  }
}


window.GadgetCartStore = Vuex.createStore({
  state() {
    return {
      cart: [],
      user: JSON.parse(localStorage.getItem('user')) || null,
      products: [],
      cartInitialized: false
    };
  },

  getters: {
    cartItemCount(state) {
      return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  },

  mutations: {
    SET_CART(state, cart) {
      state.cart = cart;
      saveCartToStorage(state.user?.id, cart);
      syncCartToDatabase(state.user?.id, cart);
    },

    SET_CART_SILENT(state, cart) {
      state.cart.splice(0, state.cart.length, ...cart);
      saveCartToStorage(state.user?.id, cart);
    },

    ADD_TO_CART(state, product) {
      const existing = state.cart.find(p => p.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
      saveCartToStorage(state.user?.id, state.cart);
      syncCartToDatabase(state.user?.id, state.cart);
    },

    DECREMENT_CART_ITEM(state, productId) {
      const item = state.cart.find(p => p.id === productId);
      if (item && item.quantity > 1) {
        item.quantity--;
        saveCartToStorage(state.user?.id, state.cart);
        syncCartToDatabase(state.user?.id, state.cart);
      }
    },

    REMOVE_FROM_CART(state, productId) {
      state.cart = state.cart.filter(p => p.id !== productId);
      saveCartToStorage(state.user?.id, state.cart);
      syncCartToDatabase(state.user?.id, state.cart);
    },

    CLEAR_CART(state) {
      state.cart = [];
      saveCartToStorage(state.user?.id, []);
      syncCartToDatabase(state.user?.id, []);
    },

    UPDATE_CART_ITEM_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.find(p => p.id === productId);
      if (item) {
        item.quantity = quantity;
        saveCartToStorage(state.user?.id, state.cart);
        syncCartToDatabase(state.user?.id, state.cart);
      }
    },

    SET_PRODUCTS(state, products) {
      state.products = products;
    },

    SET_USER(state, user) {
      if (user) {
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        state.user = null;
        localStorage.removeItem('user');
      }
    },

    SET_NOTIFICATION(state, payload) {
      console.log('Notification:', payload.message);
    }
  },

  actions: {
    async initializeStore({ commit, dispatch, state }) {
      if (!state.products.length) {
        await dispatch('fetchProducts');
      }

      if (state.user?.id && !state.cartInitialized) {
        await dispatch('syncCartFromDatabase');
      }

      state.cartInitialized = true;
    },

    async fetchProducts({ commit }) {
      try {
        // store.js (or wherever you fetch products)
        const basePath =
          location.hostname === 'localhost'
            ? '/IDD/GadgetCart'
            : ''; // empty string for production

        const response = await fetch(`${basePath}/data/products.json`);
        const products = await response.json();
        commit('SET_PRODUCTS', products);
      } catch (error) {
        console.error("Error loading products:", error);
        commit('SET_PRODUCTS', []);
      }
    },

    async login({ commit, dispatch }, credentials) {
      try {
        const response = await fetch('/IDD/GadgetCart/php/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const result = await response.json();

        if (result.success && result.user) {
          commit('SET_USER', result.user);

          await dispatch('initializeStore');

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
        const response = await fetch('/IDD/GadgetCart/php/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const result = await response.json();

        if (result.success) {
          commit('SET_NOTIFICATION', {
            type: 'success',
            message: 'Account created. Please log in.'
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
      commit('SET_CART_SILENT', []);
      commit('SET_NOTIFICATION', {
        type: 'success',
        message: 'You have been logged out.'
      });
    },

    async addToCart({ commit, dispatch, state }, product) {
      commit('ADD_TO_CART', product);

      // Sync the sanitized cart to the database
      await syncCartToDatabase(state.user?.id, state.cart);

      // Optional: immediately refresh from database to ensure it's accurate
      // await dispatch('syncCartFromDatabase');

      commit('SET_NOTIFICATION', {
        type: 'success',
        message: `${product.name} added to cart`
      });
    }
    ,

    async updateCartItemQuantity({ commit }, payload) {
      commit('UPDATE_CART_ITEM_QUANTITY', payload);
    },

    async removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },

    async clearCart({ commit }) {
      commit('CLEAR_CART');
    },

    async syncCartFromDatabase({ commit, state, dispatch }) {
      if (!state.user?.id) return;

      try {
        if (state.products.length === 0) {
          await dispatch('fetchProducts');
        }

        const result = await loadCartFromDatabase(state.user.id);

        if (result.success && Array.isArray(result.cart)) {
          const enrichedCart = result.cart.map(item => {
            const product = state.products.find(p => p.id === item.product_id);
            return product ? { ...product, quantity: item.quantity } : null;
          }).filter(Boolean);

          commit('SET_CART', enrichedCart);
        } else {
          const localCart = loadCartFromStorage(state.user.id);
          if (localCart.length > 0) {
            commit('SET_CART', localCart);
            syncCartToDatabase(state.user.id, localCart);
          }
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
        const localCart = loadCartFromStorage(state.user.id);
        commit('SET_CART', localCart);
      }

      state.cartInitialized = true;
    },

    async updateUserProfile({ commit, state }, updatedData) {
      try {
        const response = await fetch('/IDD/GadgetCart/php/update_user.php', {
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
    },
    async mergeLocalCartWithBackend({ commit, state, dispatch }) {
      if (!state.user?.id) return;

      const localCart = loadCartFromStorage(state.user.id);

      // Fetch what's in the backend already
      const backendCartResponse = await loadCartFromDatabase(state.user.id);
      let backendCart = [];

      if (backendCartResponse.success && Array.isArray(backendCartResponse.cart)) {
        backendCart = backendCartResponse.cart;
      }

      // Merge logic: prefer local quantities (or customize this logic)
      const mergedCartMap = new Map();

      backendCart.forEach(item => {
        mergedCartMap.set(item.product_id, item.quantity);
      });

      localCart.forEach(item => {
        mergedCartMap.set(item.id, item.quantity); // overwrite or insert
      });

      const mergedCart = [];
      for (const [productId, quantity] of mergedCartMap.entries()) {
        const product = state.products.find(p => p.id === productId);
        if (product) {
          mergedCart.push({ ...product, quantity });
        }
      }

      // Save to backend and localStorage
      commit('SET_CART', mergedCart);
    }
  }
});