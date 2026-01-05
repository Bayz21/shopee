(function() {
    'use strict';

    const CONFIG = {
        affiliateLink: 'https://s.shopee.co.id/7AX0WadG9L',

        // Cookie name
        cookieMobile: 'shopee_mobile_count',
        cookieDesktop: 'shopee_desktop_done',

        cookieDuration: 24, // jam
        maxMobileRedirect: 3,

        minimumTimeOnPage: 0,
        debug: false
    };

    /* ================= HELPER ================= */

    function setCookie(name, value, hours) {
        const d = new Date();
        d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    /* ================= LIMIT CHECK ================= */

    function canRedirect() {
        if (isMobileDevice()) {
            const count = parseInt(getCookie(CONFIG.cookieMobile) || '0', 10);
            return count < CONFIG.maxMobileRedirect;
        } else {
            return getCookie(CONFIG.cookieDesktop) !== 'true';
        }
    }

    function markRedirected() {
        if (isMobileDevice()) {
            const count = parseInt(getCookie(CONFIG.cookieMobile) || '0', 10) + 1;
            setCookie(CONFIG.cookieMobile, count, CONFIG.cookieDuration);
        } else {
            setCookie(CONFIG.cookieDesktop, 'true', CONFIG.cookieDuration);
        }
    }

    /* ================= REDIRECT ================= */

    function redirectToShopee() {
        markRedirected();

        if (isMobileDevice()) {
            if (isAndroid()) {
                const intentURL = `intent://s.shopee.co.id/7AX0WadG9L#Intent;scheme=https;package=com.shopee.id;end;`;
                window.location.href = intentURL;
            } else if (isIOS()) {
                window.location.href = CONFIG.affiliateLink;
            } else {
                window.location.href = CONFIG.affiliateLink;
            }
        } else {
            window.open(CONFIG.affiliateLink, '_blank');
        }
    }

    /* ================= MAIN ================= */

    function init() {
        if (!canRedirect()) {
            if (CONFIG.debug) {
                console.log('[Shopee Redirect] Limit reached, skip');
            }
            return;
        }

        let redirected = false;
        const startTime = Date.now();

        function handleClick(e) {
            if (redirected) return;

            if (Date.now() - startTime < CONFIG.minimumTimeOnPage) return;

            const t = e.target.tagName.toLowerCase();
            if (['a','button','input','textarea','select'].includes(t)) return;
            if (e.target.classList.contains('no-redirect') || e.target.id === 'no-redirect') return;

            redirected = true;
            redirectToShopee();

            document.removeEventListener('click', handleClick);
            document.removeEventListener('touchstart', handleClick);
        }

        document.addEventListener('click', handleClick, false);
        document.addEventListener('touchstart', handleClick, { passive: true });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

})();
