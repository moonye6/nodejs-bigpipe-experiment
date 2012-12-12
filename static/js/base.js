define('base.js', function (require, exports, module) {
  require('jade')
  window.$ = document.querySelectorAll.bind(document)
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelectorAll
  exports.ajaxtemp = function (selector, tempname, obj) {
    require.async('jade/' + tempname, function (temp) {
      var elem = $(selector)[0]
      if (elem) elem.innerHTML = temp(obj || {})
    })
  }
  exports.pipetemp = function (selector, content) {
    var elem = $(selector)[0]
    if (!elem) return
    content = content.replace(/<script([^>]*)>([\s\S]*?)<\\?\/script>/gi, function (script, attrs, inner) {
      var s = document.createElement('script')
      attrs = attrs || ''
      inner = inner || ''
      var matched
      attrs.replace(/src=(['"]?)([^'"\s]+)\1/i, function (all, p1, p2) {
        s.src = p2
        return ''
      })
      if (s.src) {
        matched = attrs.match(/defer/i)
        if (matched) s.defer = true
        matched = attrs.match(/async/i)
        if (matched) s.async = true
      } else {
        s.appendChild(document.createTextNode(inner))
      }
      head = $('head')[0] || document.documentElement
      head.appendChild(s)
      return ''
    })
    elem.innerHTML = content
  }
})
