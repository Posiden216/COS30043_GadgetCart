(function () {
  const ProductPage = {
    template: `
      <div class="product-page container mt-4">
        <!-- Page Header -->
        <div class="row mb-4">
          <div class="col">
            <h1 class="page-title">Our Products</h1>
            <p class="text-muted">{{ filteredProducts.length }} products available</p>
          </div>
        </div>

        <!-- Filters & Sort -->
        <div class="row mb-4 g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search products..."
                v-model="searchQuery"
              />
            </div>
          </div>

          <div class="col-md-3">
            <select class="form-select" v-model="categoryFilter">
              <option value="">All Categories</option>
              <option 
                v-for="category in categories" 
                :key="category" 
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <select class="form-select" v-model="sortOption">
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="row">
          <div 
            class="col-lg-4 col-md-6 col-sm-12 mb-4"
            v-for="product in paginatedProducts"
            :key="product.id"
          >
            <div 
              class="card h-100 product-card position-relative overflow-hidden"
              @mouseenter="hovered = product.id"
              @mouseleave="hovered = null"
            >
              <!-- Static image container (not clickable) -->
              <div class="product-image-link position-relative">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="card-img-top product-image"
                />

                <!-- Hovered Description Overlay -->
                <div 
                  v-if="hovered === product.id"
                  class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 text-white d-flex align-items-center justify-content-center text-center px-3"
                  style="z-index: 2;"
                >
                  <p class="m-0">{{ product.description }}</p>
                </div>
              </div>

              <div class="card-body d-flex flex-column">
                <h3 class="h5 mb-2">
                  <!-- Product name (not clickable) -->
                  <span class="text-dark">{{ product.name }}</span>
                </h3>

                <div class="d-flex justify-content-between align-items-center mt-auto">
                  <span class="text-primary">{{ currency(product.price) }}</span>

                  <!-- Quantity Control -->
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm"
                      @click="removeFromCart(product)">
                      <i class="bi bi-dash"></i>
                    </button>

                    <span class="fw-bold">
                      {{ getProductQuantity(product.id) }}
                    </span>

                    <button class="btn btn-outline-primary btn-sm"
                      @click="addToCart(product)">
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="filteredProducts.length === 0" class="text-center py-5">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
          <button class="btn btn-link" @click="resetFilters">
            Reset filters
          </button>
        </div>

        <!-- Pagination -->
        <div class="row mt-4" v-if="totalPages > 1">
          <div class="col">
            <nav aria-label="Page navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)">
                    Previous
                  </button>
                </li>

                <li 
                  v-for="page in totalPages" 
                  :key="page" 
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="changePage(currentPage + 1)">
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    `,

    data() {
      return {
        products: [],
        searchQuery: '',
        categoryFilter: '',
        sortOption: 'name-asc',
        currentPage: 1,
        itemsPerPage: 6,
        hovered: null
      };
    },

    computed: {
      categories() {
        const unique = this.products.map(p => p.category).filter(Boolean);
        return [...new Set(unique)].sort();
      },

      filteredProducts() {
        let result = [...this.products];

        const query = this.searchQuery.trim().toLowerCase();
        if (query) {
          result = result.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query)
          );
        }

        if (this.categoryFilter) {
          result = result.filter(p => p.category === this.categoryFilter);
        }

        const [key, direction] = this.sortOption.split('-');
        result.sort((a, b) => {
          if (key === 'name') {
            return direction === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          return direction === 'asc' ? a.price - b.price : b.price - a.price;
        });

        return result;
      },

      totalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      },

      paginatedProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(start, start + this.itemsPerPage);
      }
    },

    async created() {
      await this.$store.dispatch('fetchProducts');
      this.products = this.$store.state.products;
    },

    methods: {
      addToCart(product) {
        this.$store.commit('ADD_TO_CART', {
          ...product,
          quantity: 1
        });

        this.$store.commit('SET_NOTIFICATION', {
          type: 'success',
          message: `${product.name} added to cart`
        });
      },

      removeFromCart(product) {
        const cartItem = this.$store.state.cart.find(item => item.id === product.id);

        if (cartItem && cartItem.quantity > 1) {
          this.$store.commit('DECREMENT_CART_ITEM', product.id);
          this.$store.commit('SET_NOTIFICATION', {
            type: 'info',
            message: `Reduced quantity of ${product.name}`
          });
        } else {
          this.$store.commit('REMOVE_FROM_CART', product.id);
          this.$store.commit('SET_NOTIFICATION', {
            type: 'info',
            message: `${product.name} removed from cart`
          });
        }
      },

      getProductQuantity(productId) {
        const item = this.$store.state.cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
      },

      resetFilters() {
        this.searchQuery = '';
        this.categoryFilter = '';
        this.sortOption = 'name-asc';
        this.currentPage = 1;
      },

      changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      currency(value) {
        return `$${parseFloat(value).toFixed(2)}`;
      }
    },

    watch: {
      categoryFilter() {
        this.currentPage = 1;
      },
      searchQuery() {
        this.currentPage = 1;
      }
    }
  };

  window.GadgetCartComponents = window.GadgetCartComponents || {};
  window.GadgetCartComponents.ProductPage = ProductPage;
})();
