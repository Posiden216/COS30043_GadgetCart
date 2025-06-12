(function () {
  window.GadgetCartComponents = window.GadgetCartComponents || {};

  const UserAccountPage = {
    template: `
      <div class="account-page container py-4" v-if="userLoaded">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">My Account</h2>
          <div>
            <button v-if="!editing" class="btn btn-outline-secondary btn-sm me-2" @click="startEditing">
              <i class="bi bi-pencil me-1"></i> Edit Profile
            </button>
            <div v-else>
              <button class="btn btn-success btn-sm me-2" @click="saveChanges">
                <i class="bi bi-check-lg me-1"></i> Save
              </button>
              <button class="btn btn-outline-secondary btn-sm" @click="cancelChanges">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- User Summary -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body text-center py-5">
            <i class="bi bi-person-circle fs-1 text-primary mb-3"></i>
            <h4 class="mb-2">Welcome, {{ user.name || 'User' }}</h4>
            <p class="text-muted mb-1">{{ user.email }}</p>
            <p class="text-muted small">Member since: {{ formattedJoinDate }}</p>

            <hr class="my-4">

            <div class="d-grid gap-2 d-sm-flex justify-content-center">
              <router-link to="/purchases" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-receipt me-1"></i> View My Purchases
              </router-link>
              <button @click="handleLogout" class="btn btn-danger btn-sm">
                <i class="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Account Details -->
        <div class="row g-4">
          <!-- Left Column -->
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white fw-bold">Account Information</div>
              <div class="card-body">
                <div class="mb-2">
                  <strong>Name:</strong>
                  <div v-if="!editing">{{ user.name }}</div>
                  <input v-else type="text" class="form-control form-control-sm" v-model="form.name" />
                </div>

                <div class="mb-2">
                  <strong>Email:</strong>
                  <div v-if="!editing">{{ user.email }}</div>
                  <input v-else type="email" class="form-control form-control-sm" v-model="form.email" />
                </div>

                <div class="mt-3">
                  <strong>Password:</strong>
                  <div v-if="!editing">********</div>
                  <div v-else>
                    <button class="btn btn-outline-secondary btn-sm mb-2" @click="togglePasswordFields" type="button">
                      <i class="bi bi-key me-1"></i> 
                      {{ showPasswordFields ? 'Cancel Password Change' : 'Change Password' }}
                    </button>

                    <div v-if="showPasswordFields">
                      <input type="password" class="form-control form-control-sm mb-2" v-model="form.currentPassword" placeholder="Current Password" />
                      <input type="password" class="form-control form-control-sm mb-2" v-model="form.newPassword" placeholder="New Password" />
                      <input type="password" class="form-control form-control-sm" v-model="form.confirmPassword" placeholder="Confirm New Password" />
                      <div v-if="passwordError" class="text-danger small mt-2">{{ passwordError }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white fw-bold">Preferences & Settings</div>
              <div class="card-body">
                <div class="mb-2">
                  <strong>Address:</strong>
                  <div v-if="!editing">{{ user.address || 'Not set' }}</div>
                  <input v-else type="text" class="form-control form-control-sm" v-model="form.address" />
                </div>

                <div class="mb-2 mt-3">
                  <strong>Payment Method:</strong>
                  <div v-if="!editing">{{ user.paymentMethod || user.payment_method || 'Not set' }}</div>
                  <select v-else class="form-select form-select-sm" v-model="form.payment_method">
                    <option disabled value="">Choose a method</option>
                    <option>Credit Card</option>
                    <option>PayPal</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <p class="text-muted small mt-3"><i class="bi bi-bell text-muted me-2"></i> Notifications: Enabled</p>
              </div>
            </div>
          </div>

          <!-- Loyalty Tier -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white fw-bold">Loyalty Tier</div>
              <div class="card-body">
                <p><strong>Tier:</strong> {{ loyaltyTier }}</p>
                <p><strong>Discount:</strong> {{ loyaltyDiscount }} off all purchases</p>
                <p class="text-muted small">Enjoy exclusive savings as a valued customer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,

    setup() {
      const store = Vuex.useStore();
      const router = VueRouter.useRouter();

      const user = Vue.computed(() => store.state.user || {});
      const userLoaded = Vue.ref(false);
      const editing = Vue.ref(false);
      const showPasswordFields = Vue.ref(false);
      const passwordError = Vue.ref('');

      const form = Vue.reactive({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        address: '',
        payment_method: ''
      });

      const showToast = (message, type = 'success') => {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close btn-close-white" aria-label="Close"></button>
          </div>
        `;

        toast.querySelector('button').addEventListener('click', () => toast.remove());
        toastContainer.appendChild(toast);

        setTimeout(() => {
          toast.remove();
        }, 4000);
      };

      const populateForm = () => {
        form.name = user.value.name || '';
        form.email = user.value.email || '';
        form.address = user.value.address || '';
        form.payment_method = user.value.paymentMethod || user.value.payment_method || '';
        form.currentPassword = '';
        form.newPassword = '';
        form.confirmPassword = '';
        showPasswordFields.value = false;
        passwordError.value = '';
      };

      const togglePasswordFields = () => {
        showPasswordFields.value = !showPasswordFields.value;
        if (!showPasswordFields.value) {
          form.currentPassword = '';
          form.newPassword = '';
          form.confirmPassword = '';
          passwordError.value = '';
        }
      };

      const startEditing = () => {
        editing.value = true;
        populateForm();
      };

      const cancelChanges = () => {
        editing.value = false;
        populateForm();
      };

      const saveChanges = async () => {
        passwordError.value = '';

        if (showPasswordFields.value) {
          if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            passwordError.value = 'All password fields are required.';
            return;
          }
          if (form.newPassword !== form.confirmPassword) {
            passwordError.value = 'New passwords do not match.';
            return;
          }
        }

        const updatedUser = {
          id: user.value.id,
          name: form.name,
          email: form.email,
          address: form.address,
          payment_method: form.payment_method,
          new_password: showPasswordFields.value ? form.newPassword : null,
          current_password: showPasswordFields.value ? form.currentPassword : null
        };

        try {
          const response = await fetch('php/update_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
          });

          const result = await response.json();

          if (result.success) {
            store.commit('SET_USER', result.user);
            editing.value = false;
            showToast('Profile updated successfully.', 'success');
          } else {
            showToast(result.error || 'Update failed.', 'danger');
          }
        } catch (err) {
          console.error('Update failed:', err);
          showToast('Error updating profile.', 'danger');
        }
      };

      const handleLogout = () => {
        store.dispatch('logout');
        router.push('/login');
      };

      const formattedJoinDate = Vue.computed(() => {
        const joinDate = user.value.createdAt || user.value.created_at || new Date().toISOString();
        return new Date(joinDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      });

      const loyaltyTier = Vue.ref('Bronze');
      const loyaltyDiscount = Vue.computed(() => {
        switch (loyaltyTier.value) {
          case 'Gold': return '15%';
          case 'Silver': return '10%';
          default: return '5%';
        }
      });

      Vue.onMounted(() => {
        if (!store.state.user) {
          router.push('/login');
        } else {
          populateForm();
          userLoaded.value = true;
        }
      });

      return {
        user,
        userLoaded,
        formattedJoinDate,
        handleLogout,
        editing,
        startEditing,
        cancelChanges,
        saveChanges,
        form,
        passwordError,
        loyaltyTier,
        loyaltyDiscount,
        showPasswordFields,
        togglePasswordFields
      };
    }
  };

  window.GadgetCartComponents.UserAccountPage = UserAccountPage;
})();
