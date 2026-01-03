/**
 * Shopee Click-Anywhere Redirect Script
 * Redirect pengunjung ke Shopee affiliate saat klik di mana saja
 * 
 * Fitur:
 * - Pengunjung hanya terkena 1x dalam 24 jam
 * - Buka di new tab untuk pengunjung desktop
 * - Buka aplikasi Shopee untuk mobile (jika terinstall)
 */

(function() {
    'use strict';

    // ========================================
    // KONFIGURASI - SESUAIKAN DENGAN KEBUTUHAN ANDA
    // ========================================
    
    const CONFIG = {
        // Link affiliate Shopee Anda
        affiliateLink: 'https://s.shopee.co.id/7AX0WadG9L',
        
        // Nama cookie untuk tracking (bisa diganti)
        cookieName: 'shopee_redirect_done',
        
        // Durasi cookie dalam jam (24 jam = 1 hari)
        cookieDuration: 24,
        
        // Minimum waktu di halaman sebelum bisa redirect (dalam milidetik)
        // Contoh: 2000 = 2 detik. Set 0 untuk langsung
        minimumTimeOnPage: 0,
        
        // Aktifkan mode debug (tampilkan console log)
        debug: false
    };

    // ========================================
    // FUNGSI HELPER
    // ========================================

    // Set cookie
    function setCookie(name, value, hours) {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
        
        if (CONFIG.debug) {
            console.log(`[Shopee Redirect] Cookie set: ${name} = ${value}, expires in ${hours} hours`);
        }
    }

    // Get cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    // Check if cookie exists
    function hasRedirectedToday() {
        return getCookie(CONFIG.cookieName) === 'true';
    }

    // Detect mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Detect Android
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    // Detect iOS
    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    // ========================================
    // FUNGSI REDIRECT
    // ========================================

    function redirectToShopee() {
        if (CONFIG.debug) {
            console.log('[Shopee Redirect] Redirecting to Shopee...');
            console.log('[Shopee Redirect] Mobile:', isMobileDevice());
            console.log('[Shopee Redirect] Android:', isAndroid());
        }

        // Set cookie agar tidak redirect lagi hari ini
        setCookie(CONFIG.cookieName, 'true', CONFIG.cookieDuration);

        const isMobile = isMobileDevice();
        
        if (isMobile) {
            // Mobile: Coba buka app, fallback ke browser
            if (isAndroid()) {
                // Android: gunakan intent URL
                const intentURL = `intent://s.shopee.co.id/7AX0WadG9L#Intent;scheme=https;package=com.shopee.id;end;`;
                window.location.href = intentURL;
                
                if (CONFIG.debug) {
                    console.log('[Shopee Redirect] Opening Shopee app (Android)');
                }
            } else if (isIOS()) {
                // iOS: gunakan universal link
                window.location.href = CONFIG.affiliateLink;
                
                if (CONFIG.debug) {
                    console.log('[Shopee Redirect] Opening Shopee app (iOS)');
                }
            } else {
                // Mobile lainnya
                window.location.href = CONFIG.affiliateLink;
            }
        } else {
            // Desktop: buka di new tab
            window.open(CONFIG.affiliateLink, '_blank');
            
            if (CONFIG.debug) {
                console.log('[Shopee Redirect] Opening in new tab (Desktop)');
            }
        }
    }

    // ========================================
    // MAIN SCRIPT
    // ========================================

    function init() {
        // Cek apakah sudah redirect hari ini
        if (hasRedirectedToday()) {
            if (CONFIG.debug) {
                console.log('[Shopee Redirect] User already redirected today. Skipping...');
            }
            return;
        }

        if (CONFIG.debug) {
            console.log('[Shopee Redirect] Script initialized. Waiting for user click...');
        }

        let timeOnPage = 0;
        let redirected = false;
        let clickEnabled = false;

        // Track waktu di halaman
        const startTime = Date.now();
        
        // Enable click setelah minimum time
        setTimeout(function() {
            clickEnabled = true;
            if (CONFIG.debug) {
                console.log('[Shopee Redirect] Click redirect enabled');
            }
        }, CONFIG.minimumTimeOnPage);

        // Handler untuk click event
        function handleClick(e) {
            // Cek apakah sudah redirect
            if (redirected) return;
            
            // Cek minimum time on page
            timeOnPage = Date.now() - startTime;
            if (timeOnPage < CONFIG.minimumTimeOnPage) {
                if (CONFIG.debug) {
                    console.log('[Shopee Redirect] Too soon. Minimum time not reached.');
                }
                return;
            }

            // Cek apakah click pada elemen yang tidak boleh trigger redirect
            const target = e.target;
            const tagName = target.tagName.toLowerCase();
            
            // Jangan redirect jika klik pada link, button, atau form
            if (tagName === 'a' || tagName === 'button' || tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
                if (CONFIG.debug) {
                    console.log('[Shopee Redirect] Click on interactive element. Skipping redirect.');
                }
                return;
            }

            // Jangan redirect jika click pada elemen dengan class/id tertentu
            if (target.classList.contains('no-redirect') || target.id === 'no-redirect') {
                if (CONFIG.debug) {
                    console.log('[Shopee Redirect] Click on no-redirect element. Skipping.');
                }
                return;
            }

            // Redirect!
            redirected = true;
            redirectToShopee();

            // Remove event listeners
            document.removeEventListener('click', handleClick);
            document.removeEventListener('touchstart', handleClickTouch);
        }

        // Handler untuk touch event (mobile)
        function handleClickTouch(e) {
            handleClick(e);
        }

        // Attach event listeners
        document.addEventListener('click', handleClick, false);
        document.addEventListener('touchstart', handleClickTouch, { passive: true });
    }

    // Start script when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

