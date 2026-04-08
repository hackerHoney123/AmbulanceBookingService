/**
 * Patient Dashboard JavaScript
 * Smooth fade-in, hover effects, and card interactions
 */

(function () {
  'use strict';

  // Intersection Observer for fade-in effects
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

  // Setup card animations
  function setupCardAnimations() {
    const statsCards = document.querySelectorAll('.stats-strip .mini-card');
    statsCards.forEach((card, index) => {
      if (isInsideHiddenTab(card)) {
        return;
      }
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in-stagger');
      observer.observe(card);
    });

    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel, index) => {
      if (isInsideHiddenTab(panel)) {
        return;
      }
      panel.style.animationDelay = `${(index + statsCards.length) * 0.12}s`;
      panel.classList.add('fade-in-stagger');
      observer.observe(panel);
    });

    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach((card, index) => {
      if (isInsideHiddenTab(card)) {
        return;
      }
      card.style.animationDelay = `${index * 0.08}s`;
      card.classList.add('fade-in-stagger');
      observer.observe(card);
    });
  }

  // Hover effects on cards
  function setupCardHoverEffects() {
    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('card-hover');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('card-hover');
      });
    });
  }

  // Status rail animations
  function setupStatusRailAnimations() {
    const statusRails = document.querySelectorAll('.status-rail');
    statusRails.forEach((rail) => {
      if (isInsideHiddenTab(rail)) {
        return;
      }
      const steps = rail.querySelectorAll('.rail-step');
      steps.forEach((step, index) => {
        step.style.animationDelay = `${index * 0.15}s`;
        step.classList.add('rail-step-animate');
      });
    });
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

  // Button ripple effects
  function setupButtonRipples() {
    const buttons = document.querySelectorAll('button.primary-btn, button.danger-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
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
      });
    });
  }

  // Filter transitions
  function setupFilterTransitions() {
    const filterSelect = document.getElementById('statusFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const bookingList = document.querySelector('.panel:nth-child(3)');
        if (bookingList) {
          bookingList.style.opacity = '0.5';
        }
      });
    }
  }

  // Auto-refresh animation
  function setupAutoRefreshAnimation() {
    const toggleBtn = document.getElementById('autoRefreshToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('pulse-animation');
      });
    }
  }

  // Initialize all on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    setupNavbarMenu();
    setupNavbarTabs();
    setupCardAnimations();
    setupCardHoverEffects();
    setupStatusRailAnimations();
    setupSmoothScroll();
    setupMessageAnimations();
    setupButtonRipples();
    setupFilterTransitions();
    setupAutoRefreshAnimation();
  });

  // Re-observe for dynamic content
  window.reobserveBookingCards = function () {
    const bookingCards = document.querySelectorAll('.booking-card:not(.fade-in)');
    bookingCards.forEach((card) => observer.observe(card));
  };
})();
