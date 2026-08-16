// ChrisTech Academy - Utility Functions

// Generate a unique, clean geometric avatar image URL for a given name/id
// Uses DiceBear's "shapes" style: professional, minimal, abstract geometric patterns
function getAvatarUrl(seed) {
  const safeSeed = encodeURIComponent(seed || 'user');
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${safeSeed}&backgroundType=gradientLinear&backgroundColor=eef2ff,e0e7ff`;
}

// Format currency
function formatCurrency(amount) {
  return `${CONFIG.CURRENCY_SYMBOL} ${Number(amount).toLocaleString()}`;
}

// Format date
function formatDate(dateString, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return new Date(dateString).toLocaleDateString('en-KE', defaultOptions);
}

// Format datetime
function formatDateTime(dateString) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format time
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Show toast notification
function showToast(message, type = 'info', duration = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  return icons[type] || icons.info;
}

// Show loading spinner
function showLoading(container, message = 'Loading...') {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

// Show empty state
function showEmpty(container, message = 'No data available', icon = null) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) return;

  const defaultIcon = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${icon || defaultIcon}</div>
      <p class="empty-state-message">${message}</p>
    </div>
  `;
}

// Show error state
function showError(container, message = 'An error occurred', retryFn = null) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) return;

  const retryButton = retryFn
    ? `<button class="btn btn-primary" onclick="(${retryFn})()">Try Again</button>`
    : '';

  container.innerHTML = `
    <div class="error-state">
      <div class="error-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <p class="error-state-message">${message}</p>
      ${retryButton}
    </div>
  `;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (Kenyan format)
function validatePhone(phone) {
  const re = /^(?:\+254|0)[17]\d{8}$/;
  return re.test(phone);
}

// Validate password strength
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    length: password.length >= minLength,
    uppercase: hasUpperCase,
    lowercase: hasLowerCase,
    number: hasNumbers
  };
}

// Generate student number
async function generateStudentNumber() {
  const year = new Date().getFullYear();

  // Get the count of students for this year
  const { count, error } = await getSupabase()
    .from('students')
    .select('*', { count: 'exact', head: true })
    .like('student_number', `CTA/${year}/%`);

  if (error) throw error;

  const sequence = (count || 0) + 1;
  return CONFIG.STUDENT_NUMBER_FORMAT(year, sequence);
}

// Generate certificate number
async function generateCertificateNumber() {
  const year = new Date().getFullYear();

  const { count, error } = await getSupabase()
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .like('certificate_number', `CTA-CERT-${year}-%`);

  if (error) throw error;

  const sequence = (count || 0) + 1;
  return CONFIG.CERTIFICATE_FORMAT(year, sequence);
}

// Calculate payment status
function calculatePaymentStatus(totalFee, amountPaid) {
  if (amountPaid >= totalFee) return CONFIG.FEE_STATUS.PAID;
  if (amountPaid > 0) return CONFIG.FEE_STATUS.PARTIALLY_PAID;
  return CONFIG.FEE_STATUS.UNPAID;
}

// Calculate outstanding balance
function calculateBalance(totalFee, amountPaid) {
  return Math.max(0, totalFee - amountPaid);
}

// Get URL parameters
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Set URL parameter
function setUrlParam(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url);
}

// Redirect to page
function redirectTo(url) {
  window.location.href = url;
}

// Check authentication and role
async function checkAuth(requiredRole = null) {
  const session = await auth.getSession();

  if (!session) {
    redirectTo('/login.html');
    return null;
  }

  const user = session.user;

  // Get user profile from database
  const { data: profile, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    redirectTo('/login.html');
    return null;
  }

  // Check role if required
  if (requiredRole && profile.role !== requiredRole) {
    redirectTo(profile.role === 'admin' ? '/admin/dashboard.html' : '/student/dashboard.html');
    return null;
  }

  return { user, profile };
}

// Initialize sidebar navigation
function initSidebar(profile) {
  const sidebarNav = document.getElementById('sidebar-nav');
  if (!sidebarNav) return;

  const isAdmin = profile.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/student';

  const navItems = isAdmin ? [
    { name: 'Dashboard', icon: 'dashboard', url: `${basePath}/dashboard.html` },
    { name: 'Students', icon: 'users', url: `${basePath}/students.html` },
    { name: 'Courses', icon: 'book', url: `${basePath}/courses.html` },
    { name: 'Enrollments', icon: 'list', url: `${basePath}/enrollments.html` },
    { name: 'Payments', icon: 'credit-card', url: `${basePath}/payments.html` },
    { name: 'Lessons', icon: 'file-text', url: `${basePath}/lessons.html` },
    { name: 'Assignments', icon: 'clipboard', url: `${basePath}/assignments.html` },
    { name: 'Quizzes', icon: 'help-circle', url: `${basePath}/quizzes.html` },
    { name: 'Results', icon: 'award', url: `${basePath}/results.html` },
    { name: 'Attendance', icon: 'calendar', url: `${basePath}/attendance.html` },
    { name: 'Timetable', icon: 'clock', url: `${basePath}/timetable.html` },
    { name: 'Documents', icon: 'folder', url: `${basePath}/documents.html` },
    { name: 'Announcements', icon: 'megaphone', url: `${basePath}/announcements.html` },
    { name: 'Certificates', icon: 'award', url: `${basePath}/certificates.html` }
  ] : [
    { name: 'Dashboard', icon: 'dashboard', url: `${basePath}/dashboard.html` },
    { name: 'My Profile', icon: 'user', url: `${basePath}/profile.html` },
    { name: 'Courses', icon: 'book', url: `${basePath}/courses.html` },
    { name: 'My Courses', icon: 'book-open', url: `${basePath}/course.html` },
    { name: 'Fees', icon: 'credit-card', url: `${basePath}/fees.html` },
    { name: 'Payments', icon: 'dollar-sign', url: `${basePath}/payments.html` },
    { name: 'Lessons', icon: 'file-text', url: `${basePath}/lessons.html` },
    { name: 'Assignments', icon: 'clipboard', url: `${basePath}/assignments.html` },
    { name: 'Quizzes', icon: 'help-circle', url: `${basePath}/quizzes.html` },
    { name: 'Results', icon: 'award', url: `${basePath}/results.html` },
    { name: 'Attendance', icon: 'calendar', url: `${basePath}/attendance.html` },
    { name: 'Timetable', icon: 'clock', url: `${basePath}/timetable.html` },
    { name: 'Documents', icon: 'folder', url: `${basePath}/documents.html` },
    { name: 'Announcements', icon: 'megaphone', url: `${basePath}/announcements.html` },
    { name: 'Certificates', icon: 'award', url: `${basePath}/certificates.html` }
  ];

  const currentPath = window.location.pathname;

  sidebarNav.innerHTML = navItems.map(item => `
    <a href="${item.url}" class="nav-item ${currentPath.includes(item.url) ? 'active' : ''}">
      <span class="nav-icon">${getNavIcon(item.icon)}</span>
      <span class="nav-text">${item.name}</span>
    </a>
  `).join('');
}

// Get navigation icon SVG
function getNavIcon(icon) {
  const icons = {
    dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    'book-open': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    list: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    'credit-card': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'dollar-sign': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'file-text': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    clipboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    'help-circle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    award: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    megaphone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };
  return icons[icon] || icons.dashboard;
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// Confirm dialog
function confirmDialog(message, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content modal-sm">
      <div class="modal-header">
        <h3>Confirm</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); ${onCancel ? onCancel : ''}">Cancel</button>
        <button class="btn btn-primary" onclick="this.closest('.modal').remove(); ${onConfirm}">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

// Check if file is image
function isImageFile(filename) {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) {
    const isOpen = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  }
}

// Initialize mobile menu
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  // Close sidebar on overlay click
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', toggleSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        toggleSidebar();
      }
    }
  });
}

// Initialize page
async function initPage() {
  initSupabase();
  initMobileMenu();
}
