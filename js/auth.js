// ChrisTech Academy - Authentication Logic

const AuthModule = {
  // Initialize auth module
  init() {
    this.bindEvents();
    this.checkExistingSession();
  },

  // Bind form events
  bindEvents() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
    }

    if (resetForm) {
      resetForm.addEventListener('submit', (e) => this.handleResetPassword(e));
    }
  },

  // Check for existing session
  async checkExistingSession() {
    try {
      const session = await auth.getSession();
      if (session) {
        const user = session.user;
        const { data: profile } = await getSupabase()
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          window.location.href = profile.role === 'admin'
            ? '/admin/dashboard.html'
            : '/student/dashboard.html';
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  },

  // Handle login
  async handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    // Validate
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Show loading
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Signing in...';

    try {
      const { user } = await auth.signIn(email, password);

      // Get user profile
      const { data: profile, error: profileError } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found. Please contact support.');
      }

      // Check if account is active
      if (profile.status === CONFIG.STATUS.SUSPENDED) {
        throw new Error('Your account has been suspended. Please contact support.');
      }

      showToast('Login successful!', 'success');

      // Redirect based on role
      setTimeout(() => {
        window.location.href = profile.role === 'admin'
          ? '/admin/dashboard.html'
          : '/student/dashboard.html';
      }, 1000);

    } catch (error) {
      showToast(error.message || 'Login failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  // Handle registration
  async handleRegister(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    const fullName = formData.get('full_name')?.trim();
    const phone = formData.get('phone')?.trim();
    const gender = formData.get('gender');
    const dateOfBirth = formData.get('date_of_birth');
    const learningPreference = formData.get('learning_preference');

    // Validate
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      let message = 'Password must contain:';
      if (!passwordValidation.length) message += ' at least 8 characters,';
      if (!passwordValidation.uppercase) message += ' an uppercase letter,';
      if (!passwordValidation.lowercase) message += ' a lowercase letter,';
      if (!passwordValidation.number) message += ' a number.';
      showToast(message, 'error');
      return;
    }

    // Show loading
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Creating account...';

    try {
      // Sign up with Supabase Auth
      const { user } = await auth.signUp(email, password, {
        full_name: fullName,
        phone: phone
      });

      // Generate student number
      const studentNumber = await generateStudentNumber();

      // Create profile
      const { error: profileError } = await getSupabase()
        .from('profiles')
        .insert({
          user_id: user.id,
          email: email,
          full_name: fullName,
          phone: phone,
          gender: gender || null,
          date_of_birth: dateOfBirth || null,
          learning_preference: learningPreference || CONFIG.LEARNING_MODES.ONLINE,
          role: 'student',
          status: CONFIG.STATUS.ACTIVE
        });

      if (profileError) throw profileError;

      // Create student record
      const { error: studentError } = await getSupabase()
        .from('students')
        .insert({
          profile_id: user.id,
          student_number: studentNumber,
          full_name: fullName,
          email: email,
          phone: phone,
          gender: gender || null,
          date_of_birth: dateOfBirth || null,
          learning_preference: learningPreference || CONFIG.LEARNING_MODES.ONLINE,
          status: CONFIG.STATUS.ACTIVE
        });

      if (studentError) throw studentError;

      showToast('Account created successfully! Please check your email for verification.', 'success');

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login.html?registered=true';
      }, 2000);

    } catch (error) {
      showToast(error.message || 'Registration failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  // Handle forgot password
  async handleForgotPassword(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('[name="email"]').value.trim();

    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Sending...';

    try {
      await auth.resetPassword(email);
      showToast('Password reset email sent. Please check your inbox.', 'success');
      form.reset();
    } catch (error) {
      showToast(error.message || 'Failed to send reset email. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  // Handle reset password
  async handleResetPassword(e) {
    e.preventDefault();

    const form = e.target;
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirm_password"]').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showToast('Password does not meet requirements', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Resetting...';

    try {
      const client = getSupabase();
      const { error } = await client.auth.updateUser({ password });

      if (error) throw error;

      showToast('Password reset successful! You can now login.', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);

    } catch (error) {
      showToast(error.message || 'Failed to reset password. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  // Logout
  async logout() {
    try {
      await auth.signOut();
      window.location.href = '/login.html';
    } catch (error) {
      showToast('Logout failed. Please try again.', 'error');
    }
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  AuthModule.init();
});
