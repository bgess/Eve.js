(function() {
  
  // Event simulation code taken from:
  // http://stackoverflow.com/questions/6157929/#answer-6158050
  function simulate(element, eventName) {};
  
  test("Should allow for registering modules and attaching them to named scopes.", function() {
    
    //The test module is a rot-13 encoding module.
    var results = {
      'm1-1':"Yvax Bar",
      'm1-2':"Yvax Gjb",
      'm1-3':"Yvax Guerr",
      'm2-1':"Yvax Sbhe",
      'm2-2':"Yvax Svir",
      'm2-3':"Yvax Fvk"
    };
    
    var k,el,original;
    for (k in results) {
      el = document.getElementById(k);
      original = el.innerHTML;
      $(el).trigger('mouseover');
      ok(results[k]==el.innerHTML, "Change #"+k+" on hover.");
      $(el).trigger('mouseout');
      ok(original==el.innerHTML, "Restore #"+k+" on mouseout.");
    }
  
  });
  
  test("Should allow for passing options to attached modules", function() {
    
    var args;
    Eve.register("arg-test", function(a,b,c) {
      args = arguments;
    });
    
    Eve.attach('arg-test', '.foo', 'a', 'b', 'c');
    
    ok(args.length==3, "Three arguments passed.");
    ok(args[0]=='a', "First argument as expected.");
    ok(args[1]=='b', "Second argument as expected.");
    ok(args[2]=='c', "Third argument as expected.");
    
  });

  test("Debug method should be work", function() {
    var oldInfo = console.info, name, message

    Eve.debug()

    console.info = function(a1, a2) {
      name = a1
      message = a2
    }
    Eve.attach("active", ".list-module ul")

    Eve.undebug()

    console.info = oldInfo

    ok(name==="active     - ", "Dbug method moduleName argument recognized.")
    ok(message==="attached to .list-module ul", "Dbug method namespace argument recognized.")
  })

  test("Should scope .find to a CSS namespace.", function() {
    var oconsole = console.log, output;
    console.log = function(m) { output=m; }
    ('m3-ul', 'click');
    console.log = oconsole;
    ok(output=="Inner module click!", "Click event recognized.");
  });
  
  test(".find by itself should return the root parent namespace", function() {
    var result;
    Eve.scope('#m2', function() { result = this; });
    ok(result[0].getAttribute('id') == 'm2', "Found the expected element.");
    Eve.scope('.list-module', function() { result = this; });
    ok(result.length==2);
  });
  
  test("Should scope .attach to a CSS namespace.", function() {
    var results = {
      'm3-1':"Yvax Bar",
      'm3-2':"Yvax Gjb",
      'm3-3':"Yvax Guerr"
    };
    var k,el,original;
    for (k in results) {
      el = document.getElementById(k);
      original = el.innerHTML;
      $(el).trigger('mouseover');
      ok(results[k]==el.innerHTML, "Change #"+k+" on hover.");
      $(el).trigger('mouseout');
      ok(original==el.innerHTML, "Restore #"+k+" on mouseout.");
    }
  });
  
  test("Should scope module .find to child CSS namespace.", function() {
    var i,id,active;
    for (i=1; i<=3; i++) {
      id = 'm1-' + i
      $('#' + id).trigger('click');
      active = document.getElementById('m1').getElementsByClassName('active');
      ok(active.length==1, "Only one active child element.");
      ok(active[0].id == id, "Active element has the correct ID.");
    }
  });
  
  test("Should scope listener .find to event namespace.", function() {
    var el1 = $('#m1-1').trigger('click'),
        el2 = $('#m2-1').trigger('click');
    ok(el1.hasClass('active'), "Clicked module one element is active.");
    ok(el2.hasClass('active'), "Clicked module two element is active.");
    ok(el1.hasClass('active'), "Clicked module one element is still active.");
  });
  
  test("Should scope inner-scoped .scope to parent namespace", function() {
    var el1 = $('#inside-scope').trigger('click'),
        el2 = $('#out-of-scope').trigger('click');
    ok(el1.hasClass("affected"), "Inner-scoped element should be affected by nested scoping.");
    ok(!el2.hasClass("affected"), "Outer-scoped element should not be affected by nested scoping.");

    var el3 = $('#inside-recursive-scope').trigger('click'),
        el4 = $('#out-of-recursive-scope').trigger('click');
    ok(el3.hasClass("affected"), "Inner-scoped element should be affected by recursive scoping.")
    ok(!el4.hasClass("affected"), "Outer-scoped element should not be affected by recursive scoping.")

  });
  
  test("Should allow for extending Eve.js with additional scoped methods", function() {
    Eve.extend('handle', function(key, e, fun) {
      this.listen('[data-action='+key+']', e, fun);
    });
    Eve.scope('.extended-area', function() {
      this.handle('bing', 'click', function(e) {
        e.target.innerHTML = 'Bing';
        if (e.target.setHTML) e.target.setHTML('Bing');
      });
    });

    var bing  = $('#bing-target').trigger('click'), 
        bing2 = $('#bing-target2').trigger('click');

    ok(bing.html()  == 'Bing', 'Event handled correctly.');
    ok(bing2.html() == 'Ping', "Extended namespace doesn't leak past its namespace.");
    
  });
  
})();
