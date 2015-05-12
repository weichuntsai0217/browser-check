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
    var agt = navigator.userAgent.toLowerCase();//alert(agt);
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
            alert(min);
            alert($.bcPlugin.compareVersion(version, verreq, min));
            if ( $.bcPlugin.compareVersion(version, verreq, min) ) {
                if ( !$.bcPlugin.checkCookie( settings.addcookie.customcookie ) ) {
                    $.bcPlugin.setCookie( settings.addcookie.customcookie );
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
            if ( customexpire === 'browserclose' ) {
                document.cookie = customcookie + ';';
            } else {
                var expiretime = $.bcPlugin.getExpireTime(customexpire);
                if ( expiretime.indexOf('unknown') > -1 ) {
                    document.cookie = customcookie + ';';  // custom expire fail, follow default setting
                    return;
                }
                document.cookie = customcookie + ';' + 'expires=' + expiretime + ';';
            }
        },
        getExpireTime: function(str) {
            // The following is the accepted formats:
            // 1. interval: 7years,6months,5days,4hours,3mins,2secs
            // 2. date: 2015-1-23 20:45:36
            var timeidx = ['years', 'months', 'days', 'hours', 'mins','secs'];
            if ( str.indexOf('unknown') > -1 ) {
                // input string contains keyword: 'unknown', exit
                return 'unknown';
            } else if (( str.indexOf('interval: ') > -1 ) && ( str.indexOf('date: ') > -1 )) {
                // cannot set interval and date at the same time
                return 'unknow';
            } else if (( str.indexOf('interval: ') === -1 ) && ( str.indexOf('date: ') === -1 )) {
                // input string without any keyword, exit
                return 'unknow';
            } else if ( str.indexOf('interval: ') > -1 ) {
                var pattern = /^interval: /;
                if ( pattern.test(str) ) {
                    // if ( (str.match(/interval: /g) || []).length > 1 ) {
                    //     return 'unknown';
                    // }
                    // str = str.replace('interval: ','');
                    // if ( str.indexOf(',') === -1 ) {
                    //     var count = [];
                    //     for (var i=0; i < timeidx.length; i++) {
                    //         var re = new RegExp(timeidx[i],'g');
                    //         count[i] = (str.match(re) || []).length;
                    //     }
                    //     var total = count.reduce(function(a, b) {
                    //         return a + b;
                    //     });
                    //     if ( total !== 1 ) {
                    //         return 'unknown';
                    //     }
                    //     // tmp = str.replace('int').replace().replace().replace();
                    // } else {

                    // }
                } else {
                    return 'unknown';
                }
            } else if ( str.indexOf('date: ') > -1 ) {
                var pattern = /^date: /;
                if ( pattern.test(str) ) {
                } else {
                    return 'unknown';
                }
            }

            return 'interval: ' + '';
            return 'date: ' + '';
            // If you want to expire cookie by controling time:
            // Control time to expire cookie start
            // var interval = 7200; // in seconds
            // var  t = new Date();
            // t.setDate( t.getDate() );
            // t.setSeconds(t.getSeconds()+interval);
            // expiretime = t.toGMTString();
            // document.cookie = 'browseralert=noalert; expires='+expiretime+';';
            // Control time to expire cookie end
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
        }
    };
})(jQuery);