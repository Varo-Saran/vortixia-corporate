/**
 * Performance Optimizer - Vortixia Website
 * Handles page optimizations WITHOUT custom navigation transitions
 * Version: 2.0 (Fixed - No Flash)
 */

(function () {
    'use strict';

    const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Throttle function to limit execution rate
     */
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    // ==================== HAMBURGER MENU ENHANCEMENTS ====================

    function setupHamburgerMenu() {
        if (!hasDOM) return;

        const hamburger = document.querySelector('.hamburger');
        const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
        const mobileThemeToggle = document.querySelector('.mobile-theme-toggle');

        if (!hamburger || !mobileNavOverlay) return;

        const syncOverlayState = () => {
            const isActive = mobileNavOverlay.classList.contains('active');
            hamburger.setAttribute('aria-expanded', String(isActive));
            mobileNavOverlay.setAttribute('aria-hidden', String(!isActive));
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        const observer = new MutationObserver(syncOverlayState);
        observer.observe(mobileNavOverlay, {
            attributes: true,
            attributeFilter: ['class']
        });
        syncOverlayState();

        // Close on overlay click
        mobileNavOverlay.addEventListener('click', (event) => {
            if (event.target === mobileNavOverlay) {
                hamburger.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
            }
        }, { passive: true });

        // Close on menu link click
        mobileNavOverlay.querySelectorAll('.mobile-menu-link').forEach((link) => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
            }, { passive: true });
        });

        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileNavOverlay.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
            }
        });

        if (mobileThemeToggle) {
            mobileThemeToggle.setAttribute('aria-controls', 'theme-toggle-control');
        }
    }

    // ==================== SCROLL OPTIMIZATIONS ====================

    function optimizeScroll() {
        if (!hasDOM) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scrollHandler = throttle(() => {
            const scrollY = window.scrollY;

            requestAnimationFrame(() => {
                // Parallax effect for hero section
                const heroContent = document.querySelector('.hero .container');
                const isMobileView = window.innerWidth <= 768;

                if (heroContent && !prefersReducedMotion && !isMobileView) {
                    heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
                }
            });
        }, 16); // ~60fps

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // ==================== GSAP OPTIMIZATIONS ====================

    function optimizeGSAPAnimations() {
        if (typeof ScrollTrigger === 'undefined') return;

        ScrollTrigger.config({ limitCallbacks: true });
        ScrollTrigger.clearMatchMedia();
    }

    // ==================== DEFERRED OPERATIONS ====================

    function deferOperations() {
        // Defer AOS initialization
        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 1000,
                    once: true,
                    offset: 100,
                    disable: 'mobile',
                });
            }
        }, 100);
    }

    // ==================== ANIMATED CIRCLES ====================

    function optimizeCircles() {
        if (!hasDOM) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const createCircles = throttle(() => {
            const heroBackground = document.querySelector('.hero-background');
            if (!heroBackground) return;

            const isMobile = window.innerWidth <= 768;
            const existing = heroBackground.querySelector('.circles');
            const currentMode = existing?.getAttribute('data-mode');

            if (existing && currentMode === (isMobile ? 'mobile' : 'desktop')) {
                return;
            }

            if (existing) existing.remove();

            const circlesContainer = document.createElement('div');
            circlesContainer.classList.add('circles');
            circlesContainer.setAttribute('data-mode', isMobile ? 'mobile' : 'desktop');

            const fragment = document.createDocumentFragment();
            const circleCount = isMobile ? 6 : 14;

            for (let i = 0; i < circleCount; i++) {
                const circle = document.createElement('div');
                const size = Math.random() * (isMobile ? 32 : 60) + 10;
                circle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${Math.random() * 100}%;
                    animation-duration: ${Math.random() * (isMobile ? 12 : 16) + 6}s;
                    animation-delay: ${Math.random() * 5}s;
                `;
                fragment.appendChild(circle);
            }

            circlesContainer.appendChild(fragment);
            heroBackground.appendChild(circlesContainer);
        }, 150);

        createCircles();
        window.addEventListener('resize', createCircles, { passive: true });
    }

    // ==================== PAGE VISIBILITY ====================

    function isFirstSessionLoad() {
        if (!hasDOM) return false;

        const STORAGE_KEY = 'vortixia-visited';
        const NAME_MARKER = '__vortixiaVisited__';

        const markWithWindowName = () => {
            const isFirst = window.name !== NAME_MARKER;
            window.name = NAME_MARKER;
            return isFirst;
        };

        if (window.location && window.location.protocol === 'file:') {
            return markWithWindowName();
        }

        try {
            const isFirst = !sessionStorage.getItem(STORAGE_KEY);
            if (isFirst) {
                sessionStorage.setItem(STORAGE_KEY, 'true');
            }
            return isFirst;
        } catch (error) {
            return markWithWindowName();
        }
    }

    function setupPageVisibility() {
        if (!hasDOM) return;

        const mainContent = document.querySelector('main.page-content');
        if (!mainContent) return;

        const shouldAnimate = isFirstSessionLoad();
        mainContent.classList.toggle('first-load', shouldAnimate);

        // Ensure page is visible without waiting for an additional paint
        mainContent.style.opacity = '1';
        mainContent.style.visibility = 'visible';
        mainContent.style.transform = 'translateY(0)';
    }

    // ==================== PERFORMANCE OPTIMIZATIONS ====================

    class PagePerformanceOptimizer {
        constructor() {
            this.init();
        }

        init() {
            this.optimizeImages();
            this.setupIntersectionObserver();
            this.preconnectToExternalDomains();
        }

        optimizeImages() {
            const images = document.querySelectorAll('img:not([loading])');
            images.forEach(img => {
                img.loading = 'lazy';
            });

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        setupIntersectionObserver() {
            const lazyElements = document.querySelectorAll('.lazy-load');
            if (lazyElements.length === 0) return;

            const elementObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded');
                        elementObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            lazyElements.forEach(el => elementObserver.observe(el));
        }

        preconnectToExternalDomains() {
            const externalDomains = [
                'https://fonts.googleapis.com',
                'https://cdnjs.cloudflare.com'
            ];

            externalDomains.forEach(domain => {
                if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = domain;
                    document.head.appendChild(link);
                }
            });
        }
    }

    // ==================== MAIN INITIALIZATION ====================

    function runOptimizations() {
        if (!hasDOM) return;

        setupHamburgerMenu();
        setupPageVisibility();
        optimizeScroll();
        optimizeGSAPAnimations();
        deferOperations();
        optimizeCircles();

        new PagePerformanceOptimizer();
    }

    // Run optimizations when page loads
    if (hasDOM) {
        if (document.readyState === 'complete') {
            runOptimizations();
        } else {
            window.addEventListener('load', runOptimizations);
        }
    }

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { throttle };
    } else if (typeof window !== 'undefined') {
        window.vortixiaUtils = { throttle };
    }
})();
