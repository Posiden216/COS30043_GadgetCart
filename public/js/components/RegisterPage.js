window.GadgetCartComponents = window.GadgetCartComponents || {};

window.GadgetCartComponents.RegisterPage = {
  template: `
  <div class="register-page container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card register-card shadow" role="region" aria-labelledby="register-title">
          <div class="card-header bg-primary text-white">
            <h2 id="register-title" class="h4 mb-0">Create Account</h2>
          </div>

          <div class="card-body">
            <form @submit.prevent="handleRegister" novalidate aria-describedby="register-description">
              <p id="register-description" class="visually-hidden">
                Please fill out this form to create an account.
              </p>

              <!-- Name -->
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  class="form-control"
                  placeholder="e.g., Abraham"
                  :class="{ 'is-invalid': errors.name }"
                  v-model.trim="form.name"
                  @input="clearError('name')"
                  required
                >
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="e.g., abraham@example.com"
                  :class="{ 'is-invalid': errors.email }"
                  v-model.trim="form.email"
                  @input="clearError('email')"
                  required
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
                    placeholder="At least 8 characters"
                    :class="{ 'is-invalid': errors.password }"
                    v-model.trim="form.password"
                    required
                    minlength="8"
                    @input="checkPasswordStrength"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div class="invalid-feedback">{{ errors.password }}</div>
                <password-strength-meter :strength="passwordStrength" />
              </div>

              <!-- Confirm Password -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  class="form-control"
                  placeholder="Re-enter your password"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  v-model.trim="form.confirmPassword"
                  required
                  @input="clearError('confirmPassword')"
                >
                <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
              </div>

              <!-- Address -->
              <div class="mb-3">
                <label for="address" class="form-label">Saved Address</label>
                <input
                  type="text"
                  id="address"
                  class="form-control"
                  placeholder="e.g., 123 Main Street, San Francisco, CA"
                  :class="{ 'is-invalid': errors.address }"
                  v-model.trim="form.address"
                  @input="clearError('address')"
                  required
                >
                <div class="invalid-feedback">{{ errors.address }}</div>
              </div>

              <!-- Payment Method -->
              <div class="mb-4">
                <label for="paymentMethod" class="form-label">Preferred Payment Method</label>
                <select
                  id="paymentMethod"
                  class="form-select"
                  :class="{ 'is-invalid': errors.paymentMethod }"
                  v-model="form.paymentMethod"
                  @change="clearError('paymentMethod')"
                  required
                >
                  <option value="" disabled selected>Select a payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <div class="invalid-feedback">{{ errors.paymentMethod }}</div>
              </div>

              <!-- Terms Checkbox -->
              <div class="mb-4 form-check">
                <input
                  type="checkbox"
                  id="terms"
                  class="form-check-input"
                  :class="{ 'is-invalid': errors.terms }"
                  v-model="form.terms"
                >
                <label for="terms" class="form-check-label">
                  I agree to the <router-link to="/terms">Terms of Service</router-link>
                </label>
                <div class="invalid-feedback">{{ errors.terms }}</div>
              </div>

              <!-- Submit -->
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  {{ isSubmitting ? 'Creating Account...' : 'Register' }}
                </button>
              </div>
            </form>

            <!-- Redirect -->
            <div class="mt-3 text-center">
              <p class="mb-0">
                Already have an account?
                <router-link to="/login" class="text-primary">Sign in</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`,

  components: {
    PasswordStrengthMeter: {
      props: ['strength'],
      template: `
        <div class="password-strength mt-2" aria-live="polite" aria-atomic="true">
          <div class="progress" style="height: 4px;">
            <div
              class="progress-bar"
              :class="strengthClass"
              role="progressbar"
              :style="{ width: strength + '%' }"
            ></div>
          </div>
          <small class="text-muted" :class="strengthTextClass">{{ strengthText }}</small>
        </div>
      `,
      computed: {
        strengthClass() {
          if (this.strength < 40) return 'bg-danger';
          if (this.strength < 70) return 'bg-warning';
          return 'bg-success';
        },
        strengthText() {
          if (this.strength < 20) return 'Very Weak';
          if (this.strength < 40) return 'Weak';
          if (this.strength < 60) return 'Fair';
          if (this.strength < 80) return 'Good';
          return 'Strong';
        },
        strengthTextClass() {
          if (this.strength < 40) return 'text-danger';
          if (this.strength < 70) return 'text-warning';
          return 'text-success';
        }
      }
    }
  },

  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false,
        address: '',
        paymentMethod: ''
      },
      errors: {
        name: '', email: '', password: '', confirmPassword: '',
        terms: '', address: '', paymentMethod: ''
      },
      passwordStrength: 0,
      showPassword: false,
      isSubmitting: false
    };
  },

  methods: {
    async handleRegister() {
      if (!this.validateForm()) return;
      this.isSubmitting = true;

      try {
        const response = await fetch('/IDD/GadgetCart/php/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            password: this.form.password,
            address: this.form.address,
            payment_method: this.form.paymentMethod
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          this.$store.commit('SET_NOTIFICATION', {
            type: 'success',
            message: 'Registration successful! You can now log in.'
          });
          this.$router.push('/login');
        } else {
          this.errors.email = result.error || 'Registration failed.';
          this.$store.commit('SET_NOTIFICATION', {
            type: 'error',
            message: result.error || 'Registration failed.'
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.$store.commit('SET_NOTIFICATION', {
          type: 'error',
          message: 'Server error. Please try again later.'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    validateForm() {
      let isValid = true;
      this.errors = {
        name: '', email: '', password: '', confirmPassword: '',
        terms: '', address: '', paymentMethod: ''
      };

      if (!this.form.name) {
        this.errors.name = 'Full name is required.';
        isValid = false;
      }

      const email = this.form.email;
      if (!email) {
        this.errors.email = 'Email is required.';
        isValid = false;
      } else if (email.length < 5) {
        this.errors.email = 'Email must be at least 5 characters.';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        this.errors.email = 'Email format is invalid.';
        isValid = false;
      }

      if (!this.form.password || this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters.';
        isValid = false;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match.';
        isValid = false;
      }

      if (!this.form.address) {
        this.errors.address = 'Address is required.';
        isValid = false;
      }

      if (!this.form.paymentMethod) {
        this.errors.paymentMethod = 'Please select a payment method.';
        isValid = false;
      }

      if (!this.form.terms) {
        this.errors.terms = 'You must agree to the terms.';
        isValid = false;
      }

      return isValid;
    },

    checkPasswordStrength() {
      const password = this.form.password;
      let strength = 0;

      strength += Math.min(password.length / 8 * 25, 25);
      if (/\d/.test(password)) strength += 15;
      if (/[!@#$%^&*]/.test(password)) strength += 20;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
      if (/password|123|qwerty/i.test(password)) strength -= 30;

      this.passwordStrength = Math.max(0, Math.min(100, strength));
      this.clearError('password');
    },

    clearError(field) {
      this.errors[field] = '';
    }
  }
};
