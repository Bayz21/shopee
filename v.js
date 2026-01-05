/**
 * Shopee Affiliate Popup Script - Gabungan Desktop & Mobile
 * 
 * Desktop: Popunder 1x per hari (buka popup lalu focus kembali ke website)
 * Mobile: Popup browser 1x + Click redirect (intent://) max 3x per hari
 */

(function(e) {
    "use strict";

    // ========================================
    // KONFIGURASI
    // ========================================
    const CONFIG = {
        // Link affiliate Shopee Anda
        affiliateLink: 'https://s.shopee.co.id/30hVMedphC',
        
        // Cookie names
        cookiePopup: 'shopee_popup_done',
        cookieClickRedirect: 'shopee_click_count',
        
        // Durasi cookie (24 jam)
        cookieDuration: 24,
        
        // Max click redirect untuk mobile (per hari)
        maxClickRedirects: 3,
        
        // Debug mode
        debug: true
    };

    // ========================================
    // COOKIE HELPER FUNCTIONS
    // ========================================
    const CookieHelper = {
        set: function(name, value, hours) {
            const date = new Date();
            date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/";
            
            if (CONFIG.debug) {
                console.log(`[Cookie] Set: ${name} = ${value}`);
            }
        },
        
        get: function(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1);
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length);
                }
            }
            return null;
        },
        
        hasPopupToday: function() {
            return this.get(CONFIG.cookiePopup) === '1';
        },
        
        getClickCount: function() {
            const count = this.get(CONFIG.cookieClickRedirect);
            return count ? parseInt(count) : 0;
        },
        
        incrementClickCount: function() {
            const currentCount = this.getClickCount();
            const newCount = currentCount + 1;
            this.set(CONFIG.cookieClickRedirect, newCount, CONFIG.cookieDuration);
            return newCount;
        },
        
        canClickRedirect: function() {
            return this.getClickCount() < CONFIG.maxClickRedirects;
        }
    };

    // ========================================
    // DEVICE DETECTION
    // ========================================
    const DeviceDetector = {
        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        isAndroid: function() {
            return /Android/i.test(navigator.userAgent);
        },
        
        isIOS: function() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        }
    };

    // ========================================
    // BROWSER DETECTION
    // ========================================
    const ua = navigator.userAgent.toLowerCase();
    const browser = {
        webkit: /webkit/.test(ua),
        mozilla: /mozilla/.test(ua) && !/(compatible|webkit)/.test(ua),
        chrome: /chrome/.test(ua),
        msie: /msie|trident\//.test(ua) && !/opera/.test(ua),
        firefox: /firefox/.test(ua),
        safari: /safari/.test(ua) && !/chrome/.test(ua),
        opera: /opera/.test(ua),
        version: (function() {
            const match = ua.match(/(?:[^\s]+(?:ri|ox|me|ra)\/|trident\/.*?rv:)([\d]+)/i);
            return match ? parseInt(match[1], 10) : 0;
        })()
    };

    // ========================================
    // POPUP HELPER (dari info.js)
    // ========================================
    const PopupHelper = {
        simulateClick: function(url) {
            const link = document.createElement("a");
            const evt = document.createEvent("MouseEvents");
            link.href = url || "data:text/html,<script>window.close();</script>;";
            document.body.appendChild(link);
            evt.initMouseEvent("click", true, true, e, 0, 0, 0, 0, 0, true, false, false, true, 0, null);
            link.dispatchEvent(evt);
            link.parentNode.removeChild(link);
        },
        
        blur: function(win) {
            try {
                win.blur();
                win.opener.window.focus();
                e.self.window.focus();
                e.focus();
                
                if (browser.firefox) {
                    this.openCloseWindow(win);
                } else if (browser.webkit && (!browser.chrome || browser.chrome && browser.version < 41)) {
                    this.openCloseTab();
                } else if (browser.msie) {
                    setTimeout(function() {
                        win.blur();
                        win.opener.window.focus();
                        e.self.window.focus();
                        e.focus();
                    }, 1000);
                }
            } catch (err) {
                if (CONFIG.debug) {
                    console.log('[Popup] Blur error:', err);
                }
            }
        },
        
        openCloseWindow: function(win) {
            const tmp = win.window.open("about:blank");
            tmp.focus();
            tmp.close();
            setTimeout(function() {
                try {
                    const tmp2 = win.window.open("about:blank");
                    tmp2.focus();
                    tmp2.close();
                } catch (err) {}
            }, 1);
        },
        
        openCloseTab: function() {
            this.simulateClick();
        }
    };

    // ========================================
    // POPUNDER FUNCTION (Desktop)
    // ========================================
    function createPopunder() {
        if (CookieHelper.hasPopupToday()) {
            if (CONFIG.debug) {
                console.log('[Popunder] Already shown today');
            }
            return;
        }

        if (CONFIG.debug) {
            console.log('[Popunder] Creating popunder for desktop...');
            console.log('[Popunder] Browser:', browser.chrome ? 'Chrome' : browser.firefox ? 'Firefox' : browser.safari ? 'Safari' : 'Other');
        }

        // Set cookie untuk popup
        CookieHelper.set(CONFIG.cookiePopup, '1', CONFIG.cookieDuration);

        let popup = null;

        // Chrome modern (versi > 30) dengan blur
        if (browser.chrome && browser.version > 30) {
            if (CONFIG.debug) {
                console.log('[Popunder] Using Chrome modern method');
            }
            e.open("javascript:window.focus()", "_self", "");
            PopupHelper.simulateClick(CONFIG.affiliateLink);
        } else {
            // Method standar untuk browser lain
            if (CONFIG.debug) {
                console.log('[Popunder] Using standard method');
            }
            popup = window.open(CONFIG.affiliateLink, "_blank");
            
            if (popup) {
                PopupHelper.blur(popup);
            }
        }

        if (CONFIG.debug) {
            console.log('[Popunder] Popunder created successfully');
        }
    }

    // ========================================
    // CLICK REDIRECT (Mobile Only - Intent URL)
    // ========================================
    function setupClickRedirect() {
        if (!DeviceDetector.isMobile()) {
            if (CONFIG.debug) {
                console.log('[Click] Desktop detected, click redirect disabled');
            }
            return;
        }

        if (!CookieHelper.canClickRedirect()) {
            if (CONFIG.debug) {
                console.log('[Click] Max redirects reached today');
            }
            return;
        }

        if (CONFIG.debug) {
            console.log('[Click] Click redirect enabled for mobile');
        }

        let redirected = false;

        function handleClick(e) {
            if (redirected) return;
            
            // Cek apakah masih bisa redirect
            if (!CookieHelper.canClickRedirect()) {
                if (CONFIG.debug) {
                    console.log('[Click] Max redirects reached');
                }
                document.removeEventListener('click', handleClick);
                document.removeEventListener('touchstart', handleClickTouch);
                return;
            }

            const target = e.target;
            const tagName = target.tagName.toLowerCase();
            
            // Skip jika klik pada elemen interaktif
            if (tagName === 'a' || tagName === 'button' || tagName === 'input' || 
                tagName === 'textarea' || tagName === 'select') {
                return;
            }

            // Skip jika elemen punya class/id no-redirect
            if (target.classList.contains('no-redirect') || target.id === 'no-redirect') {
                return;
            }

            redirected = true;
            
            // Increment counter
            const count = CookieHelper.incrementClickCount();
            
            if (CONFIG.debug) {
                console.log(`[Click] Redirecting... (${count}/${CONFIG.maxClickRedirects})`);
            }

            // Redirect dengan intent URL untuk mobile
            if (DeviceDetector.isAndroid()) {
                const intentURL = `intent://s.shopee.co.id/30hVMedphC#Intent;scheme=https;package=com.shopee.id;end;`;
                window.location.href = intentURL;
            } else if (DeviceDetector.isIOS()) {
                window.location.href = CONFIG.affiliateLink;
            } else {
                window.location.href = CONFIG.affiliateLink;
            }

            // Remove listeners setelah redirect
            setTimeout(function() {
                document.removeEventListener('click', handleClick);
                document.removeEventListener('touchstart', handleClickTouch);
            }, 100);
        }

        function handleClickTouch(e) {
            handleClick(e);
        }

        // Attach listeners
        document.addEventListener('click', handleClick, false);
        document.addEventListener('touchstart', handleClickTouch, { passive: true });
    }

    // ========================================
    // MAIN INITIALIZATION
    // ========================================
    function init() {
        if (CONFIG.debug) {
            console.log('[Init] Starting Shopee Affiliate Script...');
            console.log('[Init] Device:', DeviceDetector.isMobile() ? 'Mobile' : 'Desktop');
            console.log('[Init] User Agent:', navigator.userAgent);
        }

        // Desktop: Popunder saja
        if (!DeviceDetector.isMobile()) {
            createPopunder();
        } 
        // Mobile: Popup standar (bukan popunder) + Click Redirect
        else {
            // 1. Popup standar untuk mobile (1x per hari)
            if (!CookieHelper.hasPopupToday()) {
                if (CONFIG.debug) {
                    console.log('[Mobile] Opening standard popup...');
                }
                CookieHelper.set(CONFIG.cookiePopup, '1', CONFIG.cookieDuration);
                window.open(CONFIG.affiliateLink, "_blank");
            }
            
            // 2. Setup Click Redirect (max 3x per hari)
            setupClickRedirect();
        }

        if (CONFIG.debug) {
            console.log('[Init] Script initialized successfully');
            console.log('[Init] Popup today:', CookieHelper.hasPopupToday());
            if (DeviceDetector.isMobile()) {
                console.log('[Init] Click count today:', CookieHelper.getClickCount());
            }
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
