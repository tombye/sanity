/*
 * Sanity
 * 
 * Make user agent strings legible
 * Tom Byers | @tombyers
 * Format blatantly copied from @rooreynolds Jargone
 * 
 * [NB: sanity.js is built using build.sh. Expect changes here to be overwritten]
 */

(function () { 
window.sanity = window.sanity || {};

sanity.parse = function (agent_str) {
  var browserData,
      browser,
      details;

  browserData = (function (str) {
    var regexp,
        matches,
        strings = sanity.ua_strings,
        details = false;

    for (regexp in strings) {
      matches = str.match(strings[regexp]);
      if (matches !== null) {
        return {
          browser : regexp,
          info : matches
        };
      }
    }

    return false;
  }(agent_str));

  if (!browserData) { return false; }

  browser = browserData.browser;
  details = browserData.info;

  if (browser && (typeof sanity.getInfoFor[browser] !== 'undefined')) {
    return sanity.getInfoFor[browser](details);
  }

  // if at this point, fail
  return false;
};

sanity.getInfoFor = {
  'ie' : function (browser_details) {    
    var browser = 'ie',
        tokens = browser_details[1].split('; '),
        variant,
        token_type,
        match,
        result,
        results = {},
        idx,
        len;

    for (token_type in sanity.tokens[browser]) {
      for (variant in sanity.tokens[browser][token_type]) {
        for (idx = 0, len = tokens.length; idx < len; idx++) {
          // if variant includes variable version, capture
          if (variant instanceof RegExp) {
            match = tokens[idx].match(sanity.tokens[browser][token_type][variant]);
            result = variant.replace('%d', match[1]);
            results[token_type] = result;
          } else {
            if (tokens[idx] === sanity.tokens[browser][token_type][variant]) {
              results[token_type] = variant;
            }
          }
        }
      }
    }

    return (results === {}) ? results : false;
  }
};

sanity.ua_strings = {
  // IE9: /^Mozilla\/5\.0 \(compatible; MSIE 9\.0; Windows NT \d\.\d(.*); Trident\/5\.0(.*)\)$/,
  // IE8: /^Mozilla\/4\.0 \(compatible; MSIE 8\.0; Windows NT \d\.\d;(.*)? Trident\/4\.0(;)?(.*)\)$/
  ie: /^Mozilla\/\d\.\d \(compatible; ([^\)]+)\)$/,

  // Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6;en-US; rv:1.9.2.9) Gecko/20100824 Firefox/3.6.9
  // FF36: /^Mozilla\/5\.0 \((Windows|Macintosh); U;(.*)rv\:1\.9\.2.(\d{1,2})\)( Gecko\/(\d{8}))? Firefox\/3\.6(\.\d{1,2})?( \(.+\))?$/,

  // Chrome 16-23
  chrome: /^Mozilla\/5\.0 \((Windows NT|Macintosh)(;)?( .*)\) AppleWebKit\/53\d\.\d{1,2} \(KHTML, like Gecko\) Chrome\/(16|17|18|19|20|21|22|23)\.0\.\d{3,4}\.\d{1,2} Safari\/53\d\.\d{1,2}$/,

  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:16.0) Gecko/20100101 Firefox/16.0
  firefox: /^Mozilla\/5\.0 \((Windows NT \d\.\d|Macintosh); (.*)rv\:(9|10|11|12|13|14|15|16)\.0(\.\d{1,2})?\) Gecko\/\d{8} Firefox\/(9|10|11|12|13|14|15|16)\.0(\.\d{1,2})?$/,

  // 
  safari: /^Mozilla\/5\.0 \((Windows NT \d\.\d|Macintosh)(.*)\) AppleWebKit\/534\.\d{2}(\.\d{1,2})? \(KHTML, like Gecko\) Version\/5\.1\.\d Safari\/534\.\d{2}(\.\d{1,2})?$/
};

sanity.tokens = {};
sanity.tokens.windows = {
  platform : {
    'Windows 8' : 'Windows NT 6.2',
    'Windows 7' : 'Windows NT 6.1',
    'Windows Vista' : 'Windows NT 6.0',
    'Windows Server 2003; Windows XP x64 Edition' : 'Windows NT 5.2',
    'Windows XP' : 'Windows NT 5.1',
    'Windows 2000, Service Pack 1 (SP1)' : 'Windows NT 5.01',
    'Windows 2000' : 'Windows NT 5.0',
    'Windows NT 4.0' : 'Microsoft Windows NT 4.0',
    'Windows 98; Win' : '9x 4.90 Windows Millennium Edition (Windows Me)',
    'Windows 98' : 'Windows 98',
    'Windows 95' : 'Windows 95',
    'Windows CE' : 'Windows CE'
  },
  feature : {
    '.NET Framework common language run time, followed by the version number.' : '.NET CLR',
    'Internet Explorer 6 with enhanced security features (Windows XP SP2 and Windows Server 2003 only).' : 'SV1',
    'Tablet services are installed; number indicates the version number.' : 'Tablet PC',
    'System has a 64-bit processor (Intel).' : 'Win64; IA64',
    'System has a 64-bit processor (AMD).' : 'Win64; x64',
    'A 32-bit version of Internet Explorer is running on a 64-bit processor.' : 'WOW64'
  }
};
sanity.tokens.ie = {
  version : {
    'Internet Explorer 10' : 'MSIE 10.0',
    'Internet Explorer 9' : 'MSIE 9.0',
    'Internet Explorer 8 or IE8 Compatibility View/Browser Mode' : 'MSIE 8.0',
    'Windows Internet Explorer 7 or IE7 Compatibility View/Browser Mode' : 'MSIE 7.0',
    'Microsoft Internet Explorer 6' : 'MSIE 6.0',
  },
  // When in compatibility mode, the reported version is the one being mimic'ed. In these cases, the actually browser version is stored in the Trident token
  trident : {
    'Internet Explorer 10' : 'Trident/6.0',
    'Internet Explorer 9' : 'Trident/5.0',
    'Internet Explorer 8' : 'Trident/4.0'
  },
  addons : {
     'Google tool bar, version %d' : /GTB([\d\.]+)/
  }
};
sanity.parse(document.getElementsByTagName('pre')[0].innerText);
})();
