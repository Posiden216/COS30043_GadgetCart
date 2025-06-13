window.GadgetCartComponents = window.GadgetCartComponents || {};

window.GadgetCartComponents.UserPurchasesPage = {
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Your Purchases</h2>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading your purchases...</p>
      </div>

      <div v-else-if="purchases.length === 0" class="text-center py-5">
        <i class="bi bi-bag-x fs-1 text-muted"></i>
        <h4 class="mt-3">No purchases found</h4>
        <router-link to="/products" class="btn btn-primary mt-3">Shop Now</router-link>
      </div>

      <div v-else>
        <div v-for="purchase in purchases" :key="purchase.id" class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Order #{{ purchase.id }}</h5>
              <small class="text-muted">Date: {{ formatDate(purchase.purchase_date) }}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-primary">Total: {{ formatCurrency(purchase.total_spent) }}</span>
            </div>
          </div>
          
          <div class="card-body">
            <div v-for="(item, index) in purchase.items" :key="index" class="mb-3">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <img :src="item.image" :alt="item.name" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="flex-grow-1">
                  <h6 class="mt-0 mb-1">{{ item.name }}</h6>
                  <p class="mb-1 text-muted">{{ item.category }}</p>
                  <div v-if="purchase.editing">
                    <label class="form-label mb-1 small">Quantity:</label>
                    <input type="number" v-model.number="item.quantity" class="form-control form-control-sm" min="1" />
                  </div>
                  <p class="mb-0" v-else>
                    {{ item.quantity }} × {{ formatCurrency(item.price) }} =
                    <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div class="text-end mt-3">
              <button v-if="!purchase.editing" class="btn btn-outline-secondary btn-sm me-2" @click="enableEdit(purchase)">Edit</button>
              <button class="btn btn-outline-danger btn-sm me-2" @click="deletePurchase(purchase)">Delete</button>
              <div v-if="purchase.editing" class="d-inline-block">
                <button type="button" class="btn btn-success btn-sm me-2" @click="saveEdit(purchase)">Save</button>
                <button type="button" class="btn btn-danger btn-sm" @click="cancelEdit(purchase)">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      purchases: [],
      loading: true
    };
  },

  methods: {
    formatCurrency(value) {
      return '$' + parseFloat(value).toFixed(2);
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    enableEdit(purchase) {
      purchase.editing = true;
      purchase.originalItems = JSON.parse(JSON.stringify(purchase.items));
    },

    cancelEdit(purchase) {
      purchase.items = JSON.parse(JSON.stringify(purchase.originalItems));
      purchase.editing = false;
    },

    async saveEdit(purchase) {
      const user = this.$store.state.user;
      if (!user) return;

      try {
        const response = await fetch('php/update_purchase.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            purchaseId: purchase.id,
            items: purchase.items
          })
        });

        const result = await response.json();

        if (result.success) {
          this.$store.commit('SET_NOTIFICATION', {
            type: 'success',
            message: 'Purchase updated successfully'
          });
          purchase.editing = false;
          purchase.total_spent = result.total_spent;
        } else {
          throw new Error(result.error || 'Failed to update purchase');
        }
      } catch (error) {
        console.error('Error saving edit:', error);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger',
          message: 'Unable to save changes'
        });
      }
    },

    async deletePurchase(purchase) {
      const user = this.$store.state.user;
      if (!user) {
        this.$router.push('/login');
        return;
      }

      if (!purchase.id || !user.id) {
        console.error('Missing purchase ID or user ID');
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger',
          message: 'Missing purchase ID or user ID'
        });
        return;
      }

      if (!confirm('Are you sure you want to delete this purchase?')) return;

      try {
        const response = await fetch('php/delete_purchase.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            purchaseId: purchase.id,
            userId: user.id
          })
        });

        const result = await response.json();

        if (result.success) {
          this.purchases = this.purchases.filter(p => p.id !== purchase.id);
          this.$store.commit('SET_NOTIFICATION', {
            type: 'success',
            message: 'Purchase deleted successfully'
          });
        } else {
          throw new Error(result.error || 'Failed to delete purchase');
        }
      } catch (error) {
        console.error('Error deleting purchase:', error);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger',
          message: 'Unable to delete purchase'
        });
      }
    },

    async fetchPurchases() {
      const user = this.$store.state.user;
      if (!user) {
        this.$router.push('/login');
        return;
      }

      try {
        const response = await fetch(`php/get_user_purchases.php?userId=${user.id}`);
        const result = await response.json();

        if (result.success) {
          this.purchases = result.purchases.map(purchase => ({
            ...purchase,
            editing: false
          }));
        } else {
          this.$store.commit('SET_NOTIFICATION', {
            type: 'danger',
            message: result.error || 'Failed to load purchases'
          });
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'danger',
          message: 'Unable to load your purchases'
        });
      } finally {
        this.loading = false;
      }
    }
  },

  created() {
    this.fetchPurchases();
  }
};
