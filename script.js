
/**
 * OBUSU Website – Complete Interactive JavaScript
 * Handles authentication, dashboard, notifications, and dynamic features
 */

// ===== APPLICATION STATE =====
const AppState = {
    currentUser: null,
    isAuthenticated: false,
    registeredEvents: [],
    userComplaints: [],
    demoMode: true // Set to false for real backend
};

// ===== MOCK DATABASE (for demo) =====
const MockDB = {
    users: [
        {
            id: 'USR001',
            studentId: 'OBU2025001',
            firstName: 'Abebe',
            lastName: 'Kebede',
            email: 'abebe@student.obu.edu.et',
            department: 'cs',
            year: '4',
            password: 'student123',
            registeredEvents: [1, 2],
            complaints: []
        }
    ],
    events: [
        {
            id: 1,
            title: 'Student Leadership Workshop',
            date: '2025-03-25',
            time: '14:00',
            location: 'Main Hall',
            description: 'Develop essential leadership skills'
        },
        {
            id: 2,
            title: 'Campus Innovation Day',
            date: '2025-04-10',
            time: '09:00',
            location: 'Engineering Building',
            description: 'Showcase your projects'
        }
    ]
};

// ===== DOM ELEMENTS =====
const DOM = {
    // Navigation
    navbar: document.querySelector('.header'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Auth buttons
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    footerLogin: document.getElementById('footerLogin'),
    footerRegister: document.getElementById('footerRegister'),
    registerNowBtn: document.getElementById('registerNowBtn'),
    userMenu: document.getElementById('userMenu'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    dashboardLink: document.getElementById('dashboardLink'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    dashboardModal: document.getElementById('dashboardModal'),
    closeLogin: document.getElementById('closeLoginModal'),
    closeRegister: document.getElementById('closeRegisterModal'),
    closeDashboard: document.getElementById('closeDashboardModal'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    contactForm: document.getElementById('contactForm'),
    newsletterForm: document.getElementById('newsletterForm'),
    complaintForm: document.getElementById('complaintForm'),
    settingsForm: document.getElementById('settingsForm'),
    
    // Switch links
    switchToRegister: document.getElementById('switchToRegister'),
    switchToLogin: document.getElementById('switchToLogin'),
    
    // Dashboard elements
    dashboardTabs: document.querySelectorAll('.dashboard-tab'),
    dashboardPanes: document.querySelectorAll('.dashboard-pane'),
    profileInfo: document.getElementById('profileInfo'),
    registeredEvents: document.getElementById('registeredEvents'),
    membershipStatus: document.getElementById('membershipStatus'),
    
    // Toast container
    toastContainer: document.getElementById('toastContainer'),
    
    // Stat counters
    statNumbers: document.querySelectorAll('.stat-number'),
    
    // Loader
    loader: document.getElementById('loader')
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Show toast notification
    showToast: (message, type = 'success', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        DOM.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // Format date
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },
    
    // Validate email
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Animate counters
    animateCounter: (element, target) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    }
};

// ===== AUTHENTICATION =====
const Auth = {
    // Check if user is logged in from session
    checkAuth: () => {
        const savedUser = localStorage.getItem('obusUser');
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
            AppState.isAuthenticated = true;
            Auth.updateUIForAuth();
        }
    },
    
    // Show login modal
    showLogin: () => {
        DOM.loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    // Show register modal
    showRegister: () => {
        DOM.registerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    // Hide all modals
    hideModals: () => {
        DOM.loginModal.classList.remove('active');
        DOM.registerModal.classList.remove('active');
        DOM.dashboardModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    },
    
    // Handle login
    handleLogin: (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('loginStudentId').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const remember = document.getElementById('rememberMe').checked;
        
        // Demo validation
        if (AppState.demoMode) {
            const user = MockDB.users.find(u => u.studentId === studentId && u.password === password);
            
            if (user) {
                AppState.currentUser = { ...user };
                delete AppState.currentUser.password;
                AppState.isAuthenticated = true;
                
                if (remember) {
                    localStorage.setItem('obusUser', JSON.stringify(AppState.currentUser));
                }
                
                Auth.updateUIForAuth();
                Auth.hideModals();
                Utils.showToast(`Welcome back, ${user.firstName}!`, 'success');
                document.getElementById('loginForm').reset();
            } else {
                Utils.showToast('Invalid student ID or password. Try: OBU2025001 / student123', 'error');
            }
        }
    },
    
    // Handle registration
    handleRegister: (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('regFirstName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const studentId = document.getElementById('regStudentId').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const department = document.getElementById('regDepartment').value;
        const year = document.getElementById('regYear').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!firstName || !lastName || !studentId || !email || !department || !year || !password) {
            Utils.showToast('Please fill all required fields', 'error');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 8) {
            Utils.showToast('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            Utils.showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            Utils.showToast('You must agree to the terms', 'error');
            return;
        }
        
        // Demo registration
        if (AppState.demoMode) {
            const newUser = {
                id: 'USR' + Math.floor(Math.random() * 1000),
                studentId,
                firstName,
                lastName,
                email,
                department,
                year,
                registeredEvents: [],
                complaints: []
            };
            
            Utils.showToast('Registration successful! You can now login.', 'success');
            Auth.hideModals();
            Auth.showLogin();
            document.getElementById('registerForm').reset();
        }
    },
    
    // Handle logout
    handleLogout: () => {
        AppState.currentUser = null;
        AppState.isAuthenticated = false;
        localStorage.removeItem('obusUser');
        Auth.updateUIForAuth();
        Utils.showToast('You have been logged out', 'success');
    },
    
    // Update UI based on auth state
    updateUIForAuth: () => {
        if (AppState.isAuthenticated && AppState.currentUser) {
            DOM.loginBtn.style.display = 'none';
            DOM.registerBtn.style.display = 'none';
            DOM.userMenu.style.display = 'flex';
            DOM.userName.textContent = `${AppState.currentUser.firstName} ${AppState.currentUser.lastName}`;
        } else {
            DOM.loginBtn.style.display = 'inline-block';
            DOM.registerBtn.style.display = 'inline-block';
            DOM.userMenu.style.display = 'none';
        }
    },
    
    // Show dashboard
    showDashboard: () => {
        if (!AppState.isAuthenticated) {
            Utils.showToast('Please login first', 'error');
            return;
        }
        
        // Load user data
        Auth.loadDashboardData();
        DOM.dashboardModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    // Load dashboard data
    loadDashboardData: () => {
        if (!AppState.currentUser) return;
        
        // Profile info
        if (DOM.profileInfo) {
            DOM.profileInfo.innerHTML = `
                <p><strong>Name:</strong> ${AppState.currentUser.firstName} ${AppState.currentUser.lastName}</p>
                <p><strong>Student ID:</strong> ${AppState.currentUser.studentId}</p>
                <p><strong>Email:</strong> ${AppState.currentUser.email}</p>
                <p><strong>Department:</strong> ${AppState.currentUser.department}</p>
                <p><strong>Year:</strong> ${AppState.currentUser.year}</p>
            `;
        }
        
        // Registered events
        if (DOM.registeredEvents) {
            const events = MockDB.events.filter(e => AppState.currentUser.registeredEvents.includes(e.id));
            if (events.length > 0) {
                DOM.registeredEvents.innerHTML = events.map(e => `
                    <div class="event-card" style="margin-bottom: 1rem;">
                        <h4>${e.title}</h4>
                        <p><i class="fas fa-calendar"></i> ${Utils.formatDate(e.date)} at ${e.time}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${e.location}</p>
                    </div>
                `).join('');
            } else {
                DOM.registeredEvents.innerHTML = '<p>No events registered yet.</p>';
            }
        }
        
        // Membership status
        if (DOM.membershipStatus) {
            DOM.membershipStatus.innerHTML = `
                <p><strong>Status:</strong> <span style="color: var(--primary);">Active Member</span></p>
                <p><strong>Member Since:</strong> 2025</p>
                <p><strong>Membership ID:</strong> ${AppState.currentUser.id}</p>
            `;
        }
    }
};

// ===== EVENT HANDLERS =====
const EventHandlers = {
    // Initialize all event listeners
    init: () => {
        // Mobile menu toggle
        DOM.navToggle.addEventListener('click', () => {
            DOM.navMenu.classList.toggle('active');
            const icon = DOM.navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Smooth scroll for navigation
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu
                    DOM.navMenu.classList.remove('active');
                    const icon = DOM.navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
        
        // Active link on scroll
        window.addEventListener('scroll', EventHandlers.handleScroll);
        
        // Auth buttons
        DOM.loginBtn?.addEventListener('click', Auth.showLogin);
        DOM.registerBtn?.addEventListener('click', Auth.showRegister);
        DOM.footerLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showLogin();
        });
        DOM.footerRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showRegister();
        });
        DOM.registerNowBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showRegister();
        });
        
        // Modal close buttons
        DOM.closeLogin?.addEventListener('click', Auth.hideModals);
        DOM.closeRegister?.addEventListener('click', Auth.hideModals);
        DOM.closeDashboard?.addEventListener('click', Auth.hideModals);
        
        // Switch between modals
        DOM.switchToRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.hideModals();
            Auth.showRegister();
        });
        
        DOM.switchToLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.hideModals();
            Auth.showLogin();
        });
        
        // Form submissions
        DOM.loginForm?.addEventListener('submit', Auth.handleLogin);
        DOM.registerForm?.addEventListener('submit', Auth.handleRegister);
        DOM.contactForm?.addEventListener('submit', EventHandlers.handleContact);
        DOM.newsletterForm?.addEventListener('submit', EventHandlers.handleNewsletter);
        DOM.complaintForm?.addEventListener('submit', EventHandlers.handleComplaint);
        
        // Dashboard
        DOM.dashboardLink?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showDashboard();
        });
        
        DOM.logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.handleLogout();
        });
        
        // Dashboard tabs
        DOM.dashboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                EventHandlers.switchDashboardTab(tabId);
            });
        });
        
        // Event registration buttons
        document.querySelectorAll('.event-register').forEach(btn => {
            btn.addEventListener('click', EventHandlers.handleEventRegistration);
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                Auth.hideModals();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Auth.hideModals();
            }
        });
    },
    
    // Handle scroll for active nav
    handleScroll: () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + document.querySelector('.header').offsetHeight + 10;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const id = section.getAttribute('id');
                DOM.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Navbar background on scroll
        if (window.scrollY > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    },
    
    // Handle contact form
    handleContact: (e) => {
        e.preventDefault();
        Utils.showToast('Thank you for your message. We will get back to you soon!', 'success');
        e.target.reset();
    },
    
    // Handle newsletter
    handleNewsletter: (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        if (Utils.isValidEmail(email)) {
            Utils.showToast('Successfully subscribed to newsletter!', 'success');
            e.target.reset();
        } else {
            Utils.showToast('Please enter a valid email', 'error');
        }
    },
    
    // Handle event registration
    handleEventRegistration: (e) => {
        if (!AppState.isAuthenticated) {
            Utils.showToast('Please login to register for events', 'error');
            Auth.showLogin();
            return;
        }
        
        const eventName = e.target.getAttribute('data-event');
        Utils.showToast(`Successfully registered for ${eventName}!`, 'success');
    },
    
    // Handle complaint submission
    handleComplaint: (e) => {
        e.preventDefault();
        if (!AppState.isAuthenticated) {
            Utils.showToast('Please login to submit a complaint', 'error');
            Auth.showLogin();
            return;
        }
        
        Utils.showToast('Your complaint has been submitted. We will review it shortly.', 'success');
        e.target.reset();
    },
    
    // Switch dashboard tab
    switchDashboardTab: (tabId) => {
        DOM.dashboardTabs.forEach(t => {
            t.classList.remove('active');
            if (t.getAttribute('data-tab') === tabId) {
                t.classList.add('active');
            }
        });
        
        DOM.dashboardPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}Pane`) {
                pane.classList.add('active');
            }
        });
    }
};

// ===== INITIALIZATION =====
const init = () => {
    // Check authentication
    Auth.checkAuth();
    
    // Initialize event handlers
    EventHandlers.init();
    
    // Animate stats counters
    DOM.statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        if (target) {
            Utils.animateCounter(stat, target);
        }
    });
    
    // Hide loader after page loads
    setTimeout(() => {
        if (DOM.loader) {
            DOM.loader.classList.add('fade-out');
            setTimeout(() => {
                DOM.loader.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    // Update copyright year
    const footerYear = document.querySelector('.footer-bottom p:first-child');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', new Date().getFullYear().toString());
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', init);
