window.GadgetCartComponents = window.GadgetCartComponents || {};

window.GadgetCartComponents.MainPage = {
  template: `
    <div class="main-page">
      <!-- Toast Notification -->
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

      <!-- Hero Banner -->
      <section class="hero-banner mb-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h1 class="hero-title">Welcome to GadgetCart</h1>
              <p class="hero-subtitle">Discover the latest tech accessories at unbeatable prices</p>
              <router-link to="/products" class="btn btn-primary btn-lg mt-2">Shop Now</router-link>
            </div>
            <div class="col-md-6">
              <img src="images/hero-devices.jpg" alt="Tech gadgets" class="img-fluid hero-image rounded shadow">
            </div>
          </div>
        </div>
      </section>

      <!-- Perks Section -->
      <section class="perks-section py-4 bg-white border-top border-bottom">
        <div class="container">
          <div class="row text-center">
            <div class="col-6 col-md-3 mb-3 mb-md-0">
              <i class="bi bi-truck display-6 text-primary mb-2"></i>
              <p class="mb-0">Fast Delivery</p>
            </div>
            <div class="col-6 col-md-3 mb-3 mb-md-0">
              <i class="bi bi-headset display-6 text-primary mb-2"></i>
              <p class="mb-0">Customer Support</p>
            </div>
            <div class="col-6 col-md-3">
              <i class="bi bi-shield-check display-6 text-primary mb-2"></i>
              <p class="mb-0">Secure Payment</p>
            </div>
            <div class="col-6 col-md-3">
              <i class="bi bi-star display-6 text-primary mb-2"></i>
              <p class="mb-0">Top-rated Products</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bestsellers Section -->
      <section class="featured-products py-5">
        <div class="container">
          <h2 class="section-title text-center mb-4">Bestsellers</h2>

          <div v-if="topBestsellers.length === 0 && !fetchError" class="text-center mb-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else-if="!fetchError" class="row">
            <div 
              class="col-6 col-md-4 col-lg-3 mb-4"
              v-for="product in topBestsellers"
              :key="product.id"
            >
              <div 
                class="product-card card h-100 border-0 position-relative overflow-hidden"
                @mouseenter="hovered = product.id"
                @mouseleave="hovered = null"
              >
                <div class="position-relative">
                  <img 
                    :src="'/IDD/GadgetCart/' + product.image" 
                    :alt="product.name"
                    class="card-img-top product-image rounded-top"
                  >

                  <!-- Hover description overlay -->
                  <transition name="fade">
                    <div 
                      v-if="hovered === product.id"
                      class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 text-white d-flex align-items-center justify-content-center text-center px-3"
                      style="z-index: 10; pointer-events: none;"
                    >
                      <p class="m-0">{{ product.description }}</p>
                    </div>
                  </transition>
                </div>

                <div class="card-body">
                  <h5 class="product-title">{{ product.name }}</h5>
                  <p class="product-price">{{ formatCurrency(product.price) }}</p>
                </div>

                <div class="card-footer bg-transparent position-relative" style="z-index: 11;">
                  <div v-if="!cartQuantities[product.id]">
                    <button 
                      @click="addToCart(product)"
                      class="btn btn-sm btn-outline-primary w-100"
                    >
                      Add to Cart
                    </button>
                  </div>
                  <div v-else class="d-flex align-items-center justify-content-between">
                    <button 
                      class="btn btn-sm btn-outline-secondary px-3"
                      @click="decrementCart(product.id)"
                    >−</button>
                    <span class="mx-2">{{ cartQuantities[product.id] }}</span>
                    <button 
                      class="btn btn-sm btn-outline-primary px-3"
                      @click="addToCart(product)"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-danger">
            <p>Failed to load products. Please try again later.</p>
          </div>

          <div class="text-center mt-3">
            <router-link to="/products" class="btn btn-outline-secondary">
              Show More
            </router-link>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section py-5 bg-light mt-5">
        <div class="container text-center">
          <h3 class="mb-3">Ready to upgrade your tech?</h3>
          <router-link to="/register" class="btn btn-secondary btn-lg">
            Join GadgetCart Now
          </router-link>
        </div>
      </section>

      <!-- Footer Section -->
      <footer class="site-footer">
        <div class="container">
          <div class="row">
            <div class="col-md-6 mb-3">
              <h5>About GadgetCart</h5>
              <p>
                GadgetCart is your one-stop shop for the latest and greatest in tech accessories. We offer unbeatable prices, fast shipping, and top-rated customer service.
              </p>
            </div>
            <div class="col-md-6 mb-3">
              <h5>Contact</h5>
              <p>Email: support@gadgetcart.com</p>
              <p>Phone: +1 (800) 123-4567</p>
            </div>
          </div>
          <div class="text-center mt-4">
            <p class="mb-0">&copy; 2025 GadgetCart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,

  data() {
    return {
      toast: {
        show: false,
        message: '',
        type: 'danger'
      },
      fetchError: false,
      hovered: null
    };
  },

  computed: {
    topBestsellers() {
      return [...this.$store.state.products]
        .filter(p => typeof p.sales === 'number')
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4);
    },
    cartQuantities() {
      const quantities = {};
      for (const item of this.$store.state.cart) {
        quantities[item.id] = item.quantity;
      }
      return quantities;
    }
  },

  async created() {
    try {
      if (this.$store.state.products.length === 0) {
        await this.$store.dispatch('fetchProducts');
      }
    } catch (error) {
      this.fetchError = true;
      this.showToast('Failed to load products. Please refresh the page.', 'danger');
      console.error('Product fetch error:', error);
    }
  },

  methods: {
    addToCart(product) {
      try {
        this.$store.commit('ADD_TO_CART', product);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'success',
          message: `${product.name} added to cart!`
        });
      } catch (error) {
        console.error('Add to cart error:', error);
        this.showToast('Could not add product to cart.', 'danger');
      }
    },

    decrementCart(productId) {
      this.$store.commit('DECREMENT_CART_ITEM', productId);
    },

    formatCurrency(value) {
      return 'RM' + parseFloat(value).toFixed(2);
    },

    showToast(message, type = 'danger') {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      setTimeout(() => {
        this.toast.show = false;
      }, 4000);
    }
  }
};
