/* ================================================================
   بازار صعيد مصر — Shared JS  (v3 — production-ready)
   ================================================================ */

/* ── Language System ─────────────────────────────────────────────── */
const i18n = {
    currentLang: localStorage.getItem('bazar-lang') || 'ar',

    init() {
        this.apply(this.currentLang);
        document.getElementById('lang-toggle')?.addEventListener('click', () => this.toggle());
    },

    apply(lang) {
        this.currentLang = lang;
        document.documentElement.lang = lang;
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.body.setAttribute('dir', dir);

        document.querySelectorAll('[data-ar][data-en]').forEach((el) => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });
        document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]').forEach((el) => {
            el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
        });
        document.querySelectorAll(`option[data-${lang}]`).forEach((el) => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });

        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.textContent = lang === 'ar' ? 'EN' : 'ع';
            btn.setAttribute(
                'aria-label',
                lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'
            );
        }
        localStorage.setItem('bazar-lang', lang);
        window._onLangChange?.(lang);
    },

    toggle() {
        this.apply(this.currentLang === 'ar' ? 'en' : 'ar');
    },
    t(ar, en) {
        return this.currentLang === 'ar' ? ar : en;
    }
};

/* ── Custom Cursor ───────────────────────────────────────────────── */
function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;

    let mx = 0,
        my = 0,
        fx = 0,
        fy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
    });

    (function tick() {
        fx += (mx - fx) * 0.1;
        fy += (my - fy) * 0.1;
        follower.style.left = fx + 'px';
        follower.style.top = fy + 'px';
        requestAnimationFrame(tick);
    })();

    document
        .querySelectorAll('a,button,[role="button"],input,textarea,select,label')
        .forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
}

/* ── Cinematic Loader ────────────────────────────────────────────── */
function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    if (sessionStorage.getItem('bazar-loaded')) {
        loader.style.display = 'none';
        return;
    }

    const fill = loader.querySelector('.loader-bar-fill');
    let progress = 0;

    if (typeof gsap !== 'undefined') {
        gsap.from('.loader-logo', { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' });
    }

    const iv = setInterval(() => {
        progress += Math.random() * 18 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(iv);
            if (fill) fill.style.width = '100%';
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.65,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            loader.style.display = 'none';
                            sessionStorage.setItem('bazar-loaded', '1');
                        }
                    });
                } else {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity .65s';
                    setTimeout(() => {
                        loader.style.display = 'none';
                        sessionStorage.setItem('bazar-loaded', '1');
                    }, 700);
                }
            }, 300);
        }
        if (fill) fill.style.width = Math.min(progress, 100) + '%';
    }, 70);
}

/* ── Navbar ──────────────────────────────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastY = 0,
        ticking = false;

    window.addEventListener(
        'scroll',
        () => {
            if (ticking) return;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                navbar.classList.toggle('scrolled', y > 80);
                navbar.classList.toggle('hidden', y > lastY && y > 200);
                lastY = y;
                ticking = false;
            });
            ticking = true;
        },
        { passive: true }
    );

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        const toggle = (open) => {
            hamburger.classList.toggle('open', open);
            mobileMenu.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        };
        hamburger.addEventListener('click', () => toggle(!hamburger.classList.contains('open')));
        mobileMenu
            .querySelectorAll('a')
            .forEach((a) => a.addEventListener('click', () => toggle(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hamburger.classList.contains('open')) {
                toggle(false);
                hamburger.focus();
            }
        });

        const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    // Active link
    const cur = location.pathname.split('/').pop() || 'index.html';
    navbar.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href').split('?')[0].split('#')[0];
        if (href === cur) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
        }
    });
}

/* ── Page Transitions ────────────────────────────────────────────── */
function initPageTransitions() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    const delay = sessionStorage.getItem('bazar-loaded') ? 0.1 : 3.0;

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(
            overlay,
            { scaleY: 1, transformOrigin: 'top' },
            { scaleY: 0, transformOrigin: 'top', duration: 0.7, ease: 'power3.inOut', delay }
        );
    } else {
        setTimeout(() => {
            overlay.style.transform = 'scaleY(0)';
            overlay.style.transition = 'transform .7s';
        }, delay * 1000);
    }

    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (
            !href ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('http') ||
            link.target === '_blank'
        )
            return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dest = href;
            if (typeof gsap !== 'undefined') {
                gsap.to(overlay, {
                    scaleY: 1,
                    transformOrigin: 'bottom',
                    duration: 0.5,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        location.href = dest;
                    }
                });
            } else {
                location.href = dest;
            }
        });
    });
}

/* ── Scroll Reveal ───────────────────────────────────────────────── */
function initReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
        return;
    }

    if (window._revealObs) {
        window._revealObs.disconnect();
        window._revealObs = null;
    }

    window._revealObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        el.classList.add('visible');
                        window._revealObs?.unobserve(el);
                    });
                });
            });
        },
        {
            threshold: 0,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    const observe = () => {
        document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
            window._revealObs?.observe(el);
        });
    };

    requestAnimationFrame(observe);
}

/* ── Lenis Smooth Scroll ─────────────────────────────────────────── */
function initLenis() {
    if (typeof Lenis === 'undefined') return null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        (function raf(t) {
            lenis.raf(t);
            requestAnimationFrame(raf);
        })(0);
    }
    window._lenis = lenis;
    return lenis;
}

/* ── Ambient Audio — Web Audio API (no external URL needed) ─────── */
function initAudio() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;

    let ctx = null,
        nodes = [],
        playing = false;

    function buildAmbient() {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const master = ctx.createGain();
        master.gain.value = 0.12;
        master.connect(ctx.destination);

        // Layer 1: low drone (oud-like)
        [55, 110, 165].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.25 - i * 0.07;
            osc.connect(gain);
            gain.connect(master);
            osc.start();
            nodes.push(osc, gain);
        });

        // Layer 2: soft noise (wind/room)
        const bufSize = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.018;
        const noise = ctx.createBufferSource();
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 800;
        noise.buffer = buf;
        noise.loop = true;
        noise.connect(noiseFilter);
        noiseFilter.connect(master);
        noise.start();
        nodes.push(noise, noiseFilter);

        // Layer 3: gentle bell tones
        function bell() {
            if (!playing || !ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = [220, 277.18, 329.63, 440][Math.floor(Math.random() * 4)];
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);
            osc.connect(gain);
            gain.connect(master);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 3.5);
            setTimeout(bell, 3000 + Math.random() * 5000);
        }
        setTimeout(bell, 1500);

        nodes.push(master);
    }

    btn.addEventListener('click', () => {
        if (!ctx) buildAmbient();
        if (playing) {
            ctx.suspend();
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', i18n.t('تشغيل الموسيقى المحيطة', 'Play ambient music'));
        } else {
            ctx.resume();
            btn.classList.add('playing');
            btn.setAttribute('aria-label', i18n.t('إيقاف الموسيقى', 'Stop ambient music'));
        }
        playing = !playing;
    });

    document.addEventListener('visibilitychange', () => {
        if (!ctx) return;
        if (document.hidden) ctx.suspend();
        else if (playing) ctx.resume();
    });
}

/* ── Hero GSAP Animations ────────────────────────────────────────── */
function initHeroGSAP() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const delay = sessionStorage.getItem('bazar-loaded') ? 0.2 : 2.8;
    const tl = gsap.timeline({ delay });

    if (document.querySelector('.hero-eyebrow'))
        tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    if (document.querySelector('.hero-title-line'))
        tl.to(
            '.hero-title-line',
            { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' },
            '-=0.4'
        );
    if (document.querySelector('.hero-subtitle'))
        tl.to('.hero-subtitle', { opacity: 0.9, duration: 0.7, ease: 'power2.out' }, '-=0.25');
    if (document.querySelector('.hero-actions'))
        tl.to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.25');
    if (document.querySelector('.hero-stats'))
        tl.to('.hero-stats', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3');

    // Parallax hero bg
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 25,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }
}

/* ── Journey Scroll Storytelling ─────────────────────────────────── */
function initJourney() {
    const section = document.getElementById('journey-section');
    if (!section || typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const steps = section.querySelectorAll('.journey-step');
    const dots = section.querySelectorAll('.journey-dot');
    const bgImgs = [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&h=900&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&h=900&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1513506003901-1e6a35f56c57?w=1600&h=900&fit=crop&auto=format'
    ];
    const bgEl = section.querySelector('#journey-bg-img');
    let current = -1;

    function showStep(idx) {
        if (idx === current) return;
        current = idx;
        const lang = document.documentElement.lang || 'ar';

        steps.forEach((s, i) => s.classList.toggle('active', i === idx));

        dots.forEach((d, i) => {
            const isActive = i === idx;
            d.classList.toggle('active', isActive);
            d.setAttribute('aria-selected', String(isActive));
        });

        if (bgEl && bgImgs[idx]) {
            gsap.to(bgEl, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    bgEl.src = bgImgs[idx];
                    gsap.to(bgEl, { opacity: 0.28, duration: 0.5 });
                }
            });
        }

        // Update tooltip on active dot
        const activeDot = dots[idx];
        if (activeDot) {
            const label = lang === 'ar' ? activeDot.dataset.labelAr : activeDot.dataset.labelEn;
            const stepNum = idx + 1;
            activeDot.setAttribute(
                'aria-label',
                lang === 'ar'
                    ? `المرحلة ${['١', '٢', '٣', '٤'][idx]} — ${label}`
                    : `Step ${stepNum} — ${label}`
            );
        }
    }

    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate(self) {
            showStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
        }
    });

    // Dot click: scroll to matching section segment
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            const segHeight = section.offsetHeight / steps.length;
            const target = sectionTop + segHeight * i + 1;
            if (window._lenis) {
                window._lenis.scrollTo(target, {
                    duration: 1.2,
                    easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
                });
            } else {
                window.scrollTo({ top: target, behavior: 'smooth' });
            }
        });

        // Hover tooltip via CSS title
        dot.addEventListener('mouseenter', () => {
            const lang = document.documentElement.lang || 'ar';
            const label = lang === 'ar' ? dot.dataset.labelAr : dot.dataset.labelEn;
            if (label) dot.title = label;
        });
    });
}

/* ── SEO Meta Injection for Dynamic Pages ────────────────────────── */
function setPageMeta({ title, description, ogTitle, ogDescription, ogImage, ogType = 'website' }) {
    document.title = title;
    const setMeta = (sel, val) => {
        let el = document.querySelector(sel);
        if (!el) {
            el = document.createElement('meta');
            document.head.appendChild(el);
        }
        el.setAttribute(sel.includes('property') ? 'content' : 'content', val);
        const attr = sel.match(/\[([^\]]+)=/)?.[1];
        const attrVal = sel.match(/="([^"]+)"/)?.[1];
        if (attr && attrVal) el.setAttribute(attr, attrVal);
        el.setAttribute('content', val);
    };
    document.querySelector('meta[name="description"]')?.setAttribute('content', description || '');
    // OG tags — create if missing
    const ogTags = {
        'og:title': ogTitle || title,
        'og:description': ogDescription || description,
        'og:image':
            ogImage ||
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&fit=crop&auto=format',
        'og:type': ogType
    };
    Object.entries(ogTags).forEach(([prop, val]) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', prop);
            document.head.appendChild(el);
        }
        el.setAttribute('content', val);
    });
    // Twitter card
    ['summary_large_image'].forEach((v) => {
        let el = document.querySelector('meta[name="twitter:card"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', 'twitter:card');
            document.head.appendChild(el);
        }
        el.setAttribute('content', v);
    });
}

/* ── Render shared Navbar ────────────────────────────────────────── */
function renderNavbar() {
    const pages = [
        { href: 'index.html', ar: 'الرئيسية', en: 'Home' },
        { href: 'crafts.html', ar: 'الحرف', en: 'Crafts' },
        { href: 'artisans.html', ar: 'الحرفيون', en: 'Artisans' },
        { href: 'workshops.html', ar: 'ورش العمل', en: 'Workshops' },
        { href: 'about.html', ar: 'عن البازار', en: 'About' },
        { href: 'contact.html', ar: 'تواصل معنا', en: 'Contact' }
    ];
    const cur = location.pathname.split('/').pop() || 'index.html';
    return `
  <a href="index.html" class="nav-logo" aria-label="Bazar Sa3eed Masr">Bazar <span>Sa3eed</span> Masr</a>
  <nav aria-label="Primary navigation">
    <ul class="nav-links">
      ${pages
          .map(
              (p) => `<li><a href="${p.href}" data-ar="${p.ar}" data-en="${p.en}"
        ${p.href === cur ? 'class="active" aria-current="page"' : ''}>${p.ar}</a></li>`
          )
          .join('')}
    </ul>
  </nav>
  <div class="nav-actions">
    <a href="login.html" class="btn btn-outline"
       style="padding:8px 18px;font-size:.8rem;min-height:44px"
       data-ar="دخول" data-en="Login">دخول</a>
    <button id="lang-toggle" aria-label="Switch to English">EN</button>
    <button id="hamburger" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </div>`;
}

function renderMobileMenu() {
    const pages = [
        { href: 'index.html', ar: 'الرئيسية', en: 'Home' },
        { href: 'crafts.html', ar: 'الحرف', en: 'Crafts' },
        { href: 'artisans.html', ar: 'الحرفيون', en: 'Artisans' },
        { href: 'workshops.html', ar: 'ورش العمل', en: 'Workshops' },
        { href: 'about.html', ar: 'عن البازار', en: 'About' },
        { href: 'contact.html', ar: 'تواصل معنا', en: 'Contact' },
        { href: 'login.html', ar: 'دخول', en: 'Login' },
        { href: 'register.html', ar: 'إنشاء حساب', en: 'Register' }
    ];
    return pages
        .map((p) => `<a href="${p.href}" data-ar="${p.ar}" data-en="${p.en}">${p.ar}</a>`)
        .join('');
}

function renderFooter() {
    return `
  <div class="footer-grid">
    <div class="footer-brand">
     <div class="logo">Bazar <span>Sa3eed</span> Masr</div>
      <p data-ar="منصة تجمع حرفيي صعيد مصر بالعالم. نحتفظ بالتراث ونصنع المستقبل."
         data-en="A platform connecting Upper Egypt's artisans with the world.">
        منصة تجمع حرفيي صعيد مصر بالعالم. نحتفظ بالتراث ونصنع المستقبل.
      </p>
      <div class="footer-social" aria-label="روابط التواصل الاجتماعي">
        <a href="#" aria-label="Facebook">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a href="#" aria-label="Instagram">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a href="#" aria-label="YouTube">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#2C2C2C"/>
          </svg>
        </a>
        <a href="#" aria-label="WhatsApp">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12 12 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 2a10 10 0 0 1 8.657 14.998L22 22l-5.002-1.343A10 10 0 1 1 12 2"/>
          </svg>
        </a>
      </div>
    </div>
    <div class="footer-col">
      <h4 data-ar="الحرف" data-en="Crafts">الحرف</h4>
      <ul>
        <li><a href="craft-single.html?slug=pottery"    data-ar="الفخار"           data-en="Pottery">الفخار</a></li>
        <li><a href="craft-single.html?slug=weaving"    data-ar="النسيج"           data-en="Weaving">النسيج</a></li>
        <li><a href="craft-single.html?slug=embroidery" data-ar="التطريز"          data-en="Embroidery">التطريز</a></li>
        <li><a href="craft-single.html?slug=copper"     data-ar="النحاسيات"        data-en="Copperwork">النحاسيات</a></li>
        <li><a href="craft-single.html?slug=woodwork"   data-ar="الأعمال الخشبية" data-en="Woodwork">الأعمال الخشبية</a></li>
        <li><a href="craft-single.html?slug=glass"      data-ar="زجاج الفسيفساء"  data-en="Mosaic Glass">زجاج الفسيفساء</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 data-ar="روابط سريعة" data-en="Quick Links">روابط سريعة</h4>
      <ul>
        <li><a href="artisans.html"  data-ar="الحرفيون"   data-en="Artisans">الحرفيون</a></li>
        <li><a href="workshops.html" data-ar="ورش العمل"  data-en="Workshops">ورش العمل</a></li>
        <li><a href="about.html"     data-ar="عن البازار" data-en="About">عن البازار</a></li>
        <li><a href="contact.html"   data-ar="تواصل معنا" data-en="Contact">تواصل معنا</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 data-ar="حسابي" data-en="Account">حسابي</h4>
      <ul>
        <li><a href="login.html"    data-ar="تسجيل الدخول" data-en="Login">تسجيل الدخول</a></li>
        <li><a href="register.html" data-ar="إنشاء حساب"  data-en="Register">إنشاء حساب</a></li>
        <li><a href="contact.html"  data-ar="الدعم"        data-en="Support">الدعم</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
   <p>© <span id="footer-year"></span> Bazar Sa3eed Masr. All rights reserved.</p>
<p>Designed by <a href="https://mahmoud-elsheikh.vercel.app" target="_blank" rel="noopener noreferrer"
   style="color:var(--copper);text-decoration:none;transition:opacity .2s"
   onmouseenter="this.style.opacity='.7'" onmouseleave="this.style.opacity='1'">
   Mahmoud Elsheikh
</a></p>
  </div>`;
}

/* ── Boot ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Inject shared elements
    const navEl = document.getElementById('navbar');
    if (navEl) navEl.innerHTML = renderNavbar();

    const menuEl = document.getElementById('mobile-menu');
    if (menuEl) menuEl.innerHTML = renderMobileMenu();

    const footerEl = document.querySelector('footer');
    if (footerEl) footerEl.innerHTML = renderFooter();

    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn && !audioBtn.innerHTML.trim()) {
        audioBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>`;
    }

    // Init all modules
    initLoader();
    initNavbar();
    initCursor();
    i18n.init();
    initPageTransitions();
    initReveal();
    initAudio();
    initLenis();

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initHeroGSAP();
        initJourney();
    }

    // Cleanup on page unload
    window.addEventListener('pagehide', () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.killAll();
        window._lenis?.destroy();
    });
});
