+++
author = ""
categories = []
date = "2016-04-12T10:00:00-07:00"
description = "jQuery is great, but sometimes you don't need the kitchen sink."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "When To Look Beyond jQuery"
type = "post"

+++

_(Update: Forgot to include ScrollMagic. Big oops!)_

Before I continue, I wanted to set forth what this post is about. It is not a teardown of jQuery or a preachy case for using such-and-such a JavaScript framework. 

Rather, it is an acknowledgement of two things: 

1. If your target is modern browsers (really anything post IE8) and you are building something of modest size, then _any_ library or framework, jQuery or otherwise, may be overkill.
2. jQuery is a great core, upon which a universe of plugin functionality has been built, but its very generality means that it <strike>is not</strike> cannot be a specialist at any one thing, let alone several different things.

Below is some brief thinking on the above two points, and a list of some great, non-jQuery resources out there to help with certain tasks. 

_(I’m going to fire up a resources section here on my site soon, with links to ranging from design assets to development patterns and everything in between. If you’re interested, or you have suggestions, feel free to email me or sign up for notification below.)_


## The Backdrop
I’m in the middle of developing three different products, and each one uses a different technology stack for its respective front end. This is partly so I can learn about several new technologies in parallel, and also because each one demands different patterns of interaction.

* One site is simple static HTML and requires very little in the way of custom interactions as it is mostly display only. 
* The second, [Sir Tracksalot](https://sir.tracksalot.com) is a highly interactive SPA being built with [Vue.js](https://vuejs.org/) and all of its corresponding modules. 
* But the third, [A Life Alone](https://alifealone.com/), is somewhere in between. A content site with intricate, highly choreographed interactivity. 

So, as I head merrily along toward the looming [May 1st Reboot](https://twitter.com/hashtag/May1Reboot) deadline, I had to give some real thought to that third site.

## Item #1: YMNKJ
For _A Life Alone_, I do not need all the overhead of a full framework like Vue, Angular, React, or whatever. Such a library would be out of place anyhow, as there are no real components to speak of, no reuse. 

I gave some thought to jQuery, specifically for the large number of plugins I thought could help me out (more on this below), but then I sat back and asked “what functionality am I looking for, specifically from jQuery core?”

When I thought about it, I immediately thought back to the resource [You Might Not Need jQuery](http://youmightnotneedjquery.com), which I originally read about in the ALA post, _[Choosing Vanilla Javascript](http://alistapart.com/blog/post/choosing-vanilla-javascript)_. The quick summary is, if you simply need some functionality to snag references to DOM elements, attach a few event listeners and toggle the occasional CSS class, you _might_ be better off just using good old JavaScript.

Of course, if you want a little something extra (basic classes, “smarter” bindings, iteration and maps) something like [Underscore](http://underscorejs.org) might be a good choice at 6KB (mini + gz) versus 32KB (mini + gz) for jQuery.

Point being, core DOM manipulation is no longer as fraught with peril as it once was, and the vast majority of simple scripts can use vanilla JS that will run in today’s browsers.

## Item #2: Specialization
To be honest, this was the much more important part of my decision-making. A lighter footprint to core functionality notwithstanding, when I started to look at the actual weight and functional cost of using some of the plugins for jQuery, I started to find the standalone alternatives much more appealing.

The eventual tipping point was when I started to read up on the performance of various jQuery plugins relative to standalone alternatives. Part of the performance cost was down to the plugins, but part was also in the overhead incurred with jQuery object instantiation, especially costly in `$.each()` and `$.map()` situations.

So, I set about to find performant alternatives with flexible APIs and proven adoption. Here’s a few great resources I dug up.

## Code

#### Bespoke.js
[Bespoke](http://markdalgleish.com/projects/bespoke.js/) is a presentation / slideshow framework that can be extended with a large number of [plugins](https://www.npmjs.com/browse/keyword/bespoke-plugin) and [themes](https://www.npmjs.com/browse/keyword/bespoke-theme) (or your own code). It can be used simply by including a built JS file, forking the repo and building, or using nom and the Bespoke Generator, which is a CLI that builds a project for you. The core is only 1.7KB minified, though you’ll need at least a couple plugins if you want super-slick functionality.

#### Velocity.js
If you need an animation framework, [Velocity.js](http://julian.com/research/velocity/) is pretty much _the_ go-to solution. The best part for jQuery users is that the `$.velocity()` interface can be substituted directly in place of `$.animate()` in your existing code. It is pretty hefty at 32KB minified, but it is much faster than jQuery for animation, and allows you to do some clever stuff with tools like the following …

#### Tweene
[Tweene](http://tweene.com/) is an animation proxy, an API wrapper around any of a few different animation libraries, including Velocity, or jQuery if you’d like. If you check out one of [the examples](http://codepen.io/SkidX/details/LEVrxX/), you can toggle the animation library being used, as well as see how clean the timeline script can be (check out the JS in the [editor view](http://codepen.io/SkidX/pen/LEVrxX/)).

#### Scrollit.js
If you just want something to page through some full-screen “slides,” you can use [Scrollit.js](http://www.bytemuse.com/scrollIt.js/) to move between sections of a larger page. It comes with keyboard nav baked in.

#### Mousetrap
Whether you want cross-browser, cross-OS, international keyboard input capture, or you just need more reliable trapping of the Enter key, [Mousetrap](https://craig.is/killing/mice) is your everything. It can capture modifiers, combos, even sequences with a delay in them. It even auto-releases when inside form fields, unless of course you don’t want that. Bonus, it is 2KB minified and gzipped. A tremendous library.

#### Parallax
Keith Clark’s pair of articles, [Pure CSS Parallax Websites](http://keithclark.co.uk/articles/pure-css-parallax-websites/) and [Practical CSS Parallax](http://keithclark.co.uk/articles/practical-css-parallax/) provide a great way to execute a parallax effect without jQuery, or any JS at all. The “Debug Mode” in [this demo](http://keithclark.co.uk/articles/pure-css-parallax-websites/demo3/) is still one of the coolest things you’ll see, even two years on. If you are building parallax, and you are targeting modern platforms, this is a terrific way to go.

#### vh & vw
I can still remember my mind exploding when I read [this post](https://medium.com/@ckor/make-full-screen-sections-with-1-line-of-css-b82227c75cbd#.dyshv73t1) by [Andrew Ckor](https://twitter.com/@ckor) about using `vh` and `vw` units. Tired of using JS to get the viewport height? Just want some div to always be 60% of the width or height, with no funny business? Building a site with full-bleed “pages”? Look no further!

#### Underscore.js
I already mentioned it, but [underscore.js](http://underscorejs.org/) is worth the second mention. At 6KB, it is an excellent, drop-in library for DOM traversal and manipulation. 

#### Underscore.string
If you do decide to give underscore a whirl, I’d also recommend a quick look at [underscore.string](http://epeli.github.io/underscore.string/) which adds loads of common string manipulation functions you’d probably ned up writing yourself (ltrim/rtrim, startswith/endswith, lpad/rpad, etc). Trust me, give it a look.

#### ScrollMagic
If you want a whole lot of the above—animations, scroll targets, parallax—all in one smooth, well-integrated package [ScrollMagic](http://scrollmagic.io/) will get you there fast and easy. At only 17KB minified, it is a capable, performant library for all kinds of in-browser trickery. Be sure to scope [all of the demos](http://scrollmagic.io/examples/index.html) to get a complete picture of its capabilities.

## Resources

#### Javascript Patterns
Javascript master Addy Osmani has put together a tremendous, open-source book [Learning Javascript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/) that is as indispensable as it is useful. From classic design patterns (think [this book](http://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)) to more modern MVVM and MV\* patterns, you’ll find clear discussion and solid examples here.

#### You Might Not Need Jquery
Obviously I already mentioned [You Might Not Need Jquery](http://youmightnotneedjquery.com/) above, but for completeness’ sake, I thought I’d reiterate how useful it can be. If you are looking for a drop-in code snippet for anything from a document.ready function to a replacement for binding events, check there first.

#### Dive Into Javascript
Whether you’ve written JS for decades or are just getting your feet wet, [Dive Into Javascript](http://www.diveintojavascript.com/) is a great bit of reference, presenting info that other sites make available but in a clean, digestible manner.

#### HTML5
A pair of sites that are more resource than anything else, the articles and examples at [HTML 5 Doctor](http://html5doctor.com/article-archive/) and [HTML 5 Rocks](http://www.html5rocks.com/en/tutorials/?page=1) provide some ways to implement functionality in HTML5 compliant browsers that mean you may not need any JS for certain tasks. The latter is pretty Chrome-specific (it is after all a Google site) but much of the information is relevant to any modern browser. Which leads me to this last resource …

#### Can I Use
[Can I Use](http://caniuse.com) is the go-to destination to see if your target browsers/platforms will support something you want to deploy. Just search for what you want to use, and poof, a chart showing browser support will let you quickly assess what can or cannot be done.

