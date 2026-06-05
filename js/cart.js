/* ================================================================
   بازار صعيد مصر — Cart Manager
   Runs on all pages. Manages localStorage cart state.
   ================================================================ */

const Cart = {
    KEY: 'bazar-cart',

    // ── Read / Write ──────────────────────────────────────────────
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    save(items) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(items));
        } catch (e) {}
        this.updateBadge();
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
    },

    // ── Operations ────────────────────────────────────────────────
    add(product, qty = 1) {
        const items = this.get();
        const idx = items.findIndex((i) => i.id === product.id);
        if (idx > -1) {
            items[idx].qty = Math.min(items[idx].qty + qty, product.stock || 99);
        } else {
            items.push({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
                artisan: product.artisanName,
                stock: product.stock || 99,
                qty
            });
        }
        this.save(items);
        this.flashBadge();
        return items;
    },

    remove(id) {
        const items = this.get().filter((i) => i.id !== id);
        this.save(items);
        return items;
    },

    updateQty(id, qty) {
        const items = this.get();
        const idx = items.findIndex((i) => i.id === id);
        if (idx > -1) {
            if (qty < 1) {
                items.splice(idx, 1);
            } else {
                items[idx].qty = Math.min(qty, items[idx].stock);
            }
        }
        this.save(items);
        return items;
    },

    clear() {
        this.save([]);
    },

    // ── Totals ────────────────────────────────────────────────────
    count() {
        return this.get().reduce((s, i) => s + i.qty, 0);
    },
    subtotal() {
        return this.get().reduce((s, i) => s + i.price * i.qty, 0);
    },

    // ── Badge (cart icon in navbar) ───────────────────────────────
    updateBadge() {
        const n = this.count();
        document.querySelectorAll('#cart-badge').forEach((el) => {
            el.textContent = n;
            el.style.display = n > 0 ? 'flex' : 'none';
        });
    },

    flashBadge() {
        this.updateBadge();
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        badge.classList.remove('cart-badge--flash');
        void badge.offsetWidth; // reflow
        badge.classList.add('cart-badge--flash');
    },

    // ── Format ────────────────────────────────────────────────────
    formatPrice(n, lang) {
        return lang === 'ar'
            ? n.toLocaleString('ar-EG') + ' جنيه'
            : n.toLocaleString('en-US') + ' EGP';
    }
};

// Init badge on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
