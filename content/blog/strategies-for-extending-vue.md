+++
author = ""
categories = []
date = "2016-11-04T10:00:00-07:00"
description = "Vue provides several mechanisms for extending its functionality. Here's a quick compariosn of the most common techniques."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Strategies for extending Vue"
type = "post"
tags = ["javascript", "Vue", "mixins", "plugins", "extend"]

+++

A few weeks back, someone reached out over email with a question about how to add support for capturing mouse events that took place within the bounds of a Vue component. Off the top of my head I could think of  couple ways to do it, but none of them were very sustainable or extensible. 

So I did the only thing I know to do in such a situation; I whipped up some code and compared the different ways of achieving the same goals in Vue.

## The goal
For the demos, we’re going to use [this module](https://github.com/Rapid-Application-Development-JS/Pointer) to add support for [W3C pointer events](https://www.w3.org/TR/pointerevents/#pointerevent-interface). Our goal is to compare how Vue’s different extension mechanisms—mixins, Vue.extend and plugins—stack up against each other when we integrate, and use, the pointer events module. 

We’ll be implementing exactly the same functionality each time; create an instance of `PointerTracker` and bind a handler for the `pointermove` event to our template. You’ll want to keep an eye on the reusability, extensibility and legibility of each solution as we go, so you can find an option with the right balance for your use case.

Here’s what each demo is about:

- [Demo 1 - Basic](/demo/vueextend/pointer-01-basic.html) simply implements the pointer tracking directly in our component, as a baseline.
- [Demo 2 - Mixin](/demo/vueextend/pointer-02-mixin.html) uses a mixin to do the same.
- [Demo 3 - Extend](/demo/vueextend/pointer-03-extension.html) uses component extension to inherit our functionality.
- [Demo 4 - Plugin](/demo/vueextend/pointer-04-plugin.html) extracts the functionality to an external file, making it available as a custom directive.
- [Demo 5 - Bonus](/demo/vueextend/pointer-05-bonus.html) shows off a lot more of what can be done with our plugin / custom directive combo.

Before we begin, go grab the [code from the repo](https://github.com/BenjaminListwon/vue-extension-demos) if you want to follow along. It’s all commented so you can read through each file at your own pace. If you want to see what changes, simply search for the string “CHANGE” and you should be able to cycle through each change. Hint: There’s only two or three changes in each demo file.

Okay, let’s dig in by looking at the foundation of our demo files first. 

## The app template

Before we get into the moving parts of our application, let’s take a quick look at the markup we use to define the overall structure of the demo.

  <div id="app" class="row">
    <div class="col">
      <pointer-demo></pointer-demo>
    </div>
    <div class="col">
      <pointer-demo></pointer-demo>
    </div>
  </div>

The main `div` element acts as a wrapper for a two-column layout. In each column we have a single instance of `pointer-demo`, each of which acts as a wrapper for a canvas where we will track pointer events and an output element where we’ll log those pointer events. We want (at least) two instances so we can test the reusability of our components and be sure they act independently.

We wrap those child components in `pointer-demo` so that they can share a single event log, while also keeping that even log private to each instance. This avoids global collision of events from each event source, and it avoids making the sibling components dependent on each other for data. We’ll see more on this as we dive in.

## Using  x-templates
We don’t make much change to our templates (in fact, only a single change in Demo 4), so it will help to keep our template code out of the way of our component code. For this, we make use of  [x-templates](http://vuejs.org/guide/components.html#X-Templates).

All this means is that we put our template HTML into a script tag with the type `text/x-template`, and give it an id. Then our component looks up the template using its id, in the same capacity as if we’d defined it right in side our component.

#### pointer-canvas-template
This is the template that provides a div that will act as a canvas for our pointer events.  We attach our demo handle the same way we’d attach any other native event, with an event binding `@pointermove="handlePointerMove"`.

    <script type="text/x-template" id="pointer-canvas-template">
        <div class="event-source" @pointermove="handlePointerMove">
          <p>Click and drag in here.</p>
        </div>
    </script>

#### pointer-log-template
This template is just a container for an unordered list. That list is bound to `eventLog`, so whenever we receive events from our canvas template, they will get listed here.

    <script type="text/x-template" id="pointer-log-template">
      <div class="event-log">
        <ul>
          <li v-for="event in eventLog">{{ event }}</li>
        </ul>
      </div>
    </script>

#### pointer-demo-template
This is the parent template. It simply includes the two child components we defined above.

    <script type="text/x-template" id="pointer-demo-template">
      <div>
        <pointer-canvas></pointer-canvas>
        <pointer-log></pointer-log>
      </div>
    </script>

## The component definitions
With the templates out of the way, let’s get a look at our component code. Each component is pretty much concerned with one very specific task, so they should read pretty easily.

#### PointerCanvas
`PointerCanvas` is the most populated of our component definitions, and it is also the only one where we will make changes.  

    var PointerCanvas = Vue.extend({
      template: '#pointer-canvas-template',
      data: function() {
        return {
          pointerInstance: null
        }
      },
      mounted: function() {
        this.pointerInstance = new PointerTracker(this.$el);
      },
      beforeDestroy: function() {
        this.pointerInstance = null;
      },
      methods: {
        handlePointerMove: function (ev) {
          this.$parent.$data.eventLog.push(ev);
        }
      }
    });

Here’s what’s going on:

- `template` is the selector used to match up with our `x-template` definition.
- `data` contains a reference to the PointerTracker instance
- `mounted` and `beforeDestroy` are the two things we’ll be reimplementing in different ways. The two lifecycle functions create and destroy our PointerInstance code respectively.
- `methods` contains our single event handler. It receives the event object (`ev`) and pushes that onto our parent’s `eventLog` array, which we cover in detail below.

Going forward, you can safely ignore the `template` and `methods` values as they will remain unchanged through to our plugin implementation in Demo 4.

#### PointerLog
By contrast `PointerLog` is very simple. It contains its template selector, and a single computed property, `eventLog` which is by the loop in our template. That property simply returns the parent’s eventLog.

    var PointerLog = Vue.extend({
      template: '#pointer-log-template',
      computed: {
        eventLog: function() {
          return this.$parent.$data.eventLog;
        }
      }
    });

#### pointer-demo
The wrapper for our components has no functionality of its own. It contains, you guessed it, a template selector, and also the `eventLog` array, and maps our component definitions to their names in the `components` object.

    Vue.component('pointer-demo', {
      template: '#pointer-demo-template',
      data: function() {
        return {
          eventLog: [],
        }
      },
      components: {
        'pointer-canvas': PointerCanvas,
        'pointer-log': PointerLog
      }
    });

A quick discussion about `eventLog` for a moment. We are sort of acting like [vuex](https://github.com/vuejs/vuex) here by providing a shared state for our child components to use. 

We keep it out of the app root because we want each instance of `pointer-demo` to have its own event log. That way, when `pointer-canvas` pushes events onto the array, `pointer-log` will pick up only this instance’s events. We also keep it out of either of the two child components so we don’t violate the cardinal rule of communicating state directly between two components. 

In a more complex, sophisticated app, we’d move to something like vuex so we could move state management to a single shared resource, and we’d have to write a little code to manage each log independently. For now, we want plug’n’chug for our components.

Now let’s get down to extending this app!

## Using a mixin
The first method we’ll take a look at is using a mixin. Using one is pretty simple. We start by pulling the lifecycle events out of our `pointer-canvas` component, and creating our mixin just ahead of our component definition.

    var pointerEventMixin = {
      data: function() {
        return {
          pointerInstance: null
        }
      },
      mounted: function() {
        this.pointerInstance = new PointerTracker(this.$el);
      },
      beforeDestroy: function() {
        this.pointerInstance = null;
      }
    }

Easy-peasy, right? Next, inside our component, we can remove our `data`, `mounted` and `beforeDestroy` options, leaving a very clean component definition. We do need to tell our component to use the mixin, so here’s what our new component definition looks like.

    var PointerCanvas = Vue.extend({
      mixins: [pointerEventMixin],
      template: '#pointer-canvas-template',  
      methods: {
        handlePointerMove: function (ev) {
          this.$parent.$data.eventLog.push(ev);
        }
      }
    });

Using the mixin definitely helps us keep our component focused on what it needs to do, and not functionality that can be abstracted out for reuse. We still have to include the mixin where we need that code, but it greatly reduces the chance for errors from retyping or cut-and-pasting of the same code over and over.

## Using component extension
Let’s say we want to add that functionality to all components of a certain that needed to track the `pointermove` event. Extending a base component allows us to inherit that functionality without any extra work. Let’s define the base component.

    var PointerBase = Vue.extend({
      data: function() {
        return {
          pointerInstance: null
        }
      },
      mounted: function() {
        this.pointerInstance = new PointerTracker(this.$el);
      },
      beforeDestroy: function() {
        this.pointerInstance = null;
      }
    });

Looks familiar, right? Almost identical to our mixin, the only difference here is that we are extending Vue so that when we create an instance from this base component, we will inherit everything it defines. Here’s what `PointerCanvas` looks like as a result.

    var PointerCanvas = PointerBase.extend({
      template: '#pointer-canvas-template',
      methods: {
        handlePointerMove: function (ev) {
          this.$parent.$data.eventLog.push(ev);
        }
      }
    });

Nice and clean indeed. We can also create other components that inherit from `PointerBase`, and they’ll get the same functionality. Can it get any better than this? Yes!

## A quick note on collisions
You may be wondering, “What happens if I define a data option, or other lifecycle function in my component as well?” 

In general, lifecycle functions get merged into a single array, and are executed in the order of their definition. Options that are objects have heir contents merged, favoring those values defined in the component itself. If the default strategy does not work for you, you can also define a custom merge strategy to accomplish whatever you need for your app.

For more information, check out the [Option Merging](http://vuejs.org/guide/mixins.html#Option-Merging) section of the official docs. 

## Using a plugin
Mixins and component extension are great, but the greatest flexibility comes from writing a plugin for your functionality. In our case, we provide a [custom directive](http://vuejs.org/guide/custom-directive.html) that can be used directly in our templates. As a result, we don’t need any code at all in our components except for our event handlers.

To use our plugin, we add a script tag to the top of our page, and then make a couple changes to the template and component code.

#### pointer-canvas-template
To use our new directive, we remove the old event binging, and replace it with `v-pointer:pointermove="handlePointerMove"`. That’s all we need to do here.

    <script type="text/x-template" id="pointer-canvas-template">
      <div class="event-source" v-pointer:pointermove="handlePointerMove">
        <p>Click and drag in here.</p>
      </div>
    </script>

The way our plugin is set up, we can use any of the [supported events](https://github.com/Rapid-Application-Development-JS/Pointer#supported-events) in the PointerTracker module. They all work the same way, so we could add `v-pointer:pointerdown="someHandler"` just as easily.

The directive also supports one modifier, `capture`, which sets `useCapture` to `true` for the binding when it is present. By way of example, `v-pointer:pointermove.capture="aHandler"` would translate to `addEventListener('pointermove', aHandler, true)`.

#### PointerCanvas
Our component code remains just as simple as our previous example.

    var PointerCanvas = Vue.extend({
      template: '#pointer-canvas-template',
      methods: {
        handlePointerMove: function (ev) {
          this.$parent.$data.eventLog.push(ev);
        }
      }
    });

#### vue-pointer.js
If you aren’t really interested in the inner workings of the plugin itself, feel free to skip past this next section. We won’t explore much of the plugin code here, since it is beyond the scope of this article, but you can always read through the comments in the `vue-pointer.js` file if you are curious.

The plugin is largely cribbed from [vue-touch](https://github.com/vuejs/vue-touch), in which Evan provides a similar directive for Hammer.js touch events.  Let’s just cover the parts of the plugin that do what our mixin and extended class examples did.

    bind: function (el, binding) {
      ...
      if (!el.pointerTracker) {
        el.pointerTracker = new PointerTracker(el);
      }
      ...
    }

The `bind` function of our directive gets called when the directive gets bound to an element. Just like in our previous examples we need an instance of PointerTracker, and this code does the same thing our `mounted` function did. But, we do a few things differently this time.

1.  Check the element to see if we have an instance of PointerTracker already. We do this because we may already have created one for a previous binding on the same element.
2. If an instance of PointerTracker has not been created, we create one.
3. Lastly we assign the instance to the element on which the binding is being created. As we will see, this is what allows us to bind several events with a single instance.

One last thing to look at, our unbind function. The code here does what our `beforeDestroy` code did in previous examples, namely it tears down the `PointerTracker` instance.

    unbind: function() {
      ...
      el.pointerTracker = null;
      ...
    }

## So, which way is best?
As with just about anything in software development, the answer depends on what you’re trying to accomplish. But because I’m an opinionated fellow, I’ll share a few thoughts on where I think each method works best.

#### When to use mixins
Mixins are great for adding functionality to components on an ad-hoc basis. When compared with component extension (in the next section), mixin functionality may not have any consistent relationship to the components where it gets used. That is, mixins provide reusable code, but don’t imply anything about the context in which they are used.

Mixins are also very low-cost, so they are great for quick prototyping when you need to use some common code in different parts of your app, but you have not yet worked out the overall structure of your components or the code they require.

The [vue-i18n-mixin](https://github.com/rayfranco/vue-i18n-mixin) is a good example of a mixin. It provides a `translate` function for use within your components, and a couple of useful helpers for translating values directly in a template. The reason it makes a good mixin is because not every component will need translation features, and it is not really object-oriented functionality that makes sense for inheritance. When you add a string to a template during development, you simply add the mixin and your strings.

#### When to use component extension
The use cases for extending a base component are much more straightforward. Component inheritance is best utilized when your component models are well understood and follow a well-defined structure or hierarchy. Think of things like types of media files or catalogs of products, or check out this [MongoDB use case](https://docs.mongodb.com/ecosystem/use-cases/product-catalog/) document on modeling a product catalog.

Another common example is when you have a base component for `Person` entities in your app, and you want to implement specific user roles with some shared functionality and some unique aspects. 

    var Person = Vue.extend({
      data: function() { return {
        firstName: "",
        lastName: ""
      }}
    });
     
    var Developer = Person.extend({
      data: function() { return {
        favoriteEditor: ""
      }}
    });
     
    var Designer = Person.extend({
      data: function() { return {
        favoriteFont: ""
      }}
    });

#### When to use a plugin
Plugins in Vue are best used when you need to make some functionality available to Vue globally. Adding a custom directive, as we did, is a prime example of when to use a plugin.

You should also consider a plugin if you need to add common functionality to every component instance in your app. Let’s say you wanted to add asynchronous web requests to your components, you might want toe allow your component code to do something like `this.$async.get(...)`. To do so, you can write a simple plugin that provides a thin wrapper for your favorite async library like SuperAgent, requests, or similar.

Plugins are great for:

- Vue-wide functionality
- custom directives
- adapters for 3rd party libraries
- providing a common interface for multiple external libraries
- broadly speaking, globally relevant code and not code for specific interface components

Be sure to check out the [bonus demo](/demo/vueextend/pointer-05-bonus.html) for examples of how the magic of a plugin and custom directive can make adding functionality quick, painless and homogenous across your components.

## Conclusion
There’s a lot to soak up in all the code, and we did not dive into each example too much in this article. The idea, from the outset, was to show how to implement identical functionality using the different mechanisms Vue provides for extending its capabilities. 

Armed with those examples, it is largely up to you to decide which method is appropriate for your project. Just remember, there’s no one-size-fits-all approach to anything, and you may need to try one or two different alternatives before you discover a happy balance between utility and abstraction.
