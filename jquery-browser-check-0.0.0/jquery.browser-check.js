/*!
 * jQuery Browser-Check Plugin v0.0.0
 *
 * Copyright (c) 2015 Jimmy Tsai
 */
(function($) {
  //browser version check algorithm:
    // check if user's browser is the latest:
    //    1. if yes, don't alert
    //    2. if no, check cookie:
    //        1. if cookie is empty, set cookie and alert
    //        2. if cookie is not empty, check if cookie is expired:
    //            1. if not expired, do nothing
    //            2. if expired, set cookie and alert
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
            'customcookie': 'browseralert=noalert;'
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
            // $( "#one" ).append( JSON.stringify( defaults ) );
            // $( "#two" ).append( JSON.stringify( settings ) );
            // alert('yo');alert(settings.verReq['chrome']);
            // alert(defaults.spr.chrome);
            var browser = $.bcPlugin.getBrowser();
            var version = $.bcPlugin.getVersion().split('.');
            var verreq = settings.verReq[browser].split('.');
            var min = Math.min(settings.verCpr[browser], ( verreq.length ) );
            if (version.length < min) {alert(123);return;}
            for( var i = 0; i < min; i++ ) {
                if ( parseInt( version[i] ) < parseInt( verreq[i] ) ) {
                    if ( !checkCookie( settings.addcookie.customcookie ) ) {
                        setCookie( settings.addcookie.customcookie );
                        showUpgradeMsg();
                    }
                    break;
                }
            }

            function checkCookie(customcookie) {
                if ( document.cookie && (document.cookie.indexOf(customcookie) != -1) ) {
                    return true;
                }
                return false;
            }
            function setCookie(customcookie) {
                // If you want to expire cookie by controling time:
                // Control time to expire cookie start
                // var interval = 7200; // in seconds
                // var  t = new Date();
                // t.setDate( t.getDate() );
                // t.setSeconds(t.getSeconds()+interval);
                // expiretime = t.toGMTString();
                // document.cookie = 'browseralert=noalert; expires='+expiretime+';';
                // Control time to expire cookie end

                // If you want to expire cookie by closing browser:
                // Close browser to expire cookie start:
                document.cookie = customcookie;
                // Close browser to expire cookie end:
            }
            function showUpgradeMsg() {
                $('body').find('._bg').show();
                $('body').append('<div ev-class="dialog-browser-update"><div ev-class="dialog-top">貼心提醒,<br>請將您的瀏覽器升級至<br>' + settings.showBrowser[browser] + ' ' + settings.verReq[browser] + ' 以上版本,<br>以取得最佳瀏覽體驗。</div><div ev-class="dialog-bottom"><a ev-class="continue" href=' + settings.link[browser] + ' target="_blank">前往下載最新版</a><a ev-class="continue">繼續瀏覽</a></div></div>');
                $('[ev-class="dialog-browser-update"]').css({
                    'width':'220px',
                    'position':'fixed',
                    'left':'50%',
                    'top':'5%',
                    'margin-left':'-120px',
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
                    'width':'100px',
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
        }
    };
})(jQuery);