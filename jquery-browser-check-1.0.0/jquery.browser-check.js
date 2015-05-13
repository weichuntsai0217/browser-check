/*!
 * jQuery Browser-Check Plugin v0.0.0
 *
 * Copyright (c) 2015 Jimmy Tsai
 */
(function($) {
    var defaults = {
        verReq: {
            'chrome': '42.0.2311.135',
            'safari': '8.0.6',
            'firefox': '37.0',
            'opr': '29.0.1795.47',
            'msie': '11.0'
        },
        verCpr: {
            'chrome': 1,
            'safari': 1,
            'firefox': 1,
            'opr': 1,
            'msie': 1
        },
        spr: { // seperator, 'version' means safari
            'chrome':'/',
            'version':'/',
            'firefox':'/',
            'opr':'/',
            'msie':' '
        },
        showBrowser: {
            'chrome':'Google Chrome',
            'safari':'Safari',
            'firefox':'Firefox',
            'opr':'Opera',
            'msie':'Internet Explorer'
        },
        link: {
            'chrome':'https://www.google.com/chrome/browser/desktop/index.html',
            'safari':'https://support.apple.com/zh-tw/HT201541',
            'firefox':'https://www.mozilla.org/zh-TW/firefox/new/',
            'opr':'http://www.opera.com/zh-tw',
            'msie':'http://windows.microsoft.com/zh-tw/internet-explorer/download-ie'
        },
        device: {
            'desktop': true,
            'mobile': true
        },
        addcookie: {
            'customcookie': 'browseralert=noalert',
            'customexpire': 'browserclose'
        }
    };
    var agt = navigator.userAgent.toLowerCase();
    var doubleCheck;
    jQuery.bcPlugin = {
        getBrowser: function() {
            var browser = '';
            if (agt.indexOf("opr") > -1) {
                browser = "opr";
            } else if (agt.indexOf("chrome") > -1) {
                browser = "chrome"; 
            } else if (agt.indexOf("safari") > -1) {
                browser = "safari";
            } else if (agt.indexOf("firefox") > -1) {
                browser = "firefox";
            } else if (agt.indexOf("msie") > -1) {
                browser = "msie";
            }
            return browser;
        },
        getVersion: function() {
            var browser = $.bcPlugin.getBrowser();
            var version = '';
            if (browser === 'safari') {
                browser = 'version';
            }
            var tmp = agt.substr(agt.indexOf(browser));
            var end = '';
            if ((browser === 'chrome') || (browser === 'version')) {
                end = tmp.indexOf(' ');
            } else if ((browser === 'firefox') || (browser === 'opr')) {
                end = tmp.length + 1;
            } else { // ie case
                end = tmp.indexOf(';');
            }
            var pos = tmp.indexOf(defaults.spr[browser])+1;
            var len = end - pos; 
            var version = tmp.substr(pos, len);
            return version;
        },
        isMobile: function() {
            var mobiles = new Array
                (
                    "midp", "j2me", "avant", "docomo", "novarra", "palmos", "palmsource",
                    "240x320", "opwv", "chtml", "pda", "windows ce", "mmp/",
                    "blackberry", "mib/", "symbian", "wireless", "nokia", "hand", "mobi",
                    "phone", "cdm", "up.b", "audio", "sie-", "sec-", "samsung", "htc",
                    "mot-", "mitsu", "sagem", "sony", "alcatel", "lg", "eric", "vx",
                    "NEC", "philips", "mmm", "xx", "panasonic", "sharp", "wap", "sch",
                    "rover", "pocket", "benq", "java", "pt", "pg", "vox", "amoi",
                    "bird", "compal", "kg", "voda", "sany", "kdd", "dbt", "sendo",
                    "sgh", "gradi", "jb", "dddi", "moto", "iphone", "android",
                    "iPod", "incognito", "webmate", "dream", "cupcake", "webos",
                    "s8000", "bada", "googlebot-mobile"
                );
            var isMobile = false;
            for (var i = 0; i < mobiles.length; i++) {
                if (agt.indexOf(mobiles[i]) >= 0) {
                    isMobile = true;
                    break;
                }
            }
            return isMobile;
        },
        notifyUpgrade: function( options ) {
            var settings = $.extend( true, {}, defaults, options);
            doubleCheck = $.extend( true, {}, settings);
            if (( settings.device.desktop === false ) && ( settings.device.mobile === false )) {
                return;
            } else if ( settings.device.mobile === false ) {
                if ( $.bcPlugin.isMobile() ) {
                    return;
                }
            } else if ( settings.device.desktop === false ) {
                if ( !($.bcPlugin.isMobile()) ) {
                    return;
                }
            }
            var browser = $.bcPlugin.getBrowser();
            var version = $.bcPlugin.getVersion().split('.');
            var verreq = settings.verReq[browser].split('.');
            var min = Math.min(settings.verCpr[browser], verreq.length, version.length);
            if ( $.bcPlugin.compareVersion(version, verreq, min) ) {
                if ( !$.bcPlugin.checkCookie( settings.addcookie.customcookie ) ) {
                    $.bcPlugin.setCookie( settings.addcookie.customcookie, settings.addcookie.customexpire );
                    $.bcPlugin.showUpgradeMsg(settings.showBrowser[browser], settings.verReq[browser], settings.link[browser]);
                }
            }
        },
        compareVersion: function(version, verreq, min) {
            // if verreq > version, will return true
            var bigger = false;
            for( var i = 0; i < min; i++ ) {
                if ( parseInt( version[i] ) < parseInt( verreq[i] ) ) {
                    bigger = true;
                    break;
                } else if ( parseInt( version[i] ) > parseInt( verreq[i] ) ) {
                    bigger = false;
                    break;
                }
            }
            return bigger;
        },
        checkCookie: function(customcookie) {
            if ( document.cookie && (document.cookie.indexOf(customcookie) != -1) ) {
                return true;
            }
            return false;
        },
        setCookie: function(customcookie, customexpire) {
            var expiretime = $.bcPlugin.getExpireTime(customexpire);
            if ( expiretime === defaults.addcookie.customexpire ) {
                document.cookie = customcookie + ';';
            } else {
                document.cookie = customcookie + ';' + 'expires=' + expiretime + ';';
            }
        },
        removeCookie: function(cookiename) {
            var d = new Date();
            d.setTime(d.getTime() -1);
            var expires = "expires=" + d.toGMTString();
            document.cookie = cookiename + '=' + ';' + expires + ';'
        },
        getExpireTime: function(str) {
            // The following is the accepted formats:
            // 1. interval: 7years,6months,5days,4hours,3mins,2secs
            // 2. date: 2015-1-23 20:45:36
            var timeidx = ['years', 'months', 'days', 'hours', 'mins','secs'];
            var t = new Date();
            for (var i=0; i<timeidx.length; i++) {
                var end = str.indexOf(timeidx[i]);
                if ( end > -1 ) {
                    var interval = parseInt(str.substr(0,end));
                    if ( isNaN(interval) ) {
                        return defaults.addcookie.customexpire;
                    }
                    t.setDate( t.getDate() );
                    if (timeidx[i] === 'years') {
                        t.setFullYear(t.getFullYear() + interval);

                    } else if (timeidx[i] === 'months') {
                        t.setMonth(t.getMonth() + interval);

                    } else if (timeidx[i] === 'days') {
                        t.setDate(t.getDate() + interval);

                    } else if (timeidx[i] === 'hours') {
                        t.setHours(t.getHours() + interval);

                    } else if (timeidx[i] === 'mins') {
                        t.setMinutes(t.getMinutes() + interval);

                    } else if (timeidx[i] === 'secs') {
                        t.setSeconds(t.getSeconds() + interval);
                    }
                    return t.toGMTString();
                }
            }
            t = new Date(str);
            if (  t !== 'Invalid Date' ) {
                return t.toGMTString();
            }
            return defaults.addcookie.customexpire;
        },
        showUpgradeMsg: function(browser, verreq, link) {
            $('body').find('._bg').show();
            $('body').append('<div ev-class="dialog-browser-update"><div ev-class="dialog-top">貼心提醒,<br>請將您的瀏覽器升級至<br>' + browser + ' ' + verreq + ' 以上版本,<br>以取得最佳瀏覽體驗。</div><div ev-class="dialog-bottom"><a ev-class="continue" href=' + link + ' target="_blank">前往下載最新版</a><a ev-class="continue">繼續瀏覽</a></div></div>');
            $('[ev-class="dialog-browser-update"]').css({
                'width':'300px',
                'position':'fixed',
                'left':'50%',
                'top':'5%',
                'margin-left':'-150px',
                'background-color':'#5b5b5b',
                'padding':'10px',
                'line-height':'1.8',
                'z-index':'999'
            });
            $('[ev-class="dialog-browser-update"]').find('[ev-class="dialog-top"]').css({
                'background-color':'#e0e0e0',
                'padding':'20px',
                'color':'#000'
            });
            $('[ev-class="dialog-browser-update"]').find('[ev-class="dialog-bottom"]').css({
                'text-align':'center'
            });
            $('[ev-class="dialog-browser-update"]').find('[ev-class="continue"]').css({
                'cursor':'pointer',
                'display': 'inline-block',
                'width':'135px',
                'margin':'10px 5px 0 5px',
                'background-color':'#3cc',
                'color':'#fff',
                'text-decoration': 'none'
            });
            $('[ev-class="dialog-browser-update"]').find('[ev-class="continue"]').on('click', function(){
                $('body').find('._bg').hide();
                $('[ev-class="dialog-browser-update"]').remove();
            });
        },
        getMinVerSetting: function() {
            return doubleCheck.verReq[$.bcPlugin.getBrowser()];
        }
    };
})(jQuery);