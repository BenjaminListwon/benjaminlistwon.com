+++
author = ""
categories = []
date = "2016-03-18T10:00:00-07:00"
description = "Tools, tips and references to help get your first Vue.js project off the ground."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Getting Started With Vue.js"
type = "post"

+++

_(Update: The folks at Vue made an even easier startup template. I [wrote a quick post](https://benjaminlistwon.com/getting-started-even-faster-with-vuejs) about it here.)_

Since [Polymer](https://www.polymer-project.org/1.0/) went 1.0, I have built a couple small, personal projects with it. Those experiences have gone great, but some of the rigidity of Polymer’s elements and API continued to bug me. 

Now I’m working on shipping my first public project in a while, and I’ve bumped into some challenges with Polymer. So when a couple folks mentioned [Vue.js](http://vuejs.org/) on back-to-back days last week I figured it was worth looking into.

Here’s my initial impressions, a few resources and more.

## TL;DR

Vue is great for getting an app up and running in no time. Even if single-page apps, or client-side JS apps in general, are a new thing for you, vue is a forgiving way to learn the concepts alongside the actual structure of building such an app. Check out these links to get up and running ASAP:

* Start with a [Vue boilerplate](https://github.com/vuejs-templates/) instead of piecemeal
* Build a full on app, while learning vue, webpack and more, with [this awesome walkthrough](http://blog.pusher.com/exploring-real-time-apps-with-vuejs-es2016-and-webpack/)
* Sift through the [awesome vue repo](https://github.com/vuejs/awesome-vue) for loads of resources
* For Chrome, go get the [vue-devtools](https://github.com/vuejs/vue-devtools), it’s indispensable

## Hello World

Getting started with Vue is terribly easy. For one thing, you don’t need any complicated build process, fancy tooling or anything else. You can [grab a downloadable version](http://vuejs.org/guide/installation.html) of the library, chuck a script tag in some HTML and plug [one of these examples](http://vuejs.org/guide/index.html) in right away.

_(You don‘t even need some fancy auto-reload server if you can run one of these great [one-line servers](https://gist.github.com/willurd/5720255).)_

Polymer has a similarly easy path to hello world when you use the [Polymer Starter Kit](https://developers.google.com/web/tools/polymer-starter-kit/). The difference is that Polymer starts you off with the build toolchain for a full-blown app, whereas Vue offers differing levels of adoption. _(More on this below.)_


## Dev Tools

If you’re running Chrome, you can pick up the [vue-devtools](https://github.com/vuejs/vue-devtools) for a richer debugging experience. This is a pretty nifty helper because often, one of the most difficult aspects of building a browser-based app _(SPA, or whatever you may call it)_ is getting easy, well-formatted access to the model data in your browser.

You can also interact with the DOM, and the components by shipping either to the console, where you can interact as you would with any “regular” javascript object. This is pretty handy for triggering an event you might want to observe, or fiddling with the app without toggling back to your editor. That’s pretty helpful if you you are just tinkering and don’t yet have a whole toolchain in place.

This is another pretty big advantage for folks just getting into a framework for JS apps. With Polymer, getting your head wrapped around the Shadow DOM, the so-called “shady DOM” and what appears in the client-rendered DOM can be daunting. Getting at the data in those objects, and tweaking their properties is next to impossible in the console alone, especially without a firm grasp of the concepts in play.

## Building A Bigger App

As you become familiar with how Vue works, you may start to focus on building a bigger app with it. To get there, there are a few helpers already in place. There’s a [little bit of a page](http://vuejs.org/guide/application.html) on it in the official vue docs, but that is a bit of a whirlwind tour, especially if you are unfamiliar with tools like Webpack or Browserify _(as I was)_.

Below are some of the building blocks for a bigger app, included for reference. But, a better way to get going can be found in the next section, [Vue Boilerplates](#boilerplates).

#### Routing
Routing, specifically client-side routing, is achieved with [vue-router](https://github.com/vuejs/vue-router). You’ll want to check out the [full documentation](http://vuejs.github.io/vue-router/en/index.html) for vue-router as well, because there’s loads of thigs you can do with it.

#### State Management
Centralized state management is made easier with [vuex](https://github.com/vuejs/vuex/), which also has some [good documentation](http://vuejs.github.io/vuex/en/index.html). Though, I’d strongly recommend [this video](https://www.youtube.com/watch?v=l1KHL-TX3qs) by James Browne, which does a great job of explaining the concepts behind managing state in the client, as well as how to use vuex to do so. 

#### RESTful Communication
Related to the above, if you’re pulling data from your API, you will want to take a look at [vue-resource](https://github.com/vuejs/vue-resource) as a means of encapsulating data sources in your app. In my opinion, you should always prefer resource factories over ad-hoc communication, but if you need the latter, there is also [vue-async-data](https://github.com/vuejs/vue-async-data) which provides a convenient way to fire async requests instead of rolling your own.

#### Components
Finally, and perhaps most crucially, you’ll want to check out how [vue-loader](http://vuejs.github.io/vue-loader/index.html) works. Component building is  the fundamental building block of any larger-scale web app, and scoping your javascript and styles to the component is something that really makes this possible.

Here’s an area where Polymer has really done some great work for app developers right out of the gate. The Polymer [Element Catalog](https://elements.polymer-project.org/) is full of well-designed—both technically and visually—components that make everything from building a form to modals to full-page layouts super simple. There's also a growing community of folks building elements for Polymer apps, such as [Vaadin](https://vaadin.com/elements/), who provide a few great elements for free.

I’ve also found it pretty simple to roll my own elements in the past, including one for [Chartist](https://gionkunz.github.io/chartist-js/) and [Hands On Table](https://handsontable.com/) which now has it’s [own component](https://github.com/handsontable/hot-table).

Vue has a few [great demos](http://vuejs.org/examples/) of rolling your own components including a [grid](http://vuejs.org/examples/grid-component.html), as well as full-blown mini-apps, such as the obligatory implementation of [TodoMVC](http://vuejs.org/examples/todomvc.html). There’s a much greater list of components, as well as a zillion other resources, available in the [awesome vue repo](https://github.com/vuejs/awesome-vue), though I can’t vouch for all of the resources as I’ve only begun to scratch the surface myself.

<a name="boilerplates"></a>
## Vue Boilerplates
A better way to get started on a full-blown app, however, is to use one of the boilerplate repositories. These are very similar to the Polymer Starter Kit, and will require you to utilize [Webpack](http://webpack.github.io/) or [Browserify](http://browserify.org/).

I chose Webpack, and thus the [Vue + Webpack template](https://github.com/vuejs-templates/webpack). There is also a lighter weight template for prototyping, and parallel versions for Browserify. You can find them all in the [vue template org](https://github.com/vuejs-templates).

The great part about these templates is that they include all of the modules I wrote about in the last section. All the structure is in place, so once you get the template and the node modules installed, you simply fire up the dev server. Right away, you can see and make changes to the main `.vue` file or build a new component, and see it all in the browser.

For completeness’ sake, the same is basically true for Polymer. If you get the starter kit, or even if you are putting together your own app from scratch, you can get the toolchain up and running with Gulp or Grunt. But Polymer requires using Vulcanize, a proprietary tool that performs much of the same work that Webpack or Browserify do, which seems like inventing a a tool for inventing’s sake. The toolchain also always felt a little rigid to me, demanding certain conventions during development that required me to make changes to my webserver or my code in order to have the right path for components or to serve resources in a certain way.


## Follow In The Footsteps ...
Before I got going with the template though, to get more comfortable with the tools, as well as learning more about features of writing javascript in ES6, I did this [tremendous tutorial](http://blog.pusher.com/exploring-real-time-apps-with-vuejs-es2016-and-webpack/). _(To be honest, I bailed on the entire thing because I did not want to set up a Pusher account, but I used a local API to send messages back and forth, and did not focus on the “live” nature of a pub/sub channel.)_

The awesome part of the Pusher walkthrough is that it gently introduces you to Webpack, building a vue component, writing in ES6 and how to think about a component-based architecture, all without getting too jargony or assuming you already know any of the moving parts. For me, this helped me go from literally zero knowledge about any of these technologies, to writing a cross-domain ajax app in just a couple hours.

I’d be remiss if I didn’t mention Rob Dodson’s [Polycasts](https://www.youtube.com/playlist?list=PLOU2XLYxmsII5c3Mgw6fNYCzaWrsM3sMN) for Polymer as a counterpoint, since he has done a pretty fantastic job demoing everything from component building to build process tools.

## One Key Advantage
After all is said and done though, there is one clear advantage for me personally. I left it to the end because it is entirely subjective, and can be seen as a negative if you are looking for an off-the-shelf system of components.

For me, the absence of a mandate on how I write my markup or styles is a Big Deal. Being able to write my HTML and CSS / LESS on my own means that I can build components and pages freely, without restriction. it also means that I can easily make the components of my SPA look like the static pages of my site without reinventing my stylesheets. This may seem like a minor point, but to be able to quickly write some HTML, slice it up into components and not have to rethink anything is often overlooked or underestimated.

As I said, this can be a drawback for some. For example, while there is a grid demo in Vue, it has a long way to go before it is on par with either the Vaadin grid or Hands On Table in Polymer. 

This speaks to one large difference in approach, which is what makes Vue a better fit for me now, over Polymer.

Vue is great if you are building form the ground up, are a solo hacker, or are just starting out in client-side apps and MV* architectures. It let’s you get an interface up quickly, so you can focus on how your app actually works, and less on the infrastructure.

Polymer is a better fit if you have an established application already, a larger team, or want to convert a more static application to a single-page experience. It sort of comes with an implication of how your app should be structured, fitting in well with a system that has already done some work to abstract application logic.

Since I am but a single person, whacking away at apps on my own time, I need something that allows me to be agile, adaptive and free to explore. Something with strong principle, but not prescription.