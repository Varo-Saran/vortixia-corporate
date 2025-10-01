/**
 * VORTIXIA - Main Website Script
 *
 * This script handles all interactive functionalities for the Vortixia website,
 * including theme toggling, navigation, animations, and accessibility enhancements.
 * It is structured to be modular and efficient.
 */

(function () {
    'use strict';

    /**
     * Main application object to encapsulate all functionalities.
     */
    const VortixiaApp = {
        /**
         * Initializes the application. This is the main entry point.
         */
        init() {
            // Self-executing initialization for critical UI elements
            (() => {
                this.ui.handleNoJS();
                this.theme.init();
            })();

            // Defer non-critical initializations until the DOM is fully loaded
            document.addEventListener('DOMContentLoaded', () => {
                this.navigation.init();
                this.animations.init();
                this.ui.init();
                this.accessibility.init();
            });
        },

        /**
         * Handles theme-related functionalities like setting the initial theme
         * and managing the theme toggle switch.
         */
        theme: {
            init() {
                // Theme already applied by inline script to both html and body
                const currentTheme = window.__INITIAL_THEME__ || 'light';
                const isDark = currentTheme === 'dark';

                this.syncToggles(isDark);
                this.addEventListeners();
            },

            set(isDark) {
                // Apply theme to both HTML and body elements
                const themeClass = isDark ? 'dark-theme' : 'light-theme';
                const removeClass = isDark ? 'light-theme' : 'dark-theme';

                // Update HTML element
                document.documentElement.classList.remove(removeClass);
                document.documentElement.classList.add(themeClass);

                // Update body element
                document.body.classList.remove(removeClass);
                document.body.classList.add(themeClass);

                // Save to localStorage
                localStorage.setItem('theme', isDark ? 'dark' : 'light');

                // Sync toggles
                this.syncToggles(isDark);
            },

            syncToggles(isDark) {
                document.querySelectorAll('.theme-toggle, .mobile-theme-toggle').forEach(toggle => {
                    toggle.setAttribute('aria-checked', String(isDark));
                    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
                });
            },

            addEventListeners() {
                document.querySelectorAll('.theme-toggle, .mobile-theme-toggle').forEach(toggle => {
                    toggle.addEventListener('click', () => {
                        const isDark = !document.body.classList.contains('dark-theme');
                        this.set(isDark);
                    }, { passive: true });
                });
            }
        },

        /**
         * Manages all navigation-related functionalities including the mobile menu,
         * active link highlighting, and smooth scrolling.
         */
        navigation: {
            lastScrollTop: 0,
            navScrollScheduled: false,
            isNavHidden: false,

            init() {
                this.setupHamburgerMenu();
                this.updateActiveLink();
                this.setupNavScroll();
                this.setupAnchorScroll();
            },

            updateActiveLink() {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const links = document.querySelectorAll('.nav-links a, .mobile-menu-link');
                const dropdownTrigger = document.querySelector('.nav-links .dropdown > .dropdown-trigger');
                const mobileSubmenuTriggers = document.querySelectorAll('.mobile-menu-link.mobile-submenu-trigger');
                const activeMobileTriggers = new Set();
                let isCareersActive = false;

                links.forEach(link => {
                    const linkPage = link.getAttribute('href');
                    const isPageLink = typeof linkPage === 'string' && linkPage.trim() !== '' && linkPage !== '#';
                    const isActive = isPageLink && (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html'));

                    if (isPageLink) {
                        link.classList.toggle('active', isActive);
                        link.setAttribute('aria-current', isActive ? 'page' : 'false');
                    } else {
                        link.classList.remove('active');
                        if (link.tagName === 'A') {
                            link.setAttribute('aria-current', 'false');
                        } else {
                            link.removeAttribute('aria-current');
                        }
                    }

                    if (isActive) {
                        if (link.closest('.dropdown-menu') || link.closest('.nested-dropdown-menu')) {
                            isCareersActive = true;
                        }

                        let parentSubmenu = link.closest('.mobile-submenu');
                        while (parentSubmenu) {
                            const submenuId = parentSubmenu.dataset.submenu;
                            if (!submenuId) break;
                            const trigger = document.querySelector(`.mobile-menu-link.mobile-submenu-trigger[data-submenu="${submenuId}"]`);
                            if (trigger) {
                                activeMobileTriggers.add(trigger);
                                parentSubmenu = trigger.closest('.mobile-submenu');
                            } else {
                                break;
                            }
                        }
                    }
                });

                if (dropdownTrigger) {
                    dropdownTrigger.classList.toggle('active', isCareersActive);
                    dropdownTrigger.setAttribute('aria-current', isCareersActive ? 'page' : 'false');
                }

                mobileSubmenuTriggers.forEach(trigger => {
                    const isActive = activeMobileTriggers.has(trigger);
                    trigger.classList.toggle('active', isActive);
                    trigger.setAttribute('aria-current', isActive ? 'page' : 'false');
                });
            },

            setupHamburgerMenu() {
                const hamburger = document.querySelector('.hamburger');
                const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
                if (!hamburger || !mobileNavOverlay) return;

                const toggleNav = () => {
                    const isActive = hamburger.classList.toggle('active');
                    mobileNavOverlay.classList.toggle('active');
                    document.body.style.overflow = isActive ? 'hidden' : '';
                    hamburger.setAttribute('aria-expanded', String(isActive));
                };

                const closeNav = () => {
                    if (hamburger.classList.contains('active')) {
                        toggleNav();
                    }
                    document.querySelectorAll('.mobile-submenu.active').forEach(submenu => submenu.classList.remove('active'));
                };

                hamburger.addEventListener('click', toggleNav);
                mobileNavOverlay.addEventListener('click', e => {
                    if (e.target === mobileNavOverlay) closeNav();
                });

                document.addEventListener('keydown', e => {
                    if (e.key === 'Escape' && hamburger.classList.contains('active')) closeNav();
                });

                document.querySelectorAll('.mobile-submenu-trigger').forEach(trigger => {
                    trigger.addEventListener('click', () => {
                        const submenuId = trigger.getAttribute('data-submenu');
                        document.querySelector(`.mobile-submenu[data-submenu="${submenuId}"]`)?.classList.add('active');
                    });
                });

                document.querySelectorAll('.mobile-back-button').forEach(button => {
                    button.addEventListener('click', () => {
                        button.closest('.mobile-submenu')?.classList.remove('active');
                    });
                });

                window.addEventListener('resize', () => {
                    if (window.innerWidth > 992) closeNav();
                });
            },

            setupNavScroll() {
                const nav = document.querySelector('.glassy-nav');
                if (!nav) return;

                // Get the actual height of the nav
                const navHeight = nav.offsetHeight;

                // Increased offset to account for:
                // - Link padding-bottom: 14px (was 12px)
                // - Underline at bottom: 2px + height: 2px = 4px total
                // - Safety buffer: 2px
                // Total extra: 6px (increased from 4px)
                const extraOffset = 50;
                const totalHideDistance = navHeight + extraOffset;

                let ticking = false;

                const updateNavPosition = () => {
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

                    // Determine scroll direction
                    const scrollingDown = currentScroll > this.lastScrollTop;
                    const scrollingUp = currentScroll < this.lastScrollTop;

                    // Only hide nav when scrolling down past the nav height
                    if (scrollingDown && currentScroll > navHeight * 1.5) {
                        if (!this.isNavHidden) {
                            // Use the total distance including the underline offset
                            nav.style.transform = `translateY(-${totalHideDistance}px)`;
                            nav.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                            this.isNavHidden = true;
                        }
                    }
                    // Show nav when scrolling up or near top
                    else if (scrollingUp || currentScroll <= navHeight) {
                        if (this.isNavHidden || currentScroll <= navHeight) {
                            nav.style.transform = 'translateY(0)';
                            nav.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                            this.isNavHidden = false;
                        }
                    }

                    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
                    ticking = false;
                };

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            updateNavPosition();
                            ticking = false;
                        });
                        ticking = true;
                    }
                }, { passive: true });
            },

            setupAnchorScroll() {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        const targetId = this.getAttribute('href');
                        if (targetId === '#') return; // Ignore empty hash

                        const target = document.querySelector(targetId);
                        if (target) {
                            e.preventDefault();
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    });
                });
            }
        },

        /**
         * Manages all animations and motion enhancements for the site.
         */
        animations: {
            prefersReducedMotion: null,
            observer: null,
            animatedElements: new Set(),
            pendingElements: [],

            init() {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;

                this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
                document.body.classList.toggle('reduced-motion', this.prefersReducedMotion.matches);

                if (typeof this.prefersReducedMotion.addEventListener === 'function') {
                    this.prefersReducedMotion.addEventListener('change', (event) => {
                        document.body.classList.toggle('reduced-motion', event.matches);
                        if (event.matches) {
                            this.showAll();
                        } else {
                            this.resetObserver();
                        }
                    });
                }

                this.prepareElements();
                this.setupIntersectionObserver();
                this.setupPageTransitions();
                this.setupCarousel();
                this.setupFloatingBackgrounds();
                this.setupButtonInteractions();
            },

            prepareElements() {
                this.pendingElements = [];
                this.prepareHeadings();
                this.prepareHero();
                this.prepareTextBlocks();
                this.prepareCards();
                this.prepareIcons();
                this.prepareImages();
                this.prepareFooter();
            },

            prepareHeadings() {
                const headingSelectors = [
                    'main h1',
                    'main h2',
                    'main h3',
                    '.section-title',
                    '.footer-nav-title',
                    '.footer-logo'
                ];

                document.querySelectorAll(headingSelectors.join(',')).forEach((heading) => {
                    if (!heading || heading.dataset.headingProcessed === 'true') return;

                    const hasChildElements = Array.from(heading.childNodes).some(node => node.nodeType !== Node.TEXT_NODE);
                    if (!hasChildElements) {
                        const text = heading.textContent.trim();
                        if (text.length > 0) {
                            const fragment = document.createDocumentFragment();
                            text.split(/\s+/).forEach((word, index, words) => {
                                const span = document.createElement('span');
                                span.className = 'heading-word';
                                span.textContent = word;
                                span.style.setProperty('--animation-delay', `${index * 0.08}s`);
                                fragment.appendChild(span);
                                if (index < words.length - 1) {
                                    fragment.appendChild(document.createTextNode(' '));
                                }
                            });

                            heading.textContent = '';
                            heading.appendChild(fragment);
                            heading.classList.add('has-split-heading');
                        }
                    }

                    heading.dataset.headingProcessed = 'true';
                    this.prepareElement(heading, 'heading');
                });
            },

            prepareHero() {
                const hero = document.querySelector('.hero-section');
                if (!hero) return;

                hero.querySelectorAll('.hero-slide').forEach((slide) => {
                    const heading = slide.querySelector('h1');
                    const paragraph = slide.querySelector('p');
                    const button = slide.querySelector('.cta-button');

                    if (heading) this.prepareElement(heading, 'heading');
                    if (paragraph) this.prepareElement(paragraph, 'text', 0.12);
                    if (button) this.prepareElement(button, 'button', 0.25);
                });
            },

            prepareTextBlocks() {
                const textSelectors = [
                    '.section-description',
                    '.about-section p',
                    '.services-section p',
                    '.projects-section p',
                    '.team-section p',
                    '.careers-section p',
                    '.values-section p',
                    '.contact-section p',
                    '.footer-description',
                    '.job-card p',
                    '.value-card p',
                    '.why-choose-card p',
                    '.team-member p',
                    '.project-card p'
                ];

                document.querySelectorAll(textSelectors.join(',')).forEach((element, index) => {
                    this.prepareElement(element, 'text', (index % 5) * 0.05);
                });
            },

            prepareCards() {
                const groupedSelectors = [
                    { selector: '.service-card', type: 'card', stagger: 0.08 },
                    { selector: '.project-card', type: 'card', stagger: 0.1 },
                    { selector: '.team-member', type: 'card', stagger: 0.08 },
                    { selector: '.value-card', type: 'card', stagger: 0.08 },
                    { selector: '.job-card', type: 'card', stagger: 0.08 },
                    { selector: '.career-card', type: 'card', stagger: 0.08 },
                    { selector: '.highlight-card', type: 'card', stagger: 0.08 },
                    { selector: '.contact-card', type: 'card', stagger: 0.08 },
                    { selector: '.contact-info-card', type: 'card', stagger: 0.08 },
                    { selector: '.stat-card', type: 'card', stagger: 0.08 }
                ];

                groupedSelectors.forEach(({ selector, type, stagger }) => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((element, index) => {
                        this.prepareElement(element, type, index * stagger);
                    });
                });
            },

            prepareIcons() {
                const iconSelectors = [
                    '.service-card i',
                    '.value-card i',
                    '.why-choose-card i',
                    '.contact-card i',
                    '.stat-card i',
                    '.job-card i',
                    '.career-card i',
                    '.highlight-card i',
                    '.contact-info-card i'
                ];

                document.querySelectorAll(iconSelectors.join(',')).forEach((icon) => {
                    this.prepareElement(icon, 'icon');
                });
            },

            prepareImages() {
                const images = document.querySelectorAll('img');
                images.forEach((image, index) => {
                    if (!image.hasAttribute('loading')) {
                        image.setAttribute('loading', index < 2 ? 'eager' : 'lazy');
                    }
                    this.prepareElement(image, 'image', Math.min(index * 0.02, 0.2));
                });
            },

            prepareFooter() {
                const footer = document.querySelector('.glassy-footer');
                if (footer) this.prepareElement(footer, 'footer');

                footer?.querySelectorAll('.footer-nav').forEach((nav, index) => {
                    this.prepareElement(nav, 'card', 0.1 + index * 0.08);
                });

                const footerText = footer?.querySelector('.footer-bottom p');
                if (footerText) this.prepareElement(footerText, 'text', 0.2);
            },

            prepareElement(element, type = 'text', delay = 0) {
                if (!element || this.animatedElements.has(element)) {
                    if (element && delay) {
                        element.style.setProperty('--animation-delay', `${delay}s`);
                    }
                    return;
                }

                const animationType = type || 'text';
                if (!element.dataset.animate) {
                    element.dataset.animate = animationType;
                }

                if (delay) {
                    element.style.setProperty('--animation-delay', `${delay}s`);
                }

                this.animatedElements.add(element);

                if (this.observer) {
                    this.observer.observe(element);
                } else {
                    this.pendingElements.push(element);
                }
            },

            setupIntersectionObserver() {
                const supportsObserver = 'IntersectionObserver' in window;

                if (this.prefersReducedMotion.matches || !supportsObserver) {
                    this.showAll();
                    this.pendingElements = [];
                    return;
                }

                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.showElement(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.24,
                    rootMargin: '0px 0px -10% 0px'
                });

                this.registerPendingElements();
            },

            registerPendingElements() {
                if (!this.observer) return;
                const items = this.pendingElements.splice(0);
                items.forEach((element) => {
                    this.observer.observe(element);
                });
            },

            showElement(element) {
                element.classList.add('is-visible');
            },

            showAll() {
                this.animatedElements.forEach((element) => {
                    this.showElement(element);
                });
            },

            resetObserver() {
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }

                this.animatedElements.forEach((element) => {
                    element.classList.remove('is-visible');
                });

                this.pendingElements = Array.from(this.animatedElements);
                this.setupIntersectionObserver();
            },

            setupPageTransitions() {
                requestAnimationFrame(() => {
                    document.body.classList.add('page-loaded');
                });

                window.addEventListener('pageshow', (event) => {
                    if (event.persisted) {
                        document.body.classList.remove('page-transitioning');
                        document.body.classList.add('page-loaded');
                    }
                });

                const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([download])');
                links.forEach((link) => {
                    link.addEventListener('click', (event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                        const href = link.getAttribute('href');
                        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                            return;
                        }

                        const destination = new URL(href, window.location.href);
                        const current = window.location;

                        if (destination.origin !== current.origin) return;
                        if (destination.pathname === current.pathname) {
                            if (destination.hash && destination.hash !== current.hash) {
                                return;
                            }

                            if (destination.hash === current.hash) {
                                return;
                            }
                        }

                        event.preventDefault();
                        document.body.classList.add('page-transitioning');

                        setTimeout(() => {
                            window.location.href = destination.href;
                        }, 260);
                    });
                });
            },

            setupFloatingBackgrounds() {
                if (this.prefersReducedMotion.matches) return;

                const heroBackground = document.querySelector('.hero-section .hero-background');
                if (!heroBackground) return;

                heroBackground.style.willChange = 'transform';

                const updateTransform = () => {
                    const offset = window.scrollY * 0.08;
                    heroBackground.style.transform = `translateY(${offset}px)`;
                };

                const onScroll = () => {
                    window.requestAnimationFrame(updateTransform);
                };

                window.addEventListener('scroll', onScroll, { passive: true });
                updateTransform();
            },

            setupButtonInteractions() {
                const interactiveButtons = document.querySelectorAll('button, .cta-button, .learn-more, .apply-button, .submit-button, .primary-button, .secondary-button, input[type="submit"]');

                interactiveButtons.forEach((button) => {
                    if (button.classList.contains('interactive-button')) return;
                    button.classList.add('interactive-button');
                    button.addEventListener('click', this.createRipple);
                });
            },

            createRipple(event) {
                const button = event.currentTarget;
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'button-ripple';

                const size = Math.max(rect.width, rect.height);
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const centerX = Number.isFinite(x) && x > 0 ? x : rect.width / 2;
                const centerY = Number.isFinite(y) && y > 0 ? y : rect.height / 2;

                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${centerX - size / 2}px`;
                ripple.style.top = `${centerY - size / 2}px`;

                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 400);
            },

            setupCarousel() {
                const slides = document.querySelectorAll('.hero-slide');
                const dots = document.querySelectorAll('.dot');
                if (slides.length === 0) return;

                let currentSlide = 0;
                let slideInterval = setInterval(nextSlide, 5000);

                function showSlide(index) {
                    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
                }

                function nextSlide() {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                }

                function resetInterval() {
                    clearInterval(slideInterval);
                    slideInterval = setInterval(nextSlide, 5000);
                }

                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        currentSlide = index;
                        showSlide(currentSlide);
                        resetInterval();
                    });
                });
            }
        },

        /**
         * Manages general UI enhancements and helper functions.
         */
        ui: {
            init() {
                this.handleImageErrors();
                this.setupBackToTop();
                window.addEventListener('load', () => this.fixGridAlignment());
                window.addEventListener('resize', () => this.fixGridAlignment());
            },

            handleNoJS() {
                document.documentElement.classList.remove('no-js');
            },

            handleImageErrors() {
                document.querySelectorAll('img').forEach(img => {
                    img.onerror = function () {
                        const width = this.width > 0 ? this.width : 400;
                        const height = this.height > 0 ? this.height : 320;
                        this.src = `https://placehold.co/${width}x${height}/1a202c/ffffff?text=Image+Not+Found`;
                        this.alt = 'Placeholder image: asset not found';
                    };
                });
            },

            setupBackToTop() {
                const button = document.createElement('button');
                button.innerHTML = '<i class="fas fa-arrow-up"></i>';
                button.className = 'back-to-top';
                button.setAttribute('aria-label', 'Back to top');
                document.body.appendChild(button);

                window.addEventListener('scroll', () => {
                    button.classList.toggle('show', window.scrollY > 300);
                });

                button.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            },

            fixGridAlignment() {
                ['.projects-grid', '.services-grid', '.team-grid'].forEach(gridSelector => {
                    const grid = document.querySelector(gridSelector);
                    if (!grid) return;

                    const items = grid.querySelectorAll('.project-card, .service-card, .team-member');
                    if (items.length === 0) return;

                    // Reset heights
                    items.forEach(item => item.style.height = 'auto');

                    // Find max height
                    const maxHeight = Math.max(...Array.from(items).map(item => item.offsetHeight));

                    // Apply max height
                    items.forEach(item => item.style.height = `${maxHeight}px`);
                });
            }
        },

        /**
         * Manages accessibility features like focus states.
         */
        accessibility: {
            init() {
                this.setupFocusStates();
            },

            setupFocusStates() {
                document.body.addEventListener('keydown', e => {
                    if (e.key === 'Tab') {
                        document.body.classList.add('keyboard-focus');
                    }
                });
                document.body.addEventListener('mousedown', () => {
                    document.body.classList.remove('keyboard-focus');
                });
            }
        }
    };

    // Start the application
    VortixiaApp.init();

})();
