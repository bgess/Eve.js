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
var _debugging = [], _debugAll = false, Eve

function slice() {
  var slice = Array.prototype.slice,
      arrayLike = arguments[0],
      args = slice.call(arguments, 1)

  return slice.apply(arrayLike, args)
}

function log() {
  var prefix = "",
      args = slice(arguments),
      messages = args.slice(0, -1),
      method = args.slice(-1)[0];
      console = window.console

  if (!args.length) { return }
  if (!console) { return }
  if (!console[method]) {
    prefix = "[" + method + "]"
    method = "log"
  }

  console[method].apply(console, messages)
}

function dbug(name, message) {
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
  log(name, message, "info")
}

function buildScope(obj) {
  var ns = obj.namespace
  return $.extend($(ns), obj, Eve._extensions)
}

function bindToScope(fun, obj, reg, name) {
  reg[name] = fun.apply(buildScope(obj))
}

//The primary Eve API.
window.Eve = Eve = {
  debug: function(moduleName) {
    if (moduleName) {
      _debugging.push(moduleName)
    } else {
      _debugAll = true
    }
    return this
  },

  undebug: function(moduleName) {
    var nameIndex
    if (moduleName) {
      nameIndex = _debugging.indexOf(moduleName)
      if (!!~nameIndex) { _debugging.splice(nameIndex, 1) }
    } else {
      _debugAll = false
    }
    return this
  },

  _extensions: {},
  extend: function(key, fun) {
    var k, hasOwn = Object.prototype.hasOwnProperty
    if (Object(key) === key) {
      for (k in key) if (hasOwn.call(key, k)) {
        Eve.extend(k, key[k])
      }
    } else {
      this._extensions[key] = fun
    }
    return this
  },

  _scopes: {},
  scope: function(ns, fun) {
    if (this._scopes[ns]) {
      log("Duplicate namespace: " + ns, "warn")
    }

    bindToScope(fun, {
      name: ns,
      namespace: ns
    }, this._scopes, ns)

    return this
  },

  _registry: {},
  register: function register(name, obj) {
    dbug(name, "registered")
    if (this._registry[name]) {
      throw new Error("Module already exists: " + name)
    }
    this._registry[name] = obj
    return this
  },

  _attachments: {},
  attach: function(moduleName, ns) {
    var args = slice(arguments),
        registry = this._registry,
        attachments = this._attachments,
        fun = function() {
          registry[moduleName].apply(this, args.slice(2))
        }

    dbug(moduleName, "attached to " + ns)
    //We're delegating off the window, so there's no need to reattach for
    //multiple instances of a single given module.
    if (attachments[moduleName + ns]) { return false }
    if (!registry[moduleName]) {
      return !!log("Module not found: " + moduleName, "warn")
    }

    bindToScope(fun, {
      name: moduleName,
      namespace: ns
    }, attachments, moduleName + ns)
    return true
  }
}

Eve.extend({
  listen: function(selector, event, handler) {
    var ns, scope

    if (!handler) {
      handler = event
      event = selector
      selector = ""
    }
    selector || (selector = "")

    // if this didn't mixin Scope
    if (this.namespace == null) {
      ns = selector
      scope = buildScope({name: ns, namespace: ns})
    } else {
      ns = this.namespace + ' ' + selector
      scope = this
    }

    scope.on(event, selector, function(event) {
      dbug(scope.name, ns + ':' + event)
      handler.call(scope, event)
    })

    return this
  },

  scope: function(ns, fun) {
    Eve.scope(this.namespace + ' ' + ns, fun)
    return this
  },

  attach: function(moduleName, ns) {
    return Eve.attach(moduleName, this.namespace + ' ' + (ns || ''))
  }
})

})()
