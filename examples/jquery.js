Eve.register('rot13', function(ns) {

  function rot13(e) {
    var el = $(e.currentTarget)
    el.text(el.text().replace(/[a-zA-Z]/g, function(c) {
      var charCode = (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
      return String.fromCharCode(charCode)
    }))

  }

  //debugger
  this.listen('ul li', 'mouseover', rot13).listen('ul li', 'mouseout', rot13)

}).register('active', function(ns) { 

  debugger
  this.listen('li', 'click', function(e) {
    this.find('.active').removeClass('active')
    this.find(e.currentTarget).addClass('active')
  })

}).scope('.other-module', function() {

  this.listen('ul', 'click', function(e) {
    console.log("Inner module click!")
  }).attach('rot13')

}).scope("#outer_scope", function() {

  this.scope('.inner_scope', function() {
    this.listen('a', 'click', function(e) {
      $(e.currentTarget).addClass('affected')
    }).scope('#another_scope', function() {
      this.listen('span', 'click', function(e) {
        $(e.currentTarget).addClass('affected')
      })
    })
  })

})

Eve.attach('active', '.list-module ul')
Eve.attach('rot13',  '.list-module')
