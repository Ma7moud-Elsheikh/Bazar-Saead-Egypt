/* ================================================================
   بازار صعيد مصر — Enhancement JS (v1)
   Loaded after shared.js on every page.

   1. Scroll progress bar
   2. Text split animation
   3. Number counter (about page)
   4. Magnetic buttons
   5. Active nav underline indicator
   6. Mobile menu lang toggle
   ================================================================ */

/* ── 1. SCROLL PROGRESS BAR ──────────────────────────────────────── */
function initScrollProgress() {
    // Inject element
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.innerHTML = '<div id="scroll-progress-fill"></div>';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'تقدم قراءة الصفحة');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    document.body.prepend(bar);

    const fill = document.getElementById('scroll-progress-fill');
    const isRTL = document.documentElement.dir === 'rtl';

    let ticking = false;

    function update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

        fill.style.width = pct + '%';
        bar.setAttribute('aria-valuenow', Math.round(pct));

        // RTL: just let CSS handle direction via transform-origin: right

        ticking = false;
    }

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        },
        { passive: true }
    );

    update(); // initial
}

/* ── 2. TEXT SPLIT ANIMATION ─────────────────────────────────────── */
function initTextSplit() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Split section titles into chars on scroll reveal
    const targets = document.querySelectorAll('.section-title');

    targets.forEach((el) => {
        // Skip if already split or inside a card (avoid splitting card titles)
        if (el.closest('.card') || el.closest('.artisan-card-full') || el.dataset.split) return;

        const original = el.innerHTML;
        const lang = document.documentElement.lang;
        el.dataset.split = 'true';
        el.dataset.original = original;

        // Split into chars wrapped in spans
        const text = el.textContent;
        el.classList.add('is-splitting');
        el.innerHTML = text
            .split('')
            .map((ch) =>
                ch === ' '
                    ? '<span class="word-split">&nbsp;</span>'
                    : `<span class="char-split">${ch}</span>`
            )
            .join('');
        el.classList.remove('is-splitting');
        el.classList.add('split-done');

        // Animate on scroll into view
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const chars = el.querySelectorAll('.char-split');
                    gsap.to(chars, {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: lang === 'ar' ? -0.025 : 0.025, // RTL: right to left stagger
                        ease: 'power3.out',
                        delay: 0.1
                    });
                    obs.unobserve(el);
                });
            },
            { threshold: 0.3 }
        );

        obs.observe(el);
    });
}

/* ── 3. NUMBER COUNTER ───────────────────────────────────────────── */
function initCounters() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const counters = document.querySelectorAll('.number-val');
    if (!counters.length) return;

    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    function toArabic(n) {
        return String(Math.round(n))
            .split('')
            .map((d) => arabicNums[parseInt(d)] ?? d)
            .join('');
    }

    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const raw = el.textContent.trim();

                // Extract number and suffix
                const hasPlus = raw.includes('+') || raw.includes('٫') || raw.includes('+');
                const isInfinity = raw === '∞';
                const isArabic = /[\u0660-\u0669]/.test(raw);

                if (isInfinity) {
                    obs.unobserve(el);
                    return;
                } // skip ∞

                // Parse the number from Arabic or Western digits
                const normalized = raw
                    .replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d))
                    .replace(/[^0-9.]/g, '');
                const target = parseFloat(normalized) || 0;

                if (target === 0) {
                    obs.unobserve(el);
                    return;
                }

                const suffix = hasPlus ? '+' : '';
                const arabicSuffix = hasPlus ? '+' : '';

                // Animate
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: 'power2.out',
                    delay: 0.2,
                    onUpdate() {
                        const current = Math.round(obj.val);
                        if (isArabic) {
                            el.textContent = toArabic(current) + arabicSuffix;
                        } else {
                            el.textContent = current + suffix;
                        }
                    },
                    onComplete() {
                        // Restore original text exactly
                        el.textContent = raw;
                    }
                });

                obs.unobserve(el);
            });
        },
        { threshold: 0.6 }
    );

    counters.forEach((el) => obs.observe(el));
}

/* ── 4. MAGNETIC BUTTONS ─────────────────────────────────────────── */
function initMagneticButtons() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // touch only — skip
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const btns = document.querySelectorAll('.btn');

    btns.forEach((btn) => {
        btn.classList.add('is-magnetic');

        const strength = 0.35; // how strong the pull is

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * strength;
            const dy = (e.clientY - cy) * strength;

            gsap.to(btn, {
                x: dx,
                y: dy,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.4)',
                overwrite: 'auto'
            });
        });
    });
}

/* ── 5. ACTIVE NAV INDICATOR ─────────────────────────────────────── */
function initNavIndicator() {
    const navLinks =
        document.getElementById('nav-links-list') || document.querySelector('.nav-links');
    if (!navLinks) return;

    // Inject the sliding indicator
    const indicator = document.createElement('div');
    indicator.id = 'nav-indicator';
    navLinks.style.position = 'relative';
    navLinks.appendChild(indicator);

    const isRTL = document.documentElement.dir === 'rtl';
    const links = navLinks.querySelectorAll('a');

    function moveIndicatorTo(el) {
        const navRect = navLinks.getBoundingClientRect();
        const linkRect = el.getBoundingClientRect();

        indicator.style.width = linkRect.width + 'px';
        indicator.style.opacity = '1';

        if (isRTL) {
            const right = navRect.right - linkRect.right;
            indicator.style.right = right + 'px';
            indicator.style.left = 'auto';
        } else {
            const left = linkRect.left - navRect.left;
            indicator.style.left = left + 'px';
            indicator.style.right = 'auto';
        }
    }

    // Hover: move to hovered link
    links.forEach((link) => {
        link.addEventListener('mouseenter', () => moveIndicatorTo(link));
    });

    // Mouse leaves nav: move back to active link or hide
    navLinks.addEventListener('mouseleave', () => {
        const active = navLinks.querySelector('a.active');
        if (active) {
            moveIndicatorTo(active);
        } else {
            indicator.style.opacity = '0';
        }
    });

    // Initial: show under active link
    const active = navLinks.querySelector('a.active');
    if (active) {
        // Slight delay so layout is stable
        setTimeout(() => {
            indicator.style.transition = 'none';
            moveIndicatorTo(active);
            requestAnimationFrame(() => {
                indicator.style.transition = '';
                indicator.style.opacity = '1';
            });
        }, 100);
    }
}

/* ── BOOT ALL ENHANCEMENTS ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initNavIndicator();
    initMobileLangToggle();

    // These need DOM fully rendered (after shared.js injects navbar/content)
    requestAnimationFrame(() => {
        initMagneticButtons();
        initTextSplit();
        initCounters();
    });
});

// Re-run split + magnetic after dynamic content loads
// (craft-single / artisan-single inject content via fetch)
window._onContentLoaded = function () {
    requestAnimationFrame(() => {
        initTextSplit();
        initMagneticButtons();
    });
};
