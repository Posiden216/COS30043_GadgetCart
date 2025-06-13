window.GadgetCartComponents = window.GadgetCartComponents || {};

window.GadgetCartComponents.ShoppingCartPage = {
  template: `
    <div class="shopping-cart container-lg py-5">
      <div class="row justify-content-center">
        <!-- Page Title -->
        <div class="col-12 text-center mb-3">
          <h3 class="fw-semibold mb-2">🛒 Your Cart</h3>
          <div v-if="cart.length > 0" class="mb-3">
            <div class="d-flex flex-column align-items-center mx-auto" style="max-width: 400px;">
              <p class="text-muted mb-2">{{ promoMessage }}</p>
              <div class="progress w-100" style="height: 6px;">
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar" 
                  :style="{ width: progressPercent + '%' }" 
                  :aria-valuenow="progressPercent" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Content -->
        <div class="col-12 col-xl-10">
          <!-- Top Buttons -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <router-link to="/products" class="btn btn-outline-primary">
              <i class="bi bi-plus-circle me-2"></i>Add More Items
            </router-link>
            <div class="d-flex align-items-center gap-3">
              <span class="text-muted small">{{ cartItemCount }} items in your cart</span>
              <button 
                v-if="cart.length > 0" 
                class="btn btn-outline-danger btn-sm"
                @click="clearCart"
              >
                <i class="bi bi-trash me-2"></i>Clear Cart
              </button>
            </div>
          </div>

          <!-- Empty Cart -->
          <div v-if="cart.length === 0" class="text-center py-5 bg-light rounded-3">
            <i class="bi bi-cart-x text-muted display-4"></i>
            <h4 class="mt-3 fw-semibold">Your cart is empty</h4>
            <p class="text-muted">Start shopping to add items to your cart</p>
            <router-link to="/products" class="btn btn-primary px-4 mt-2">
              Continue Shopping
            </router-link>
          </div>

          <!-- Cart Items -->
          <div v-else class="border-top border-bottom">
            <!-- Select All -->
            <div class="form-check py-3 border-bottom">
              <input
                type="checkbox"
                class="form-check-input"
                id="selectAll"
                :checked="allSelected"
                @change="toggleSelectAll"
              >
              <label class="form-check-label fw-semibold text-base" for="selectAll">
                Select all items
              </label>
            </div>

            <!-- Cart Items -->
            <div 
              v-for="item in cart" 
              :key="item.id" 
              class="cart-item py-4 border-bottom"
            >
              <div class="row align-items-center">
                <div class="col-auto">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    v-model="selectedItemIds"
                    :value="item.id"
                    :aria-label="'Select ' + item.name"
                  >
                </div>
                <div class="col-3 col-md-2">
                  <img :src="item.image" :alt="item.name" class="img-fluid rounded shadow-sm">
                </div>
                <div class="col-5 col-md-6">
                  <h6 class="mb-1 fw-semibold">{{ item.name }}</h6>
                  <p class="text-muted small mb-1">{{ item.category }}</p>
                  <p class="fw-bold small">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="col-3 col-md-2">
                  <div class="input-group input-group-sm">
                    <button 
                      class="btn btn-outline-secondary" 
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input 
                      type="text" 
                      class="form-control text-center" 
                      v-model.number="item.quantity"
                      @blur="validateQuantity(item)"
                      aria-label="Quantity"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      @click="updateQuantity(item.id, item.quantity + 1)"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="col-1 text-end">
                  <button 
                    class="btn btn-link text-danger btn-sm"
                    @click="removeFromCart(item.id)"
                    aria-label="Remove item"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Panels -->
          <div class="row mt-5 gy-4">
            <!-- Loyalty Discount -->
            <div class="col-md-6">
              <div class="p-4 bg-light rounded-3 h-100">
                <h6 class="fw-bold mb-3">Loyalty Discount</h6>
                <div v-if="user">
                  <p class="mb-2 small">Hi {{ user.name }}, enjoy your exclusive member benefit.</p>
                  <div v-if="user.tier === 'bronze'" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="useDiscount" 
                      v-model="useLoyaltyDiscount"
                    >
                    <label class="form-check-label small" for="useDiscount">
                      Use 5% Bronze Member Discount
                    </label>
                  </div>
                  <div v-else class="text-muted small">
                    Loyalty discount is only available for Bronze tier members.
                  </div>
                </div>
                <div v-else class="text-muted small">
                  Please log in to check your loyalty discount.
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-md-6">
              <div class="bg-white shadow rounded-4 p-4 h-100">
                <h5 class="text-center fw-bold mb-4">Order Summary</h5>

                <div class="d-flex justify-content-between mb-2 small">
                  <span class="text-muted">Subtotal ({{ selectedItems.length }} items)</span>
                  <span>{{ formatCurrency(selectedSubtotal) }}</span>
                </div>

                <div class="d-flex justify-content-between mb-2 small">
                  <span class="text-muted">Shipping</span>
                  <span>{{ formatCurrency(shippingCost) }}</span>
                </div>

                <div class="d-flex justify-content-between mb-2 small">
                  <span class="text-muted">Tax</span>
                  <span>{{ formatCurrency(tax) }}</span>
                </div>

                <div 
                  v-if="useLoyaltyDiscount" 
                  class="d-flex justify-content-between text-success mb-2 small"
                >
                  <span>Loyalty Discount</span>
                  <span>-{{ formatCurrency(loyaltyDiscount) }}</span>
                </div>

                <hr class="my-3">

                <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Total</span>
                  <span>{{ formatCurrency(total) }}</span>
                </div>

                <button 
                  class="btn btn-primary w-100 py-2"
                  :disabled="selectedItems.length === 0"
                  @click="checkout"
                >
                  Proceed to Checkout
                </button>

                <div v-if="selectedItems.length > 0" class="mt-3 text-center small text-muted">
                  <i class="bi bi-lock-fill me-1"></i>Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      selectedItemIds: []
    };
  },

  computed: {
    cart() { return this.$store.state.cart },
    user() { return this.$store.state.user },
    useLoyaltyDiscount: {
      get() { return this.$store.state.useLoyaltyDiscount },
      set(val) { this.$store.commit('SET_USE_LOYALTY_DISCOUNT', val) }
    },
    cartItemCount() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    selectedItems() {
      return this.cart.filter(item => this.selectedItemIds.includes(item.id));
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    shippingCost() {
      return this.selectedSubtotal > 0 ? 10 : 0;
    },
    tax() {
      return this.selectedSubtotal * 0.10;
    },
    loyaltyDiscount() {
      return this.useLoyaltyDiscount ? this.selectedSubtotal * 0.05 : 0;
    },
    total() {
      return this.selectedSubtotal + this.shippingCost + this.tax - this.loyaltyDiscount;
    },
    allSelected() {
      return this.cart.length > 0 && this.selectedItemIds.length === this.cart.length;
    },
    amountToNextTier() {
      return Math.max(0, 1000 - this.selectedSubtotal);
    },
    promoMessage() {
      return `Shop for $${this.amountToNextTier.toFixed(2)} more to unlock the next tier!`;
    },
    progressPercent() {
      return Math.min(100, (this.selectedSubtotal / 1000) * 100);
    }
  },

  methods: {
    toggleSelectAll(event) {
      this.selectedItemIds = event.target.checked ? this.cart.map(item => item.id) : [];
    },
    updateQuantity(id, newQty) {
      const qty = Math.max(1, newQty);
      this.$store.commit('UPDATE_CART_ITEM_QUANTITY', { productId: id, quantity: qty });
    },
    validateQuantity(item) {
      if (!item.quantity || item.quantity < 1 || isNaN(item.quantity)) {
        item.quantity = 1;
      }
      this.updateQuantity(item.id, item.quantity);
    },
    removeFromCart(id) {
      this.$store.commit('REMOVE_FROM_CART', id);
      this.selectedItemIds = this.selectedItemIds.filter(i => i !== id);
    },
    clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
        this.$store.commit('CLEAR_CART');
        this.selectedItemIds = [];
      }
    },
    async checkout() {
      const user = this.$store.state.user;
      if (!user) return this.$router.push('/login');
      try {
        const res = await fetch('/IDD/GadgetCart/php/checkout.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, cart: this.selectedItems })
        });
        const result = await res.json();
        if (result.success) {
          this.selectedItems.forEach(item => this.$store.commit('REMOVE_FROM_CART', item.id));
          this.selectedItemIds = [];
          this.$router.push('/purchases');
        } else {
          this.$store.commit('SET_NOTIFICATION', {
            type: 'danger', message: result.error || 'Checkout failed'
          });
        }
      } catch (err) {
        console.error(err);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger', message: 'Checkout failed. Please try again.'
        });
      }
    },
    formatCurrency(value) {
      return '$' + value.toFixed(2);
    }
  },

  async mounted() {
    // Only fetch from DB if user is logged in and cart is empty
    if (this.user && this.cart.length === 0) {
      await this.$store.dispatch('syncCartFromDatabase');
    }
    // Select all items by default
    this.selectedItemIds = this.cart.map(item => item.id);
  },

  watch: {
    user(newUser) {
      if (newUser && this.cart.length === 0) {
        this.$store.dispatch('syncCartFromDatabase').then(() => {
          this.selectedItemIds = this.cart.map(item => item.id);
        });
      }
    }
  }
};
