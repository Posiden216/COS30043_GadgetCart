window.GadgetCartComponents = window.GadgetCartComponents || {};

window.GadgetCartComponents.ShoppingCartPage = {
  template: `
    <div class="shopping-cart container py-4">
      <div class="row">
        <!-- Cart Items -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header bg-white border-bottom-0">
              <h2 class="h4 mb-0">Your Shopping Cart</h2>
            </div>

            <div class="card-body">
              <!-- Empty Cart -->
              <div v-if="cart.length === 0" class="text-center py-5" role="status" aria-live="polite">
                <i class="bi bi-cart-x fs-1 text-muted" aria-hidden="true"></i>
                <h3 class="mt-3">Your cart is empty</h3>
                <p class="text-muted">Browse our products to add items</p>
                <router-link to="/products" class="btn btn-primary">
                  Continue Shopping
                </router-link>
              </div>

              <!-- Cart Table -->
              <div v-else class="table-responsive">
                <table class="table cart-table align-middle" aria-label="Shopping cart items">
                  <thead>
                    <tr>
                      <th scope="col" style="width: 120px">Product</th>
                      <th scope="col">Details</th>
                      <th scope="col" class="text-center">Quantity</th>
                      <th scope="col" class="text-end">Price</th>
                      <th scope="col" class="text-end">Total</th>
                      <th scope="col" class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in cart" :key="item.id">
                      <td>
                        <router-link :to="'/product/' + item.id">
                          <img :src="item.image" :alt="item.name" class="img-thumbnail img-fluid" />
                        </router-link>
                      </td>
                      <td>
                        <router-link :to="'/product/' + item.id" class="text-decoration-none">
                          <h5 class="mb-1">{{ item.name }}</h5>
                        </router-link>
                        <small class="text-muted">{{ item.category }}</small>
                      </td>
                      <td class="align-middle">
                        <div class="d-flex justify-content-center align-items-center">
                          <button 
                            class="btn btn-sm btn-outline-secondary"
                            @click="updateQuantity(item.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                            aria-label="Decrease quantity"
                          >
                            <i class="bi bi-dash"></i>
                          </button>

                          <input
                            type="number"
                            class="form-control form-control-sm text-center mx-2"
                            style="width: 60px"
                            :aria-label="'Quantity for ' + item.name"
                            min="1"
                            v-model.number="item.quantity"
                            @blur="validateQuantity(item)"
                          >

                          <button 
                            class="btn btn-sm btn-outline-secondary"
                            @click="updateQuantity(item.id, item.quantity + 1)"
                            aria-label="Increase quantity"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td class="text-end align-middle">
                        {{ formatCurrency(item.price) }}
                      </td>
                      <td class="text-end align-middle">
                        {{ formatCurrency(item.price * item.quantity) }}
                      </td>
                      <td class="text-end align-middle">
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click="removeFromCart(item.id)"
                          aria-label="Remove item"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-3">
            <router-link to="/products" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </router-link>

            <button 
              v-if="cart.length > 0"
              class="btn btn-outline-danger"
              @click="clearCart"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4 mt-4 mt-lg-0">
          <div class="card sticky-top" style="top: 20px">
            <div class="card-header bg-white">
              <h3 class="h5 mb-0">Order Summary</h3>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{{ formatCurrency(shippingCost) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>Tax (10%):</span>
                <span>{{ formatCurrency(tax) }}</span>
              </div>

              <hr>

              <div class="d-flex justify-content-between fw-bold fs-5">
                <span>Total:</span>
                <span>{{ formatCurrency(total) }}</span>
              </div>

              <button 
                class="btn btn-primary w-100 mt-4"
                :disabled="cart.length === 0"
                @click="checkout"
              >
                Proceed to Checkout
              </button>

              <div v-if="cart.length > 0" class="mt-3 text-center">
                <small class="text-muted">
                  <i class="bi bi-lock-fill me-1"></i>
                  Secure checkout
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  computed: {
    cart() {
      return this.$store.state.cart;
    },
    subtotal() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    shippingCost() {
      return this.subtotal > 0 ? 10 : 0;
    },
    tax() {
      return this.subtotal * 0.10;
    },
    total() {
      return this.subtotal + this.shippingCost + this.tax;
    }
  },

  methods: {
    updateQuantity(productId, newQuantity) {
      const quantity = Math.max(1, newQuantity);
      this.$store.commit('UPDATE_CART_ITEM_QUANTITY', { productId, quantity });
    },

    validateQuantity(item) {
      if (!item.quantity || item.quantity < 1 || isNaN(item.quantity)) {
        item.quantity = 1;
      }
      this.$store.commit('UPDATE_CART_ITEM_QUANTITY', {
        productId: item.id,
        quantity: item.quantity
      });
    },

    removeFromCart(productId) {
      this.$store.commit('REMOVE_FROM_CART', productId);
      this.$store.commit('SET_NOTIFICATION', {
        type: 'info',
        message: 'Item removed from cart'
      });
    },

    clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
        this.$store.commit('CLEAR_CART');
        this.$store.commit('SET_NOTIFICATION', {
          type: 'info',
          message: 'Cart cleared'
        });
      }
    },

    async checkout() {
      const user = this.$store.state.user;
      if (!user) {
        this.$router.push('/login');
        return;
      }

      try {
        console.log('Checkout request payload:', {
          userId: user.id,
          cart: this.cart
        });

        const response = await fetch('./php/checkout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            cart: this.cart
          })
        });

        const text = await response.text();

        try {
          const result = JSON.parse(text);

          if (result.success) {
            this.$store.commit('CLEAR_CART');
            this.$router.push('/purchases');
          } else {
            this.$store.commit('SET_NOTIFICATION', {
              type: 'danger',
              message: result.error || 'Checkout failed'
            });
          }
        } catch (jsonError) {
          console.error('Invalid JSON from checkout.php:', text);
          this.$store.commit('SET_NOTIFICATION', {
            type: 'danger',
            message: 'Checkout failed. Invalid server response.'
          });
        }
      } catch (error) {
        console.error('Checkout error:', error);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger',
          message: 'Checkout failed. Please try again.'
        });
      }
    },

    formatCurrency(value) {
      return '$' + value.toFixed(2);
    }
  }
};
