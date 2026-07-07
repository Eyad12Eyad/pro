/* ================================================================
   site-polish.js — Eyad_Eyad12
   محرك التحريكات: ستارة افتتاح، كشف عند التمرير، سلوك الشريط العلوي
   أضف قبل </body> (بعد باقي السكربتات):
   <script src="site-polish.js" defer></script>
   ================================================================ */

(function () {
    'use strict';

    /* ── 1. Curtain intro (once per tab session) ── */
    function initCurtain() {
        if (sessionStorage.getItem('pz_seen')) return;
        const c = document.createElement('div');
        c.id = 'polishCurtain';
        c.innerHTML = '<span class="pc-mark">EYAD_EYAD12</span>';
        document.body.appendChild(c);
        requestAnimationFrame(() => {
            c.classList.add('show-mark');
            setTimeout(() => c.classList.add('open'), 550);
            setTimeout(() => { c.classList.add('done'); c.remove(); }, 1500);
        });
        sessionStorage.setItem('pz_seen', '1');
    }

    /* ── 2. Top loading bar on section navigation ── */
    function initTopBar() {
        const bar = document.createElement('div');
        bar.id = 'pzTopBar';
        document.body.appendChild(bar);
        window._pzTopBar = bar;

        document.querySelectorAll('.nav-link:not(.admin-link)').forEach(link => {
            link.addEventListener('click', () => {
                bar.style.opacity = '1';
                bar.style.width = '70%';
                setTimeout(() => { bar.style.width = '100%'; }, 160);
                setTimeout(() => { bar.style.opacity = '0'; bar.style.width = '0%'; }, 520);
            });
        });
    }

    /* ── 3. Navbar hide-on-scroll-down / show-on-scroll-up ── */
    function initNavbarBehavior() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;
        let lastY = window.scrollY, ticking = false;

        function onScroll() {
            const y = window.scrollY;
            nav.classList.toggle('pz-scrolled', y > 30);
            if (y > lastY && y > 140) nav.classList.add('pz-hide');
            else nav.classList.remove('pz-hide');
            lastY = y;
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
        }, { passive: true });
    }

    /* ── 4. Scroll reveal observer — applies to cards, titles, blocks ── */
    function initScrollReveals() {
        const targets = document.querySelectorAll(
            '.service-card, .pricing-card, .website-card, .stat-card, ' +
            '.subscription-card, .review-card, .esp-card, .alert-card, ' +
            '.info-box, .contact-item, .website-card, .payment-info .info-box'
        );
        targets.forEach((el, i) => {
            if (el.classList.contains('pz-reveal') || el.classList.contains('pz-reveal-scale')) return;
            el.classList.add('pz-reveal-scale');
            el.style.transitionDelay = (i % 6) * 55 + 'ms';
        });

        const titles = document.querySelectorAll('.section-title, .section-header');
        titles.forEach(el => el.classList.add('pz-reveal'));

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('pz-in');
                if (entry.target.classList.contains('section-title')) {
                    entry.target.classList.add('pz-title-seen');
                }
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.pz-reveal, .pz-reveal-scale').forEach(el => obs.observe(el));

        /* Watch for dynamically injected cards (services grid rebuilds, ps-cards, etc.) */
        const mo = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    const matches = node.matches?.(
                        '.service-card,.pricing-card,.ps-card,.esp-card,.alert-card,.review-card,.website-card'
                    ) ? [node] : node.querySelectorAll?.(
                        '.service-card,.pricing-card,.ps-card,.esp-card,.alert-card,.review-card,.website-card'
                    ) || [];
                    matches.forEach(el => {
                        if (el.dataset.pzWatched) return;
                        el.dataset.pzWatched = '1';
                        el.classList.add('pz-reveal-scale');
                        obs.observe(el);
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => el.classList.add('pz-in'));
                        });
                    });
                });
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    /* ── 5. Section-switch fade (cooperates with existing scrollToSection) ── */
    function initSectionFade() {
        document.querySelectorAll('.section').forEach(sec => {
            sec.style.transition = 'opacity .35s ease';
        });
    }

    /* ── Boot ── */
    function boot() {
        initCurtain();
        initTopBar();
        initNavbarBehavior();
        initScrollReveals();
        initSectionFade();
        console.log('%c✨ site-polish.js — طبقة التحسينات الاحترافية جاهزة', 'color:#f0c419;font-weight:900;background:#050308;padding:4px 10px;border-radius:4px');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 60));
    } else {
        setTimeout(boot, 60);
    }
})();
