/* ================================================================
   button-click-animation.js — Eyad_Eyad12
   إضافة تأثير Ripple + توهج تلقائياً لكل زر/عنصر قابل للنقر بالموقع
   يعمل حتى مع الأزرار المُضافة ديناميكياً (لوحة التحكم، الخدمات...)
================================================================ */

(function () {
    const CLICKABLE_SELECTOR = [
        'button',
        '.service-btn', '.pricing-btn', '.sub-btn', '.send-btn', '.download-btn',
        '.action-btn-service', '.submit-purchase-btn', '.login-submit-btn',
        '.admin-login-btn', '.ok-btn', '.close-btn', '.format-btn', '.mode-btn',
        '.speed-btn', '.rotate-btn', '.filter-card', '.adm-btn', '.esp-btn',
        '.esp-dl-btn', '.esp-style-btn', '.esp-size-btn', '.scr-btn', '.st-run',
        '.rv-save-btn', '.rv-cancel-btn', '.alert-contact-btn', '.pkg-type-btn',
        '.alert-filter-btn', '.filter-btn', '.export-btn', '.add-user-btn',
        '.website-card', '.card-arrow', '.stb-btn', '.chroma-preset',
        '.upload-pick-btn', '.file-upload-label', '.bg-opt-btn', '.action-btn',
        '.adm-nav-item', '.esp-map-btn', '.esp-color-inp', '.merger-del',
        '.scr-del', '.esp-remove-btn'
    ].join(',');

    function createRipple(el, x, y) {
        // تأكد أن العنصر يقبل التموضع
        const style = getComputedStyle(el);
        if (style.position === 'static') el.style.position = 'relative';
        if (style.overflow !== 'hidden') el.style.overflow = 'hidden';

        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.4;
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.width  = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - rect.left - size / 2) + 'px';
        ripple.style.top  = (y - rect.top  - size / 2) + 'px';
        el.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
        // أمان إضافي في حال لم يُطلق الحدث
        setTimeout(() => ripple.remove(), 700);
    }

    function handlePointerDown(e) {
        const target = e.target.closest(CLICKABLE_SELECTOR);
        if (!target || target.disabled) return;

        const point = e.touches && e.touches[0] ? e.touches[0] : e;
        createRipple(target, point.clientX, point.clientY);

        // ومضة توهج خفيفة حول الزر
        target.classList.remove('btn-click-glow');
        void target.offsetWidth; // إعادة تشغيل الأنيميشن
        target.classList.add('btn-click-glow');
        setTimeout(() => target.classList.remove('btn-click-glow'), 550);
    }

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    console.log('%c🖱️ Button Click Animation — Loaded', 'color:#00e5ff;font-weight:900;background:#030c1c;padding:4px 10px;border-radius:4px');
})();
