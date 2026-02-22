(function () {
    'use strict';

    const CONFIG = {
        ANDROID_INTENT: 'intent://s.shopee.co.id/3LLZSTwilk#Intent;scheme=https;package=com.shopee.id;end;',
        IOS_LINK: 'https://s.shopee.co.id/3LLZSTwilk',
        maxPerDay: 2,
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

    function canRedirect() {
        const today = new Date().toDateString();
        if (getCookie(CONFIG.cookieDate) !== today) {
            setCookie(CONFIG.cookieDate, today, 24);
            setCookie(CONFIG.cookieCount, 0, 24);
        }
        return (parseInt(getCookie(CONFIG.cookieCount) || 0) < CONFIG.maxPerDay);
    }

    function addCount() {
        setCookie(CONFIG.cookieCount, (parseInt(getCookie(CONFIG.cookieCount) || 0) + 1), 24);
    }

    function redirect() {
        if (!canRedirect()) return;
        addCount();

        if (isAndroid()) {
            window.location.href = CONFIG.ANDROID_INTENT;
        } else if (isIOS()) {
            window.location.href = CONFIG.IOS_LINK;
        }
    }

    function init() {
        if (!isAndroid() && !isIOS()) return;

        let done = false;
        function handler(e) {
            if (done) return;

            const t = e.target.tagName.toLowerCase();
            if (['a','button','input','textarea','select'].includes(t)) return;

            done = true;
            redirect();
            document.removeEventListener('click', handler);
            document.removeEventListener('touchstart', handler);
        }

        document.addEventListener('click', handler);
        document.addEventListener('touchstart', handler, { passive: true });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
