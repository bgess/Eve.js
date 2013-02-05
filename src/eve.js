/**
 * Eve.js <evejs.com> - v0.8.3 November 24, 2012
 *
 *     A JavaScript meta-framework for scoped event delegation.
 * 
 * Copyright (c) 2012 Michelle Steigerwalt, http://evejs.com/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {

var _registry = {}, _scopes = {}, _attachments = {}, _extensions = {},
    _debugging = [], _debugAll = false

function dbug(name, message, method) {
  if (!window.console) { return }
    var debug = _debugAll
    if (!_debugAll) {
      debug = false
      for (var i = 0; i < _debugging.length; i++) {
        if (_debugging[i] == name) { debug = true }
      }
    }
    if (!debug) { return }
    while (name.length < 10) { name += ' ' }
    name = name.substring(0, 10) + " - "
    window.console.info(name, message)
}

function log(message, method) {
  if (!window.console) { return }
  window.console[method || "log"](message)
}

function createScope(obj) {
  if (obj == null) { obj = {} }
  for (var k in Scope) { obj[k] = Scope[k] }
  for (k in _extensions) { obj[k] = _extensions[k] }
  return obj
}

function bindToScope(fn, obj, reg, name) {
  reg[name] = fn.apply(createScope(obj))
}

//The primary Eve API.
window.Eve = {
  debug: function(moduleName) {
    if (moduleName) {
      _debugging.push(moduleName)
    } else {
      _debugAll = true
    }
  },

  register: function(name, obj) {
    dbug(name, "registered")
    if (_registry[name]) {
      throw new Error("Module already exists: " + name)
    }
    _registry[name] = obj
    return this
  },

  extend: function(key, fn) {
    _extensions[key] = fn
  },

  scope: function(ns, fn) {
    var elem

    if (_scopes[ns]) {
      log("Duplicate namespace: " + ns, "warn")
    }

    elem = $.extend($(ns), {
      name: ns,
      namespace: ns
    })

    bindToScope(fn, elem, _scopes, ns)
  },

  attach: function(moduleName, ns) {
    var fn, elem, args = Array.prototype.slice.call(arguments)
    fn = function() { _registry[moduleName].apply(this, args.slice(2)) }
    dbug(moduleName, "attached to " + ns)
    //We're delegating off the window, so there's no need to reattach for
    //multiple instances of a single given module.
    if (_attachments[moduleName + ns]) {
      return false
    }
    if (!_registry[moduleName]) {
      log("Module not found: " + moduleName, "warn")
      return false
    }

    elem = $.extend($(ns), {
      name: moduleName,
      namespace: ns
    })

    bindToScope(fn, elem, _attachments, moduleName + ns)

    return true
  }

};

var Scope = {
  scope: function(ns, fn) {
    Eve.scope(this.namespace + ' ' + ns, fn);
  },

  attach: function(moduleName, ns) {
    Eve.attach(moduleName, this.namespace + ' ' + (ns || ''));
  },

  find: function() {
    if (!arguments.length) { return this }
    return jQuery.fn.find.apply(this, arguments)
  },

  on: function(events, selector, data, fn) {
    var self = this
    if (data == null && fn == null) {
      // ( types, fn )
      fn = selector
      data = selector = undefined
    } else if (fn == null) {
      if (typeof selector === "string") {
        // ( types, selector, fn )
        fn = data
        data = undefined
      } else {
        // ( types, data, fn )
        fn = data
        data = selector
        selector = undefined
      }
    }
    jQuery.fn.on.call(self, events, selector, data, function (event) {
      fn.call(createScope($(event.target).parents(self.namespace)), event)
    })
  },

  first: function(sel) {
    return this.find(sel).eq(0)
  }
};

})();
