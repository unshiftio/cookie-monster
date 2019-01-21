'use strict';

/**
 * Cookie creation interface.
 *
 * @param {Object} doc Reference to the document.
 * @returns {Object} Session storage inspired API.
 * @public
 */
module.exports = function bake(doc, options){
  //
  // We want to provide a sane out of the box DX, and the most common use
  // case would be loading cookies from the browser's `document.cookie`
  // location. So when no document is provided, we should attempt to
  // default to that without breaking any native environment.
  //
  if (!doc) {
    doc = 'undefined' !== typeof document && 'string' === typeof document.cookie
    ? document
    : {};
  }

  if (!options) options = {};
  if (typeof doc === 'string') doc = { cookie: doc };
  else if (typeof doc.cookie !== 'string') doc.cookie = '';

  /**
   * Regular Expression that is used to split cookies into individual items.
   *
   * @type {RegExp}
   * @private
   */
  var splitter = /;\s*/;

  /**
   * Read out all the cookies.
   *
   * @returns {Array}
   * @private
   */
  function read() {
    return options.read
    ? options.read()
    : doc.cookie.split(splitter);
  }

  /**
   * Write a new cookie.
   *
   * @param {String} cookie Cookie value.
   * @param {Object} meta Additional cookie information.
   * @returns {String}
   * @private
   */
  function write(cookie, meta) {
    return options.write
    ? options.write(cookie, meta)
    : (doc.cookie = cookie);
  }

  /**
   * Get the contents of a cookie.
   *
   * @param {String} key Name of the cookie we want to fetch.
   * @returns {String|Undefined} Result of the cookie or nothing.
   * @public
   */
  function getItem(key) {
    var cookies = read();

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var index = cookie.indexOf('=');
      var name = decodeURIComponent(cookie.slice(0, index));

      if (name === key) return decodeURIComponent(cookie.slice(index + 1));
    }
  }

  /**
   * Set a new cookie.
   *
   * @param {String} key Name of the cookie.
   * @param {String} value Data for the cookie.
   * @param {Object} opts Options for the cookie setting
   * @returns {String} Cookie.
   * @public
   */
  function setItem(key, value, opts) {
    if (typeof key !== 'string' || typeof value !== 'string') return false;
    if (!opts) opts = {};

    value = encodeURIComponent(value);
    key = encodeURIComponent(key);

    var cookie = key + '=' + value;

    if ('expires' in opts) cookie += '; expires=' + opts.expires;
    if ('path' in opts) cookie += '; path=' + opts.path;
    if ('domain' in opts) cookie += '; domain=' + opts.domain;
    if (opts.secure) cookie += '; secure';

    return write(cookie, {
      remove: false,
      value: value,
      opts: opts,
      key: key,
    });
  }

  /**
   * Remove a cookie.
   *
   * @param {String} key Name of the cookie.
   * @returns {Undefined} Void.
   * @public
   */
  function removeItem(key) {
    return write(key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;', {
      remove: true,
      value: '',
      opts: {},
      key: key
    });
  }

  /**
   * Clear all cookies.
   *
   * @returns {Undefined} Void.
   * @public
   */
  function clear() {
    var cookies = read();

    for (var i = 0; i < cookies.length; i++) {
      removeItem(decodeURIComponent(cookies[i].split('=')[0]));
    }
  }

  return {
    removeItem: removeItem,
    getItem: getItem,
    setItem: setItem,
    clear: clear
  };
};
