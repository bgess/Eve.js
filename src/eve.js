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
      method = args.slice(-1)[0]

  if (!args.length) { return }
  if (!window.console) { return }
  if (!window.console[method]) {
    prefix = "[" + method + "]"
    method = "log"
  }

  window.console[method].apply(window.console, messages)
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

function bindToScope(fun, obj, reg, name) {
  for (var k in Scope) { obj[k] = Scope[k] }
  for (k in _extensions) { obj[k] = _extensions[k] }

  reg[name] = fun.apply(obj)
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
      throw new Error("Module already exists: "+name)
    }
    _registry[name] = obj
    return this
  },
  
  extend: function(key, fun) {
    _extensions[key] = fun
  },

  scope: function(ns, fun) {
    if (_scopes[ns]) {
      log("Duplicate namespace: " + ns, "warn")
    }
    bindToScope(fun, {
      name: ns,
      namespace: ns
    }, _scopes, ns)
  },

  attach: function(moduleName, namespace) {
    var fun, args = slice(arguments), i = 0
    fun = function() { _registry[moduleName].apply(this, args.slice(2)) }
    dbug(moduleName, "attached to " + namespace)
    //We're delegating off the window, so there's no need to reattach for
    //multiple instances of a single given module.
    if (_attachments[moduleName+namespace]) { return false }
    if (!_registry[moduleName]) {
      log("Module not found: " + moduleName, "warn")
      return false
    }
    var mod = bindToScope(fun, {
      namespace:namespace,
      name:moduleName
    }, _attachments, moduleName+namespace)
    return true
  }
}

var Scope = {
  listen: function(selector, event, handler) {
    //There's a special hell for putting optional parameters at the
    //beginning.  A special and awesome hell.
    if (!handler) {
      handler = event
      event = selector
      selector = ''
    }
    selector = selector || ''

    //If listen is happening in the context of a triggered event handler,
    //we only want to delegate to the current event namespace.
    var scope = (this.event) ? this.find() : document.body

    var name = this.name,
      sel = (this.namespace + ' ' + selector).trim(),
      obj = { }
      for (var k in this) if (this.hasOwnProperty(k)) { obj[k] = this[k] }
      function fun(e,t) {
        dbug(name, sel + ':' + event)
        obj.event = e
        e.target = e.currentTarget
        handler.apply(obj, arguments)
      }

    //JavaScript framework development is so much easier when you let some
    //other framework do most of the work.
    $(scope).delegate(sel, event, fun)
  },

  find: function(sel) {
    if (!sel || typeof(sel)=='string') { sel = (sel || '').trim() }
    //Scope to the particular instance of the DOM module active in this event.
    var ns = this.namespace,
        target = jQuery((this.event) ? this.event.target : document.body),
        scope  = (this.event) ? target.parents(ns) : target
    return (this.event) ? scope.find(sel) : scope.find(ns + ' ' + sel)
  },

  first: function(sel,result) {
    return ((arguments.length == 2) ? result : this.find(sel))[0]
  },

  //Yo dawg...
  scope: function(ns, fun) {
    Eve.scope(this.namespace + ' ' + ns, fun)
  },

  attach: function(moduleName, ns) {
    Eve.attach(moduleName, this.namespace + ' ' + (ns || ''))
  }
}

})()
