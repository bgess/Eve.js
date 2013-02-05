describe "Eve.js", ->
  it "Should allow for registering modules and attaching them to named scopes.", ->
    # The test module is a rot-13 encoding module.
    results =
      'm1-1':"Yvax Bar",
      'm1-2':"Yvax Gjb",
      'm1-3':"Yvax Guerr",
      'm2-1':"Yvax Sbhe",
      'm2-2':"Yvax Svir",
      'm2-3':"Yvax Fvk"

    for k of results
      el = document.getElementById k
      original = el.innerHTML
      $(el).trigger "mouseover"
      results[k].should.eq el.innerHTML
      $(el).trigger "mouseout"
      original.should.eq el.innerHTML

  it "Should allow for passing options to attached modules", ->
    argsSpy = sinon.spy()
    Eve.register "arg-test", argsSpy
    Eve.attach 'arg-test', '.foo', 'a', 'b', 'c'
    argsSpy.calledWith('a', 'b', 'c').should.be.true

  it "Should scope .find to a CSS namespace.", ->
    oconsole = console.log
    consoleSpy = sinon.spy()
    console.log = consoleSpy
    $('#m3-ul').trigger 'click'
    console.log = oconsole
    consoleSpy.calledWith("Inner module click!").should.be.true

  it ".find by itself should return the root parent namespace", ->
    result = null

    Eve.scope '#m2', -> result = this
    result[0].getAttribute('id').should.eq 'm2'

    Eve.scope '.list-module', ->
      result = this
      result = result.getDOMNodes() if result.getDOMNodes
    result.length.should.eq 2

  it ".first should return the first of matching items", ->
    Eve.scope '#click-me', ->
      @on 'click', 'a', (e) -> @first('a').html 'clicked'

    el = $('#click-me-a').trigger('click')[0]
    el.innerHTML.should.eq 'clicked'

    Eve.scope '#els-list', ->
      @first('span')[0].className = 'clicked-first'

    el = $('#first')[0]
    el.className.should.eq 'clicked-first'

  it  "Should scope .attach to a CSS namespace.", ->
    results =
      'm3-1':"Yvax Bar",
      'm3-2':"Yvax Gjb",
      'm3-3':"Yvax Guerr"

    for k of results
      el = document.getElementById(k)
      original = el.innerHTML
      $(el).trigger 'mouseover'
      results[k].should.eq el.innerHTML
      $(el).trigger 'mouseout'
      original.should.eq el.innerHTML

  it "Should scope module .find to child CSS namespace.", ->
    for i in [1..3]
      id = 'm1-' + i
      $("#" + id).trigger 'click'
      active = $('#m1 .active')
      active.length.should.eq 1
      active[0].id.should.eq id

  it "Should scope listener .find to event namespace.", ->
    el1 = $('#m1-1').trigger('click')[0]
    el2 = $('#m2-1').trigger('click')[0]
    el1.className.should.eq 'active'
    el2.className.should.eq 'active'
    el1.className.should.eq 'active'

  it "Should scope inner-scoped .scope to parent namespace", ->
    el1 = $('#inside-scope').trigger('click')[0]
    el2 = $('#out-of-scope').trigger('click')[0]
    el1.className.should.eq "affected"
    el2.className.should.not.eq "affected"
    
    el3 = $('#inside-recursive-scope').trigger('click')[0]
    el4 = $('#out-of-recursive-scope').trigger('click')[0]
    el3.className.should.eq "affected"
    el4.className.should.not.eq "affected"

  it "Should allow for extending Eve.js with additional scoped methods", ->
    Eve.extend 'handle', (key, e, fun) ->
      @on e, "[data-action=#{key}]", fun

    Eve.scope '.extended-area', ->
      @handle 'bing', 'click', (e) ->
        e.target.innerHTML = 'Bing'
        e.target.setHTML('Bing') if e.target.setHTML

    bing  = $('#bing-target').trigger('click')[0]
    bing2 = $('#bing-target2').trigger('click')[0]

    bing.innerHTML.should.eq 'Bing'
    bing2.innerHTML.should.eq 'Ping'
