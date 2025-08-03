// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Add loading class to body for potential fade-in effect
    document.body.classList.add('loading');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculate position of target element
                // Adjust for fixed header if necessary
                const headerOffset = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open and link is clicked
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
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust trigger point slightly
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Optional: unobserve after animation to prevent re-triggering
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove animate class when element is out of view to re-trigger on scroll back
                entry.target.classList.remove('animate');
            }
        });
    }, observerOptions);

    // Observe all elements with reveal classes
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    // Header scroll effect & Scroll Progress Bar
    const header = document.querySelector('.header');
    const scrollProgressBar = document.querySelector('.scroll-progress');

    window.addEventListener('scroll', () => {
        // Header background change
        if (window.scrollY > 100) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }

        // Scroll progress bar
        if (scrollProgressBar) {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / scrollTotal) * 100;
            scrollProgressBar.style.width = Math.min(scrolled, 100) + '%';
        }

        // Parallax for floating elements (subtle)
        const scrolledY = window.pageYOffset;
        document.querySelectorAll('.floating-element').forEach((element, index) => {
            const speed = 0.1 + (index * 0.05); // Different speeds for depth
            const yPos = -(scrolledY * speed);
            element.style.transform = `translateY(${yPos}px) rotate(${scrolledY * 0.01 * (index % 2 === 0 ? 1 : -1)}deg)`;
        });
    });


    // Stagger animation delays for cards/items
    function staggerAnimation(selector, delayIncrement) {
        document.querySelectorAll(selector).forEach((item, index) => {
            item.style.transitionDelay = `${index * delayIncrement}s`;
        });
    }
    staggerAnimation('.service-card', 0.1);
    staggerAnimation('.team-member', 0.15);
    staggerAnimation('.contact-item', 0.1);
    staggerAnimation('.stat-item', 0.08);


    // Interactive hero background (subtle mouse move effect)
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - windowHalfX) / windowHalfX; // Normalize to -1 to 1
            mouseY = (e.clientY - windowHalfY) / windowHalfY; // Normalize to -1 to 1
        });

        function updateHeroBackground() {
            targetX += (mouseX - targetX) * 0.05; // Easing
            targetY += (mouseY - targetY) * 0.05;

            // Example: Adjust gradient angle or position slightly
            // This is a simple example, could be more complex
            const angleOffset = targetX * 5; // Max 5 degree shift
            const colorStopOffset1 = targetY * 5; // Max 5% shift for first color
            const colorStopOffset2 = targetY * -5; // Max 5% shift for second color

            heroSection.style.background = `linear-gradient(${135 + angleOffset}deg, var(--primary-color) ${0 + colorStopOffset1}%, var(--secondary-color) ${100 + colorStopOffset2}%)`;

            requestAnimationFrame(updateHeroBackground);
        }
        // Only start if IntersectionObserver is supported for performance
        if ('IntersectionObserver' in window) {
            requestAnimationFrame(updateHeroBackground);
        }
    }


    // Counter animation for stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const targetText = counter.textContent;
            const target = parseInt(targetText.replace(/[^\d]/g, '')); // Get number
            const suffix = targetText.replace(/[\d]/g, ''); // Get suffix like '+' or '/7'
            
            if (isNaN(target)) return; // Skip if not a number

            let current = 0;
            const duration = 1500; // Animation duration in ms
            const stepTime = Math.abs(Math.floor(duration / target)); // Calculate time per step
            const increment = Math.max(1, Math.floor(target / (duration / 20))); // Increment value

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current) + suffix;
            }, 20); // Update every 20ms
        });
    }

    // Trigger counter animation when stats section is visible
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% visible
        statsObserver.observe(statsSection);
    }

    // Pulse animation for CTA buttons (subtle)
    setInterval(() => {
        document.querySelectorAll('.cta-button:not(.secondary)').forEach(button => {
            button.style.animation = 'pulse 0.7s ease-in-out';
            setTimeout(() => {
                button.style.animation = ''; // Remove animation to allow re-trigger
            }, 700);
        });
    }, 8000); // Every 8 seconds

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinksContainer) {
        mobileMenuButton.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times'); // Change to 'X' icon
            }
        });
    }

    // Email deobfuscation (if you had any, not present in original HTML)
    // This part is for the example where email was `[email protected]`
    // If your email is plain text, you don't need this.
    // Example:
    // document.querySelectorAll('.__cf_email__').forEach(el => {
    //     const emailHex = el.getAttribute('data-cfemail');
    //     if (emailHex) {
    //         let email = "";
    //         for (let i = 0; i < emailHex.length; i += 2) {
    //             email += String.fromCharCode(parseInt(emailHex.substr(i, 2), 16));
    //         }
    //         const link = document.createElement('a');
    //         link.href = `mailto:${email}`;
    //         link.textContent = email;
    //         el.parentNode.replaceChild(link, el);
    //     }
    // });
    // For the direct mailto link:
    const emailLink = document.querySelector('a.email-link');
    if (emailLink && emailLink.textContent.includes('[email protected]')) { // Basic check
        // Assuming the email is info@asusalthiqa.com
        const actualEmail = "info" + "@" + "asusalthiqa.com";
        emailLink.href = "mailto:" + actualEmail;
        emailLink.textContent = actualEmail;
    }


});

staggerAnimation('.service-card', 0.1);
    staggerAnimation('.team-member', 0.15);
    staggerAnimation('.contact-item', 0.1);
    staggerAnimation('.stat-item', 0.08);
    staggerAnimation('.about-card', 0.12);
    staggerAnimation('.manager-item', 0.1);
