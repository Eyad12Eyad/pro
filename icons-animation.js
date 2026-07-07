/* ================================================================
   icons-animation.js — Eyad_Eyad12
   تفعيل حركة الظهور المتدرج (Stagger) للأيقونات عند دخولها الشاشة
   أضف قبل </body> بعد icons-animation.css:
   <script src="icons-animation.js" defer></script>
================================================================ */

(function () {
    /* الحاويات التي تحتوي أيقونات نريد لها تأثير دخول متدرج */
    const CONTAINER_SELECTORS = [
        '.services-grid .service-card',
        '.stats-grid .stat-card',
        '.pricing-grid .pricing-card',
        '.websites-grid .website-card',
        '.payment-info .info-box',
        '.esp-grid .esp-card',
        '.alerts-grid .alert-card',
        '.reviews-grid .review-card',
        '.ps-grid .ps-card'
    ];

    function markIconsForStagger() {
        CONTAINER_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(card => {
                const icon = card.querySelector('i[class*="fa-"]');
                if (icon && !icon.classList.contains('icon-stagger-target')) {
                    icon.classList.add('icon-stagger-target');
                }
            });
        });
    }

    function initObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('icon-in-view');
                    }, i * 45);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        document.querySelectorAll('.icon-stagger-target').forEach(el => observer.observe(el));
    }

    function run() {
        markIconsForStagger();
        initObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(run, 250));
    } else {
        setTimeout(run, 250);
    }

    /* مراقبة إضافة عناصر جديدة ديناميكياً (خدمات، بطاقات مضافة من الإدارة...) */
    const mo = new MutationObserver(() => {
        clearTimeout(window._iconAnimDebounce);
        window._iconAnimDebounce = setTimeout(run, 400);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    console.log('%c✨ Icons Animation — Loaded', 'color:#ffd700;font-weight:900;background:#0a0000;padding:4px 10px;border-radius:4px');
})();
