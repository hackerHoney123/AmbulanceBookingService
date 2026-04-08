/**
 * Driver Dashboard JavaScript
 * Live location pulse, booking acceptance, and smooth transitions
 */

(function () {
  'use strict';

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function isInsideHiddenTab(element) {
    return Boolean(element.closest('.tab-section-hidden'));
  }

  // Stack animations
  function setupStackAnimations() {
    const statsCards = document.querySelectorAll('.stats-strip .mini-card');
    statsCards.forEach((card, index) => {
      if (isInsideHiddenTab(card)) {
        return;
      }
      card.style.animationDelay = `${index * 0.12}s`;
      card.classList.add('fade-in-stagger');
      observer.observe(card);
    });

    const profilePanel = document.querySelector('.panel');
    if (profilePanel && !isInsideHiddenTab(profilePanel)) {
      profilePanel.style.animationDelay = '0.3s';
      profilePanel.classList.add('fade-in-stagger');
      observer.observe(profilePanel);
    }

    const otherPanels = document.querySelectorAll('.panel:not(:first-child)');
    otherPanels.forEach((panel, index) => {
      if (isInsideHiddenTab(panel)) {
        return;
      }
      panel.style.animationDelay = `${(index + 1) * 0.15}s`;
      panel.classList.add('fade-in-stagger');
      observer.observe(panel);
    });
  }

  // Pending bookings pulse
  function setupPendingBookingPulse() {
    const pendingSection = Array.from(document.querySelectorAll('.panel')).find((p) =>
      !p.classList.contains('tab-section-hidden') &&
      p.textContent.includes('Pending Bookings')
    );

    if (pendingSection) {
      const bookingCards = pendingSection.querySelectorAll('.booking-card');
      bookingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('pending-pulse-stagger');
        observer.observe(card);
      });
    }
  }

  // Active trips highlight
  function setupActiveTripsAnimation() {
    const activeTripsSection = Array.from(document.querySelectorAll('.panel')).find((p) =>
      !p.classList.contains('tab-section-hidden') &&
      p.textContent.includes('Active Trips')
    );

    if (activeTripsSection) {
      const bookingCards = activeTripsSection.querySelectorAll('.booking-card');
      bookingCards.forEach((card, index) => {
        card.classList.add('active-trip-highlight');
        card.style.animationDelay = `${index * 0.12}s`;
        observer.observe(card);
      });
    }
  }

  // Live location pulse
  function setupLiveLocationAnimation() {
    const startBtn = document.getElementById('startLiveLocation');
    const stopBtn = document.getElementById('stopLiveLocation');
    const statusEl = document.getElementById('liveLocationStatus');

    if (startBtn && stopBtn && statusEl) {
      startBtn.addEventListener('click', () => {
        startBtn.classList.add('pulse-animation', 'hidden');
        stopBtn.classList.remove('hidden');
        statusEl.classList.add('live-status-active');
      });

      stopBtn.addEventListener('click', () => {
        stopBtn.classList.add('hidden');
        startBtn.classList.remove('pulse-animation', 'hidden');
        statusEl.classList.remove('live-status-active');
      });
    }
  }

  // Accept button interactions
  function setupAcceptButtonAnimation() {
    const acceptBtns = document.querySelectorAll('.accept-btn');
    acceptBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        btn.classList.add('accept-clicked');

        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        btn.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);

        setTimeout(() => {
          btn.closest('form').submit();
        }, 200);
      });
    });
  }

  // Completed trips animation
  function setupCompletedTripsAnimation() {
    const completedSection = Array.from(document.querySelectorAll('.panel')).find((p) =>
      !p.classList.contains('tab-section-hidden') &&
      p.textContent.includes('Booking History')
    );

    if (completedSection) {
      const bookingCards = completedSection.querySelectorAll('.booking-card');
      bookingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.08}s`;
        card.classList.add('completed-fade-in');
        observer.observe(card);
      });
    }
  }

  // Smooth scroll
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([data-tab])').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }

  // Mobile navbar hamburger behavior
  function setupNavbarMenu() {
    const navbar = document.querySelector('.site-navbar');
    if (!navbar) {
      return;
    }

    const toggleBtn = navbar.querySelector('.nav-toggle');
    const navLinks = navbar.querySelector('.nav-links');
    if (!toggleBtn || !navLinks) {
      return;
    }

    function closeMenu() {
      navbar.classList.remove('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('menu-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a[data-tab]').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !navbar.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // Navbar tab view (single section visible)
  function setupNavbarTabs() {
    const navLinks = document.querySelectorAll('.nav-links a[data-tab]');
    const tabSections = document.querySelectorAll('.tab-section[data-tab]');
    const gridLayout = document.querySelector('.grid-layout');

    if (!navLinks.length || !tabSections.length) {
      return;
    }

    function setActiveTab(tabName) {
      let activeSection = null;

      navLinks.forEach((link) => {
        const isActive = link.dataset.tab === tabName;
        link.classList.toggle('active', isActive);
      });

      tabSections.forEach((section) => {
        const isVisible = section.dataset.tab === tabName;
        section.classList.toggle('tab-section-hidden', !isVisible);
        if (isVisible) {
          activeSection = section;
        }
      });

      if (activeSection) {
        activeSection.classList.remove('tab-fade-enter');
        void activeSection.offsetWidth;
        activeSection.classList.add('tab-fade-enter');
      }

      if (gridLayout) {
        const visiblePanels = gridLayout.querySelectorAll('.panel.tab-section[data-tab]:not(.tab-section-hidden)');
        gridLayout.classList.toggle('single-tab-mode', visiblePanels.length <= 1);
      }
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.dataset.tab;
        if (targetTab) {
          setActiveTab(targetTab);
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', `#${targetTab}`);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    const hashTab = window.location.hash.replace('#', '').trim();
    const hasHashTab = Array.from(navLinks).some((link) => link.dataset.tab === hashTab);
    setActiveTab(hasHashTab ? hashTab : 'dashboard');
  }

  // Message animations
  function setupMessageAnimations() {
    const messages = document.querySelectorAll('.messages .message');
    messages.forEach((msg, index) => {
      msg.style.animationDelay = `${index * 0.1}s`;
      msg.classList.add('message-slide-in');
    });
  }

  // Initialize all on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    setupNavbarMenu();
    setupNavbarTabs();
    setupStackAnimations();
    setupPendingBookingPulse();
    setupActiveTripsAnimation();
    setupLiveLocationAnimation();
    setupAcceptButtonAnimation();
    setupCompletedTripsAnimation();
    setupSmoothScroll();
    setupMessageAnimations();
  });

  // Re-observe for dynamic content
  window.reobserveBookings = function () {
    const cards = document.querySelectorAll('.booking-card:not(.fade-in)');
    cards.forEach((card) => observer.observe(card));
  };
})();
