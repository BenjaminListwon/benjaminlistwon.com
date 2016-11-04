+++
author = ""
categories = []
date = "2016-09-14T10:00:00-07:00"
description = "A short post about starting to move my Vue apps to Vue 2.0, and the resources I've found so far."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Vue 2.0"
type = "post"
tags = ["Vue", "vuex", "javascript", "reactive"]

+++

_(Update 11/14/16: This article has been [translated into Japanese](http://d.hatena.ne.jp/chi-bd/20161103/1478153981) by Chiharu Shibata.)_

A couple weeks back I got back from holiday, my son started the new school year, and once again the home office was calm and quiet. While I was away, someone had reached out about a [Vue](http://vuejs.org/) component I mentioned I was writing to use a [Handsontable](https://handsontable.com/) (HOT) in a Vue app. I mentioned that I was about to start converting it over to Vue 2.0, for future awesome, and that I’d happily add it to GitHub when done.

My oh my, was I in for a ride.

__TL;DR__ I’ve got a bunch of resource links at the [bottom](#bottom) of this post, and the Vue 2.0 HOT component will be wrapping up next week. Meantime, if you’re looking for a 0.x HOT component, you could base it off [this example](https://github.com/fundon/vue-admin/blob/next/_src/components/ui/table/Handsontable.vue) which comes form a [great project](https://github.com/fundon/vue-admin) by [fundon](https://github.com/fundon).

## But what about Vue 1.x?

Indeed, if you’ve been away from Vue for a little while, or maybe you just blinked, you may have [missed a lot](https://github.com/vuejs/vue/releases). To summarize some highlights:

- Jun 10, 2016: v2.0.0-alpha.1 first v2 release (3 more in next six days)
- Jun 16, 2016: v1.0.25 still working hard on v1
- Jul 28, 2016: v1.0.26 current stable 1.x release
- July 7, 2016: v2.0.0-beta.1 first 2.0 beta release (after 8 alphas, #whew)
- Aug 10, 2016: v2.0.0-rc.1 first 2.0 rc (after 8 betas, #bigwhew)
- Sep 13, 2016: v2.0.0-rc.6 (six revs in a month!)

So yes, a _lot_ of ground has been covered by [Evan](https://github.com/yyx990803) and loads of [contributors](https://github.com/vuejs/vue/graphs/contributors). Thanks everyone!


## Okay, what’s so difficult about moving to 2.0?

As I quickly discovered, there is a lot of use of the words “breaking changes” in the release notes for the various RCs. It took me a while to stumble upon some helpful resources that did more to [explain the changes](https://github.com/vuejs/vue/issues/2873#upgrade-tips), their [reasoning](https://vuejs.org/2016/04/27/announcing-2.0/) and how to [migrate](https://github.com/vuejs/vue/issues/2873#upgrade-tips), but there is still a lot of gaps in documenting how one might move from 0.8 -\> 2.0 or even from 1.0 -\> 2.0.

Vue 2.0 is __a complete rewrite__, and almost all of it that I can see is for the better—better code structuring, better pipeline, better tempting, faster, less resource consumption, etc—which means 2.0 is going to be really great for building apps. 

But, as a result 2.0 is definitely still very volatile. If you are looking for an A -\> B scenario, where B is well known, it’s not there yet. Which makes converting existing apps a bit time consuming.

## But wait, there’s more!

Just when I thought I’d gotten a handle on the Vue changes, I realized that to support 2.0, [vuex](https://github.com/vuejs/vuex) was also getting a [2.0](https://github.com/vuejs/vuex/releases)!

Since my HOT component was made to work with local component `data` and `computed` properties, as well as through a vex `store`, I knew I was in for a total rewrite as well.

Vuex’s changes go hand in hand with Vue’s changes, and TBH, are almost more compelling to me than many of the changes in Vue itself, primarily the addition of  `mapGetters`, `mapActions`, `mapState` and `mapMutations`. 

These Four Horsemen are not of the apocalypse, and will instead make your component writing life a hell of a lot easier. By combining them with the ES6 spread operator (`...`), you can very easily attach your component to events and actions of the store without all the `import foo from vuex/actions`, etc that littered up components in the past.

Seriously, `mapState` will change your life.

## As Columbo would say, “Just one more thing”

If you guessed vue-router, give yourself an extra patch of flair. In order to keep in sync with how vuex dispatches changes, and in general, vie-router has a new [batch of releases](https://github.com/vuejs/vue-router/releases).  The biggest changes are documented in the [first beta release notes](https://github.com/vuejs/vue-router/releases/tag/v2.0.0-beta.1).

To be honest, I haven’t dug that far into the vue-router changes yet because most of my app dynamically inserts components based on a `type` variable used in conjunction with `component :is=`, or as part of a `v-for` loop, rather than loading entire “pages.” 

I expect to have to dig in here further when I want to support “back” functionality in the app.

## No pain, no gain

The big changes in all of this for many of those on 0.x—at least for those authoring components or working on more complex, data-driven apps—boil down to two fundamental changes:

1. Vue 2.0 deprecates `$dispatch` and `$broadcast`, so if you were/are using them for event listening between your components, or anywhere in your app, you’ll have to move to `$emit` and `$on`. This isn’t too bad (almost just a find-and-replace) within a single component, but if you were not using a centralized store, or vuex, then communicating across components is likely a huge rewrite for you.
2. Vuex now uses `dispatch` to trigger actions, which in turn `commit` mutations, and both `dispatch` and `commit` are no longer [variadic](https://en.wikipedia.org/wiki/Variadic_function), that is, they only accept a fixed number of arguments, the first is the action or mutation to be triggered and the second is the payload (which can be an object, so you just have to have more structured data blobs).

All of this is for the better. As a result of porting my standalone components and the app I am working on to 2.0, I have not only become more learned about how Vue works, but also a slightly better, more responsible programmer.

The key here is that, in the Vue landscape (or an reactive front end), __components should be driven the data.  Full stop.__

Any changes to the data will get reflected in the components as they happen, and that is where the magic of tools like `mapState` come in so handy. In many (most?) cases you needn’t even build out additional getters since your `computed` properties object can contain references to the shared state directly.

Further, any user interaction that seeks to mutate that data should not act direct on the data for many reasons, not least of which is that tying a user action directly to a mutation means that it is too tightly coupled to allow for future changes or modifications to that action.

This used to be a bit tedious to code because of the way vuex `modules` worked. Even the examples and docs had laborious separate files for actions, mutations, etc. Tracking down something for a single module in files that sometimes had hundreds of functions for dozens of modules was complicated. 

In 2.0, it is easier to encapsulate the mutations within the module itself, and locate all of your actions in the root of the store. This allows for actions that can be composed of mutations across modules, and provides a singular place to see all your actions. Yay for better encapsulation.

## Should I move to 2.0?

- If you are working on a production app, no, not yet.
- If you are just starting out, yes, start in 2.0.
- If you are sort of in the middle of something, or you are tinkering around, it will definitely help you to write a better app, so it may be worth looking into.

<a name="bottom"></a> <a name="resources"></a> 

## Help, there’s no docs.

Indeed, you can’t google for “how do I … in Vue 2.0” and expect to get 100 StackOverflow answers at this point. That said, I’ve beens touring the web as best I can and here’s some resources to help ease the transition (and maybe save you an ibuprofen or two):

- [Vue 2.0 announcement](https://vuejs.org/2016/04/27/announcing-2.0/): In which 2.0 is kicked off
- [Vue 2.0 Change List](https://github.com/vuejs/vue/issues/2873#upgradetips): A brain dump and checklist of what’s in, what’s out and what’s changed
- [Vue 2.0 Release Notes](https://github.com/vuejs/vue/releases): Follow along as 2.0 comes to life
- [Vue 2.0 Docs](https://rc.vuejs.org/): This one took me a long time to find. Treasure it, share it, never lose the link to it!
- [Vue 2.0 Starter Kit](https://github.com/vuejs/vue/wiki/Vue-2.0-RC-Starter-Resources): Just found today. Also features one big fix if you’re using webpack.
- [Vuex 2.0 Release Notes](https://github.com/vuejs/vuex/releases): In lockstep with Vue releases, but contains vuex specific changes
- [Vue-router 2.0 Release Notes](https://github.com/vuejs/vue-router/releases): Also in lockstep with Vue releases.
- [Vue Forum](http://forum.vuejs.org/): Definitely join. Loads of discussion and group problem solving.
- [Vue on Gitter](https://gitter.im/vuejs/vue): Like Slack, but for even nerdier nerds.

## Whew!

That’s it for now. I’m still busy porting my components and app to 2.0, but the journey is proving to be pretty fun so far. I’m learning a lot, both about Vue and in general for building out a reactive SPA.

I’ll keep y’all updated on the HOT plugin, and the 2.0 adventure as I go!

As always, thanks for reading.


