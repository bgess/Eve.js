# jQuery.Eve.js

<!--[![Build Status](https://secure.travis-ci.org/Yuffster/Eve.js.png)](http://travis-ci.org/Yuffster/Eve.js)-->

A &lt;3kb JavaScript file forked from [Eve.js](http://evejs.com) providing three simple methods to organize code into CSS namespaces which magically restrict code to the current context, allowing for dramatic reductions to code size and development time. 

## Dependencies

jQuery.Eve.js is a metaframework, it works on top of [jQuery](http://jquery.com)

## Installation

```html
<script src="../path/to/jquery.js" type="text/javascript"></script>
<script src="../path/to/eve.js" type="text/javascript"></script>
```

## Running the Unit Tests

open `tests/run_tests.html` in browser, or run `npm install` then `make test`

## Three Simple Methods

The vast majority of the power of Eve.js can be unlocked by chaining together three simple methods: scope, find, and listen:

```javascript
//Everything within this function will automatically be scoped
//to the .slideshow parent namespace.
Eve.scope('.slideshow', function() {

  //This will listen for clicks on any element on the page
  //matching the CSS selector ".slideshow .advance"
  this.on('click', '.advance', function(e) {

    //.find will only return elements matching '.current'
    //within the parent .slideshow element which was
    //clicked on.
    this.find('.current')
      .removeClass('.current')
      .next()
      .addClass('current');

  });

  //Scope methods are recursive, which means you can create a
  //scope inside of a parent scope.
  this.scope('.controls', function() {

    //This will look for any click events on the page matching
    //".slideshow .controls .hide_controls".
    this.on('click', '.hide_controls', function() {

      //.find with no arguments will return the parent
      //namespace, in this case the .controls parent
      //of the .hide_controls element that was clicked on.
      this.addClass('hidden');

    });

  });

});
```

## Reusable Modules

Additionally, you can create reusable modules which can then be attached to several CSS namespaces at once, providing for powerful and adaptive code reuse.

```javascript
//In this case, the first argument isn't a CSS namespace, but
//the name others will use to refer to this module in the future.
Eve.register('jimsSlideshow', function() {

  //This will look for anything matching attached namespaces,
  //although we don't know what those namespaces will be yet.
  this.on('click', '.advance', function(e) {

    this.find('.current')
      .removeClass('.current')
      .next()
      .addClass('current');

  });

});

//this.on('.advance') above will now match the CSS selector
//".main-image-feature .advance"
Eve.attach('jimsSlideshow', '.main-image-feature');

//Now, a second module will start listening to clicks on
//elements matching '#sidebar-slideshow .advance'.
Eve.attach('jimsSlideshow', '#sidebar-slideshow');
```

## Extending Eve

Oh no! Our boss just told us that we can't use CSS classes or IDs for JavaScript functionality anymore!

Now everywhere we would normally look for something like .advance, we have to type `[data-action=advance]`! What a bummer!

No problem, let's just extend Eve to do it for us:

```javascript
//Attach a new .handle method to the Scope object,
//so that it will be available within any Eve.js scope.
Eve.extend('handle', function(action,evt,fun) {

  this.listen("[data-action="+action+"]", evt, fun);
  
});

Eve.scope('.slideshow', function() {

  //Now we can use the handle method below instead of typing out
  //this.listen("[data-action=advance]", 'click', function);
  this.handle('advance', 'click', function(e) {
  
    this.find('.current')
      .removeClass('.current')
      .getNext().addClass('current');
      
  });
  
});
```

## Attach Scopes to Dynamically Inserted Content

Eve.js automatically adjusts to changing DOM structures, meaning you can scope things before they even exist.

Eve makes it so easy to handle changes to the content of your page that the code example to do so is exactly zero lines:

    //This code example intentionally left blank.

## Automatic Debugging

Ever spelunk through thousands of lines of code to find the line responsible for some weird bug?

With Eve.debug, you can automatically log any event as it's triggered along with the module responsible.

```javascript
//Now click on things and watch the console!
Eve.debug();

//You can also debug just specific namespaces.
Eve.debug('.slideshow');

//Or modules.
Eve.debug('jimsSlideshow');
```

<!--[Complete API Documentation](http://github.com/Yuffster/Eve.js/blob/master/docs/API_Documentation.md)-->
