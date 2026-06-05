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

    // Force scrolled state if page background is light (not dark hero)
  const hasDarkHero = document.getElementById('hero-bg') ||
                      document.querySelector('.craft-hero') ||
                      document.querySelector('.profile-hero') ||
                      document.querySelector('.about-hero');

  if (!hasDarkHero) {
    navbar.classList.add('scrolled');
  }

    let lastY = 0,
        ticking = false;

    window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      // If no dark hero, always keep scrolled class (never transparent)
      if (!hasDarkHero) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.toggle('scrolled', y > 80);
      }
      navbar.classList.toggle('hidden', y > lastY && y > 200);
      lastY = y; ticking = false;
    });
    ticking = true;
  }, { passive: true });

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        const toggle = (open) => {
            hamburger.classList.toggle('open', open);
            mobileMenu.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';

            if (open) {
                navbar.classList.add('menu-open');
            } else {
                navbar.classList.remove('menu-open');
            }
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
        { href: 'shop.html', ar: 'المتجر', en: 'Shop' },
        { href: 'workshops.html', ar: 'ورش العمل', en: 'Workshops' },
        { href: 'about.html', ar: 'عن البازار', en: 'About' },
        { href: 'contact.html', ar: 'تواصل معنا', en: 'Contact' }
    ];
    const cur = location.pathname.split('/').pop() || 'index.html';
    return `
<a href="index.html" class="nav-logo" aria-label="Bazar Sa3eed Masr">
    <img src="img/logo.png" alt="بازار صعيد مصر" class="logo-img" />

    <div class="logo-text">
        <span data-ar="بازار" data-en="Bazar">بازار</span>
        <span class="logo-highlight" data-ar="صعيد" data-en="Sa3eed">صعيد</span>
        <span data-ar="مصر" data-en="Masr">مصر</span>
    </div>
</a>
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
    <a href="login.html" class="nav-icon-btn btn" id="btn-login"
   aria-label="تسجيل الدخول">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.8" width="22" height="22" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
</a>
       <a href="cart.html" class="nav-cart-link btn" aria-label="سلة المشتريات">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
  <span id="cart-badge" aria-label="عدد المنتجات في السلة">0</span>
</a>
    <button id="lang-toggle" class="nav-lang-btn btn" aria-label="Switch to English">EN</button>
    <button id="hamburger" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </div>`;
}

// Mobile menu
function renderMobileMenu() {
    const pages = [
        { href: 'index.html', ar: 'الرئيسية', en: 'Home' },
        { href: 'crafts.html', ar: 'الحرف', en: 'Crafts' },
        { href: 'artisans.html', ar: 'الحرفيون', en: 'Artisans' },
        { href: 'shop.html', ar: 'المتجر', en: 'Shop' },
        { href: 'workshops.html', ar: 'ورش العمل', en: 'Workshops' },
        { href: 'about.html', ar: 'عن البازار', en: 'About' },
        { href: 'contact.html', ar: 'تواصل معنا', en: 'Contact' }
        // { href: 'login.html', ar: 'دخول', en: 'Login' },
        // { href: 'register.html', ar: 'إنشاء حساب', en: 'Register' }
    ];
    return pages
        .map((p) => `<a href="${p.href}" data-ar="${p.ar}" data-en="${p.en}">${p.ar}</a>`)
        .join('');
}

function renderFooter() {
    return `
  <div class="footer-grid">
    <div class="footer-brand">
     <div class="logo">
    <img src="img/logo.png" alt="بازار صعيد مصر" class="logo-img" />

    <span data-ar="بازار" data-en="Bazar">بازار</span>
    <span class="logo-highlight" data-ar="صعيد" data-en="Sa3eed">صعيد</span>
    <span data-ar="مصر" data-en="Masr">مصر</span>
</div>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.032 2.018c-5.48 0-9.94 4.46-9.94 9.94 0 1.75.456 3.468 1.322 4.98L2 22l5.236-1.436c1.462.79 3.108 1.206 4.796 1.206 5.48 0 9.94-4.46 9.94-9.94s-4.46-9.94-9.94-9.94zm0 18.36c-1.49 0-2.95-.4-4.22-1.156l-.302-.18-3.107.85.846-3.03-.197-.313c-.84-1.32-1.283-2.85-1.283-4.42 0-4.63 3.77-8.4 8.4-8.4s8.4 3.77 8.4 8.4-3.77 8.4-8.4 8.4zm4.6-6.29c-.25-.125-1.48-.73-1.71-.813-.23-.083-.398-.125-.566.125-.168.25-.65.813-.797.98-.148.166-.296.187-.546.062-.25-.124-1.056-.39-2.01-1.24-.743-.66-1.244-1.476-1.39-1.726-.148-.25-.016-.385.11-.51.114-.113.25-.297.375-.445.125-.15.167-.248.25-.414.084-.166.042-.31-.02-.433-.062-.124-.566-1.363-.775-1.866-.205-.49-.412-.423-.566-.432s-.296-.01-.455-.01c-.158 0-.415.06-.632.298-.217.24-.826.807-.826 1.97 0 1.16.846 2.284.964 2.442.118.158 1.665 2.542 4.034 3.565.564.244 1.004.39 1.347.5.566.18 1.08.154 1.487.093.454-.068 1.48-.605 1.69-1.19.208-.585.208-1.085.146-1.19-.062-.105-.227-.167-.477-.292z"/>
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
        <li><a href="artisans.html" data-ar="الحرفيون" data-en="Artisans">الحرفيون</a></li>
        <li><a href="workshops.html" data-ar="ورش العمل" data-en="Workshops">ورش العمل</a></li>
        <li><a href="shop.html" data-ar="المتجر" data-en="Shop">المتجر</a></li>
        <li><a href="about.html" data-ar="عن البازار" data-en="About">عن البازار</a></li>
        <li><a href="contact.html" data-ar="تواصل معنا" data-en="Contact">تواصل معنا</a></li>
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
<p>Designed by: <a href="https://mahmoud-elsheikh.vercel.app" target="_blank" rel="noopener noreferrer"
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

    // Init all modules
    initLoader();
    initNavbar();
    initCursor();
    i18n.init();
    initPageTransitions();
    initReveal();
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
