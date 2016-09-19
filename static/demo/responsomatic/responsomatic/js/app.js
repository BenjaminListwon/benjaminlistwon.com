/**
 * Basic DOM and JS as seen on the wonderful resource
 * http://youmightnotneedjquery.com
 *
 * Allows for offline work, with no huge JS lib
 */

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState != 'loading') {
                fn();
            }
        });
    }
}

function forEachElement(selector, fn) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        fn(elements[i], i);
    }
}

function addEventListener(el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler, true);
    } else {
        el.attachEvent('on' + eventName, function(){
            handler.call(el);
        });
    }
}

function removeEventListener(el, eventName, handler) {
    if (el.removeEventListener) {
        el.removeEventListener(eventName, handler);
    } else {
        el.detachEvent('on' + eventName, handler);
    }
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

function toggleClass(el, className) {
    if (el.classList) {
        el.classList.toggle(className);
    } else {
        var classes = el.className.split(' ');
        var existingIndex = -1;
        for (var i = classes.length; i--;) {
            if (classes[i] === className) {
                existingIndex = i;
            }
        }
        if (existingIndex >= 0) {
            classes.splice(existingIndex, 1);
        } else {
            classes.push(className);
        }
        el.className = classes.join(' ');
    }
}

/**
 * Cookie functions so we can store the URL, etc
 *
 * See -> http://www.w3schools.com/js/js_cookies.asp
 */

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function isSet(val) {
    if (val !== undefined && val != null && val != '' && val != 'undefined') {
        return true;
    }
    return false;
}


/**
 * The "app" code
 */

var DEFAULT_URL = 'sample.html';
var URL_COOKIE = 'romurllist';
var URL_COOKIE_DAYS = 10;
var URL_DELIMITER = '||';

function routeIframes(url) {
    var toLoad = DEFAULT_URL;
    var history = readHistory();
    var iframes = document.querySelectorAll('iframe');

    document.getElementById('whatUrl').blur();

    if (isSet(url)) {
        toLoad = url;
    } else if (isSet(history) && history.length) {
        toLoad = history[0];
    }

    writeHistory(toLoad);

    document.getElementById('whatUrl').value = toLoad;

    for (var i = 0; i < iframes.length; i++) {
        iframes[i].src = toLoad + "?v=" + new Date().getTime();
    }
}

function rotateDevice(el) {
    toggleClass(el.parentNode, 'landscape');
}

function bindHomeButtons() {
    forEachElement('div.home', function(el, idx) {
        addEventListener(el, 'click', function(e) { rotateDevice(e.target); } );
    });
}

function writeHistory(url) {
    if (isSet(url)) {
        var history = readHistory();

        if (isSet(history) && history.length) {
            var existsPos = history.indexOf(url);

            if (existsPos >= 0) {
                url = history.splice(existsPos, 1);
            }
        }

        history.unshift(url);
        history = history.slice(0,10);
        var out = history.join(URL_DELIMITER);
        setCookie(URL_COOKIE, out, URL_COOKIE_DAYS);
    }
}

function readHistory() {
    var cookieVal = getCookie(URL_COOKIE);
    if (cookieVal == "") {
        return [];
    }
    return cookieVal.split(URL_DELIMITER);
}

function menuClickHandler(e) {
    e.stopPropagation();
    routeIframes(e.target.textContent || e.target.innerText);
}

function showMenu() {
    var toolbar = document.getElementById('appToolbar');
    var input = document.getElementById('whatUrl');
    var menu = document.getElementById('urlMenu');
    var history = readHistory();

    if (history && history.length) {
        while (menu.firstChild) {
            removeEventListener(menu.firstChild, 'click', menuClickHandler);
            menu.removeChild(menu.firstChild); 
        }
        for (var i=0; i<history.length; i++) {
            var li = document.createElement('li');
            if (li.textContent !== undefined) {
                li.textContent = history[i];
            } else {
                li.innerText = history[i];
            }
            menu.appendChild(li);
            addEventListener(li, 'click', menuClickHandler);
        }
        menu.style.display = 'block';
        menu.style.top = "calc(3rem + " + document.body.scrollTop + "px)";
        menu.style.left = input.offsetLeft + "px";
    }
}


function hideMenu() {
    window.setTimeout(function() {
        var menu = document.getElementById('urlMenu');
        menu.style.display = 'none';
    }, 100);
}


function bindUrlActions() {
    addEventListener(document.getElementById('whatUrl'), 'change', function(e) { routeIframes(e.target.value); } );
    addEventListener(document.getElementById('whatUrl'), 'focus', function(e) { showMenu(); } );
    addEventListener(document.getElementById('whatUrl'), 'blur', function(e) { hideMenu(); } );
    addEventListener(document.getElementById('goGurt'), 'click', function(e) { routeIframes(document.getElementById('whatUrl').value); } );

    window.onresize = function(e) { document.getElementById('whatUrl').blur(); };
    window.onscroll = function(e) { document.getElementById('whatUrl').blur(); };
}


ready(function() {
    routeIframes();
    bindUrlActions();
    bindHomeButtons();
});
