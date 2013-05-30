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

  if (browser) {
    return new sanity.Info(browser, details);
  }

  // if at this point, fail
  return false;
};

sanity.matchToken = function (str, tokens, token) {
  var match;
  // if variant includes variable version, capture
  if (token instanceof RegExp) {
    match = str.match(tokens[token]);
    result = token.replace('%d', match[1]);
    return result;
  } else {
    if (str === tokens[token]) {
      return token;
    }
  }

  return false;
};

sanity.Info = function (browser, details) {
  this.browser = browser;
  this.details = details[1].split('; '),
  this.getOSInfo();
  this.getBrowserInfo();
  this.postProcess();
};

sanity.Info.prototype.postProcess = function () {
  if (typeof sanity.vendorRules[this.browser] !== 'undefined') {
    sanity.vendorRules[this.browser].call(this);
  }
};

sanity.Info.prototype.checkDetails = function (obj, prop) {
  var idx,
      len,
      match;

  for (idx = 0, len = this.details.length; idx < len; idx++) {
    match = sanity.matchToken(this.details[idx], obj, prop)
    if (match) {
      return match;
    }
  }
  return false;
};

sanity.Info.prototype.getOSInfo = function () {
  var systems = sanity.tokens.os,
      system,
      make,
      platform_token,
      feature_tokens,
      feature_token,
      result = false,
      os;

  get_platform:
  for (make in systems) {
    system = systems[make];
    for (platform_token in system.platform) {
      if (this.checkDetails(system.platform, platform_token)) {
        os = make;
        result = { os : platform_token };
        break get_platform;
      }
    }
  }
  
  if (result !== false && (typeof systems[os].feature !== 'undefined')) {
    feature_tokens = systems[os].feature;
    for (feature_token in feature_tokens) {
      if (this.checkDetails(feature_tokens, feature_token)) {
        result.feature = feature_token;
      }
    }
  }

  this.osInfo = result;
};

sanity.Info.prototype.getBrowserInfo = function () {
  var browserTokens = sanity.tokens[this.browser],
      variant,
      token_type,
      results = {};

  for (token_type in browserTokens) {
    for (variant in browserTokens[token_type]) {
      if (this.checkDetails(browserTokens[token_type], variant)) {
        results[token_type] = variant;
      }
    }
  }

  this.browserInfo = (results === {}) ? false : results;
};

sanity.ua_strings = {
  // IE9: /^Mozilla\/5\.0 \(compatible; MSIE 9\.0; Windows NT \d\.\d(.*); Trident\/5\.0(.*)\)$/,
  // IE8: /^Mozilla\/4\.0 \(compatible; MSIE 8\.0; Windows NT \d\.\d;(.*)? Trident\/4\.0(;)?(.*)\)$/
  ie: /^Mozilla\/\d\.\d \(compatible; ([^\)]+)\)$/,

  // Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6;en-US; rv:1.9.2.9) Gecko/20100824 Firefox/3.6.9
  // FF36: /^Mozilla\/5\.0 \((Windows|Macintosh); U;(.*)rv\:1\.9\.2.(\d{1,2})\)( Gecko\/(\d{8}))? Firefox\/3\.6(\.\d{1,2})?( \(.+\))?$/,

  // Chrome 16-23
  chrome: /^Mozilla\/5\.0 \(([^\)]+)\) AppleWebKit\/53\d\.\d{1,2} \(KHTML, like Gecko\) Chrome\/[\d\.]+ Safari\/[\d\.]+$/,

  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:16.0) Gecko/20100101 Firefox/16.0
  firefox: /^Mozilla\/5\.0 \((Windows NT \d\.\d|Macintosh); (.*)rv\:(9|10|11|12|13|14|15|16)\.0(\.\d{1,2})?\) Gecko\/\d{8} Firefox\/(9|10|11|12|13|14|15|16)\.0(\.\d{1,2})?$/,

  // 
  safari: /^Mozilla\/5\.0 \((Windows NT \d\.\d|Macintosh)(.*)\) AppleWebKit\/534\.\d{2}(\.\d{1,2})? \(KHTML, like Gecko\) Version\/5\.1\.\d Safari\/534\.\d{2}(\.\d{1,2})?$/
};

sanity.vendorRules = {
  ie : function () {
    var info = this.browserInfo;
    if (info.version !== info.trident) {
      info.misc = 'Browser is in compatibility mode, set to ' + info.version;
      info.version = info.trident;
      delete info.trident;
    }
  }
};

sanity.tokens = {
  os : {}
};
sanity.tokens.os.macintosh = {
  platform : {
    'Macintosh OSX 10.6.8' : 'Intel Mac OS X 10_6_8'
  }
};
sanity.tokens.os.windows = {
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
