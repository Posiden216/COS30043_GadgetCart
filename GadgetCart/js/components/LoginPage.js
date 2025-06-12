(function () {
  const LoginPage = {
    template: `
      <div class="login-page container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card login-card shadow-sm rounded-3" role="region" aria-labelledby="login-title">
              <div class="card-header bg-primary text-white rounded-top-3">
                <h2 id="login-title" class="h4 mb-0">Login</h2>
              </div>

              <div class="card-body">

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
                    <button 
                      type="button" 
                      class="btn-close btn-close-white ms-2" 
                      @click="toast.show = false" 
                      aria-label="Close"
                    ></button>
                  </div>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" role="form" aria-describedby="login-description" novalidate>
                  <p id="login-description" class="visually-hidden">
                    Please enter your email and password to log in.
                  </p>

                  <!-- Email -->
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      placeholder="e.g., abraham@example.com"
                      :class="{ 'is-invalid': errors.email }"
                      v-model.trim="form.email"
                      required
                      @input="clearError('email')"
                    >
                    <div class="invalid-feedback">{{ errors.email }}</div>
                  </div>

                  <!-- Password -->
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-group">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        class="form-control"
                        placeholder="Enter your password"
                        :class="{ 'is-invalid': errors.password }"
                        v-model.trim="form.password"
                        required
                        @input="clearError('password')"
                      >
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showPassword = !showPassword"
                        aria-label="Toggle password visibility"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback">{{ errors.password }}</div>
                  </div>

                  <!-- Submit Button -->
                  <div class="d-grid mb-3">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isLoading"
                    >
                      <span 
                        v-if="isLoading"
                        class="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span v-else>Login</span>
                    </button>
                  </div>
                </form>

                <!-- Register Link -->
                <div class="text-center">
                  <router-link to="/register" class="text-decoration-none text-primary">
                    Don’t have an account? Register
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,

    data() {
      return {
        form: {
          email: '',
          password: ''
        },
        errors: {
          email: '',
          password: ''
        },
        isLoading: false,
        showPassword: false,
        toast: {
          show: false,
          message: '',
          type: 'danger'
        }
      };
    },

    methods: {
      async handleLogin() {
        if (!this.validateForm()) return;

        this.isLoading = true;

        try {
          const response = await fetch('/IDD/GadgetCart/php/login.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.form.email,
              password: this.form.password
            })
          });

          const result = await response.json();

          if (response.ok && result.success) {
            this.$store.commit('SET_USER', result.user);

            this.$store.commit('SET_NOTIFICATION', {
              type: 'success',
              message: `Welcome back, ${result.user.name}!`
            });

            const redirect = this.$route?.query?.redirect || '/';
            this.$router.push(redirect);
          } else {
            this.showToast(result.error || 'Invalid email or password', 'danger');
          }
        } catch (error) {
          console.error('Login error:', error);
          this.showToast('Login failed. Please try again later.', 'danger');
        } finally {
          this.isLoading = false;
        }
      },

      validateForm() {
        let isValid = true;
        this.errors = { email: '', password: '' };

        if (!this.form.email) {
          this.errors.email = 'Email is required';
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(this.form.email)) {
          this.errors.email = 'Please enter a valid email';
          isValid = false;
        }

        if (!this.form.password) {
          this.errors.password = 'Password is required';
          isValid = false;
        }

        return isValid;
      },

      clearError(field) {
        this.errors[field] = '';
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

  window.GadgetCartComponents = window.GadgetCartComponents || {};
  window.GadgetCartComponents.LoginPage = LoginPage;
})();
