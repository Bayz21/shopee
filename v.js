(function () {
    'use strict';
    const CONFIG = {
        links: [
            {
                android: 'intent://s.shopee.co.id/4funpu7X5W#Intent;scheme=https;package=com.shopee.id;end;',
                ios: 'https://s.shopee.co.id/4funpu7X5W'
            },
            {
                android: 'intent://s.shopee.co.id/2VqJFxsMfC#Intent;scheme=https;package=com.shopee.id;end;',
                ios: 'https://s.shopee.co.id/2VqJFxsMfC'
            },
            {
                android: 'intent://spf.shopee.co.id/7fYPV26VHN#Intent;scheme=https;package=com.shopee.id;end;',
                ios: 'https://spf.shopee.co.id/7fYPV26VHN'
            }
        ],
        cookieCount: 'shopee_aff_count', 
        cookieDate: 'shopee_aff_date'
    };

    function setCookie(n, v, h) {
        const d = new Date();
        d.setTime(d.getTime() + h * 3600000);
        document.cookie = `${n}=${v};expires=${d.toUTCString()};path=/`;
    }

    function getCookie(n) {
        const m = document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)'));
        return m ? m[2] : null;
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }


    function getCount() {
        const today = new Date().toDateString();
        if (getCookie(CONFIG.cookieDate) !== today) {
            setCookie(CONFIG.cookieDate, today, 24);
            setCookie(CONFIG.cookieCount, 0, 24);
        }
        return parseInt(getCookie(CONFIG.cookieCount) || 0, 10);
    }


    function canRedirect() {
        return getCount() < CONFIG.links.length;
    }

    function redirect() {
        const count = getCount();
        if (count >= CONFIG.links.length) return; 

        const link = CONFIG.links[count]; 
        setCookie(CONFIG.cookieCount, count + 1, 24);

        if (isAndroid()) {
            window.location.href = link.android;
        } else if (isIOS()) {
            window.location.href = link.ios;
        }
    }

    function init() {
        if (!isAndroid() && !isIOS()) return;
        if (!canRedirect()) return; 

        const COOLDOWN = 1000; 
        let lastRedirect = 0;

        function handler(e) {

            if (Date.now() - lastRedirect < COOLDOWN) return;

            if (!canRedirect()) {
                document.removeEventListener('click', handler);
                document.removeEventListener('touchstart', handler);
                return;
            }

            lastRedirect = Date.now();
            redirect();
        }

        document.addEventListener('click', handler);
        document.addEventListener('touchstart', handler, { passive: true });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
