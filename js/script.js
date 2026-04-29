document.addEventListener('DOMContentLoaded', () => {
    console.log('Web UnPinguino inicializada');

    // Hero Animation Sequence
    const text1 = document.getElementById('text-1');
    const text2 = document.getElementById('text-2');
    const logoContainer = document.getElementById('hero-logo-container');

    const runSequence = async () => {
        // Initial delay before starting the sequence
        await new Promise(r => setTimeout(r, 2000));

        // Step 1: Show "Todo Listo"
        if (text1) {
            text1.classList.add('visible');
            await new Promise(r => setTimeout(r, 2500));
            text1.classList.remove('visible');
            await new Promise(r => setTimeout(r, 1000));
        }

        // Step 2: Show "La función va a comenzar"
        if (text2) {
            text2.classList.add('visible');
            await new Promise(r => setTimeout(r, 2500));
            text2.classList.remove('visible');
            await new Promise(r => setTimeout(r, 1000));
        }

        // Step 3: Show Logo
        if (logoContainer) {
            logoContainer.classList.remove('hidden');
            setTimeout(() => {
                logoContainer.classList.add('visible');
            }, 50);
        }
    };

    runSequence();

    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // Reveal on Scroll Logic
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Interactive Pinguneta (Van) logic
    const vanTrack = document.querySelector('.van-track');
    const van = document.querySelector('.pinguneta-van');
    const historySection = document.querySelector('.history-section');
    let isExiting = false;

    const startVanCycle = () => {
        if (!vanTrack) return;
        isExiting = false;

        // Disable transition to reset position instantly to the right
        vanTrack.classList.add('no-transition');
        vanTrack.classList.remove('exiting');
        vanTrack.classList.remove('arrived');

        // Force reflow to ensure the instant reset happens
        void vanTrack.offsetWidth;

        // Re-enable transition and start arrival from the right
        setTimeout(() => {
            vanTrack.classList.remove('no-transition');
            vanTrack.classList.add('arrived');
        }, 100);
    };

    // Observer for arrival
    const vanObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !vanTrack.classList.contains('arrived') && !isExiting) {
                startVanCycle();
            }
        });
    }, { threshold: 0.3 });

    if (historySection) vanObserver.observe(historySection);

    // Click to exit
    if (van) {
        van.addEventListener('click', () => {
            if (isExiting) return;
            isExiting = true;
            vanTrack.classList.remove('arrived');
            vanTrack.classList.add('exiting');

            // Restart cycle after 4 seconds
            setTimeout(() => {
                startVanCycle();
            }, 4000);
        });
    }

    // Video Debug
    const video = document.getElementById('hero-video');
    if (video) {
        video.onplay = () => console.log('Video Hero: Reproduciendo');
        video.onerror = (e) => console.error('Video Hero: Error al cargar', e);
    }

    // Hero panel click → smooth scroll to show card
    document.querySelectorAll('.hero-panel[data-target]').forEach(panel => {
        panel.addEventListener('click', () => {
            const target = document.getElementById(panel.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
