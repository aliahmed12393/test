document.addEventListener('DOMContentLoaded', function() {
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionMediaQuery.matches;

    const counterTimers = new Map();
    let ctaPulseTimer = null;
    let heroAnimationFrameId = null;

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        if (!counter.dataset.originalText) {
            counter.dataset.originalText = counter.textContent;
        }
    });

    const header = document.querySelector('.header');
    const scrollProgressBar = document.querySelector('.scroll-progress');
    const heroSection = document.querySelector('.hero');
    const statsSection = document.querySelector('.stats');

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    let revealObserver;
    let statsObserver;

    function clearFloatingTransforms() {
        document.querySelectorAll('.floating-element').forEach(element => {
            element.style.transform = '';
        });
    }

    function triggerCtaPulse() {
        if (reduceMotion) {
            return;
        }

        document.querySelectorAll('.cta-button:not(.secondary)').forEach(button => {
            button.style.animation = 'pulse 0.7s ease-in-out';
            setTimeout(() => {
                button.style.animation = '';
            }, 700);
        });
    }

    function stopCtaPulse() {
        if (ctaPulseTimer !== null) {
            clearInterval(ctaPulseTimer);
            ctaPulseTimer = null;
        }

        document.querySelectorAll('.cta-button:not(.secondary)').forEach(button => {
            button.style.animation = '';
        });
    }

    function startCtaPulse() {
        if (reduceMotion || ctaPulseTimer !== null) {
            return;
        }

        ctaPulseTimer = setInterval(() => {
            if (!reduceMotion) {
                triggerCtaPulse();
            }
        }, 8000);
    }

    function cancelCounterAnimations() {
        counterTimers.forEach(timer => {
            clearInterval(timer);
        });
        counterTimers.clear();

        counters.forEach(counter => {
            const originalText = counter.dataset.originalText || counter.textContent;
            counter.textContent = originalText;
        });
    }

    function animateCounters() {
        counters.forEach(counter => {
            const originalText = counter.dataset.originalText || counter.textContent;
            counter.dataset.originalText = originalText;

            if (reduceMotion) {
                counter.textContent = originalText;
                return;
            }

            const target = parseInt(originalText.replace(/[^\d]/g, ''), 10);
            const suffix = originalText.replace(/[\d]/g, '');

            if (isNaN(target)) {
                counter.textContent = originalText;
                return;
            }

            if (counterTimers.has(counter)) {
                clearInterval(counterTimers.get(counter));
            }

            let current = 0;
            const duration = 1500;
            const increment = Math.max(1, Math.floor(target / (duration / 20)));

            const timer = setInterval(() => {
                if (reduceMotion) {
                    counter.textContent = originalText;
                    clearInterval(timer);
                    counterTimers.delete(counter);
                    return;
                }

                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                    counterTimers.delete(counter);
                }
                counter.textContent = Math.floor(current) + suffix;
            }, 20);

            counterTimers.set(counter, timer);
        });
    }

    function updateHeroBackground() {
        if (!heroSection) {
            heroAnimationFrameId = null;
            return;
        }

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        const angleOffset = targetX * 5;
        const colorStopOffset1 = targetY * 5;
        const colorStopOffset2 = targetY * -5;

        heroSection.style.background = `linear-gradient(${135 + angleOffset}deg, var(--primary-color) ${0 + colorStopOffset1}%, var(--secondary-color) ${100 + colorStopOffset2}%)`;

        if (reduceMotion) {
            heroAnimationFrameId = null;
            return;
        }

        heroAnimationFrameId = requestAnimationFrame(updateHeroBackground);
    }

    function startHeroBackgroundAnimation() {
        if (!heroSection || reduceMotion || heroAnimationFrameId !== null || !('IntersectionObserver' in window)) {
            return;
        }

        heroAnimationFrameId = requestAnimationFrame(updateHeroBackground);
    }

    function stopHeroBackgroundAnimation() {
        if (heroAnimationFrameId !== null) {
            cancelAnimationFrame(heroAnimationFrameId);
            heroAnimationFrameId = null;
        }

        if (heroSection) {
            heroSection.style.background = 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)';
        }
    }

    function applyMotionPreference() {
        if (reduceMotion) {
            stopHeroBackgroundAnimation();
            stopCtaPulse();
            cancelCounterAnimations();
            clearFloatingTransforms();

            if (revealObserver) {
                revealObserver.disconnect();
            }
            revealElements.forEach(el => {
                el.classList.add('animate');
            });

            if (statsObserver && statsSection) {
                statsObserver.unobserve(statsSection);
            }
        } else {
            if (revealObserver) {
                revealElements.forEach(el => {
                    el.classList.remove('animate');
                    revealObserver.observe(el);
                });
            }

            if (statsObserver && statsSection) {
                statsObserver.observe(statsSection);
            }

            startHeroBackgroundAnimation();
            startCtaPulse();
        }
    }

    function handleMotionPreferenceChange(event) {
        reduceMotion = event.matches;
        applyMotionPreference();
    }

    // Add loading class to body for potential fade-in effect
    document.body.classList.add('loading');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: reduceMotion ? 'auto' : 'smooth'
                });

                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const menuIcon = document.querySelector('.mobile-menu i');
                    if (menuIcon) {
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

    // Intersection Observer for reveal animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (reduceMotion) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
                return;
            }

            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Header scroll effect & Scroll Progress Bar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }

        if (scrollProgressBar) {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / scrollTotal) * 100;
            scrollProgressBar.style.width = Math.min(scrolled, 100) + '%';
        }

        if (!reduceMotion) {
            const scrolledY = window.pageYOffset;
            document.querySelectorAll('.floating-element').forEach((element, index) => {
                const speed = 0.1 + (index * 0.05);
                const yPos = -(scrolledY * speed);
                element.style.transform = `translateY(${yPos}px) rotate(${scrolledY * 0.01 * (index % 2 === 0 ? 1 : -1)}deg)`;
            });
        } else {
            clearFloatingTransforms();
        }
    });

    // Stagger animation delays for cards/items
    function staggerAnimation(selector, delayIncrement) {
        document.querySelectorAll(selector).forEach((item, index) => {
            item.style.transitionDelay = `${index * delayIncrement}s`;
        });
    }
    staggerAnimation('.service-accordion-item', 0.1);
    staggerAnimation('.team-member', 0.15);
    staggerAnimation('.contact-item', 0.1);
    staggerAnimation('.stat-item', 0.08);

    // Interactive hero background (subtle mouse move effect)
    if (heroSection) {
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - windowHalfX) / windowHalfX;
            mouseY = (e.clientY - windowHalfY) / windowHalfY;
        });

        window.addEventListener('resize', () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
        });
    }

    // Counter animation for stats
    if (statsSection) {
        statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                if (reduceMotion) {
                    cancelCounterAnimations();
                    observer.unobserve(entry.target);
                    return;
                }

                animateCounters();
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinksContainer) {
        mobileMenuButton.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Email deobfuscation for mailto link
    const emailLink = document.querySelector('a.email-link');
    if (emailLink && emailLink.textContent.includes('[email protected]')) {
        const actualEmail = "asus.thiqa" + "@" + "gmail.com";
        emailLink.href = "mailto:" + actualEmail;
        emailLink.textContent = actualEmail;
    }

    // Interactive Service Cards in Grid Layout (Now for both sections)
    document.querySelectorAll('.service-card, .partnership-card').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                return;
            }

            const wasActive = card.classList.contains('active');

            document.querySelectorAll('.service-card, .partnership-card').forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                }
            });

            if (wasActive) {
                card.classList.remove('active');
            } else {
                card.classList.add('active');
            }
        });
    });

    if (typeof motionMediaQuery.addEventListener === 'function') {
        motionMediaQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (typeof motionMediaQuery.addListener === 'function') {
        motionMediaQuery.addListener(handleMotionPreferenceChange);
    }

    applyMotionPreference();
});
