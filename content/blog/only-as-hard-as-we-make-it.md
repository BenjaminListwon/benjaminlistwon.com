+++
author = ""
categories = []
date = "2016-06-03T10:00:00-07:00"
description = "Frameworks are everywhere these days, but it can feel like we do their bidding more than the other way around."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Only As Hard As We Make It"
type = "post"

+++

Someone recently shared a link to _[Has Design Become Too Hard?](http://www.commarts.com/column/has-design-become-too-hard)_, an article by Jeffrey Zeldman about the changing landscape of designing for the web and the tools that we use to do that job. <sup><a href="#dates">[1]</a></sup>

Ignoring the salesmanship for a moment, the article makes a couple of important points, and misses something I think we overlook in our profession: not everyone wants to do it all on their own.

## Fundamentals FTW

The pull quote says it all:

> So whether you use a framework as part of your design process or not, when it’s time to go public, nothing will ever beat lean, hand-coded HTML and CSS.

Here, Zeldman is referring to the excessive markup, styles and scripts added to any project by utilizing a framework.

Yes, CSS and JS frameworks help us get from zero-to-functional very rapidly, and with relatively little investment from the overall project or organization, allowing us to try new ideas, create prototypes, and test interactions without committing to anything prematurely.

But too often we conflate [optimizing for the machines](https://benjaminlistwon.com/on-semantic-markup) that deliver our content, with optimizing our own workflow as designers and implementers.

Constraints like those [Jeremy Keith](https://adactio.com/journal/10665) and [Karolina Szczur](https://medium.com/@fox/the-web-isn-t-uniform-fd67eb631501#.3m8qrcran) wrote about serve as a reminder that knowledge of the fundamental technologies of the web are also the most fundamental part of our toolset, and our jobs. 

Truly understanding and empathizing with users whose experience of the web is different than our own—whether that’s because of a 2G internet connection or a physical disability—forces us to be as prudent as possible with every tag and every style we write.

Put differently, _knowing_ when to use a `<div>` as a wrapper to hook some styles to, versus having a framework make that decision for you is something learned by getting one‘s hands dirty, not an abstract level.

For us to make efficient use of those higher-level abstractions that frameworks provide, we should absolutely be using the most semantically meaningful, functionally discrete markup and styles. That way, when our designs get turned into hyper-efficient delivery code, we minimize the amount of needless containers and frivolous markup required to be truly modular.

Zeldman puts a different spin on something I’ve written before:

> At the end of the day, so long as the browser remains our de facto target, then the end result will ALWAYS BE HTML.

## We’ve Seen It All Before

> I’ve never seen a design idea spread faster, not only among designers but even clients and entire corporations […] Yet, after a euphoric honeymoon, designers soon began complaining that responsive design was too hard, that we’d never faced such challenges as visual people before. But haven’t we?

Indeed we have! Zeldman rightly points out that, since the very early days of the commercial web, we’ve seen challenges such as screen resolution, browser support, and even different shaped pixels. For a visual medium, this is about as infuriating as it gets.

Once again though, if we look at the broader profession of design, constraints have been with us all along, pushing us forward and inspiring our creations.

Newspapers have column widths and—gasp—actual folds! Print underwent something akin to the webfont revolution with the invention of movable type. Radio content must articulate complex ideas and stories using only audio. Television has faced resolution and color rendering issues that should be familiar to us all.

All of those media are still undergoing technological innovation alongside—and often in conjunction with—the internet, but with legacies, traditions and practices that are decades or centuries older than the web. 

Consider the adjustments that these media have made, not just visually, but in production, consumption and context of the content they deliver. They were all challenges at the time, but they spurred innovation, and in many cases, complete reinvention. 

## What Is A Framework?

Here’s the one thing I think this article does not address, the issue of the overloaded term “framework,” and indeed of the use of the word “code” as well.

Without diving into the abyss that is the debate over [what constitutes the practice of coding](http://www.codeconquest.com/what-is-coding/), or dipping into the “[should designers code](https://www.google.com/search?q=should+designers+code)” fray, I would like to try to shine some light on what I will call design frameworks versus development frameworks. _**(I know, I’m treading on verrrrry thin ice here!)**_


#### The Buckets

Broadly then, <sup><a href="#scope">[2]</a></sup>

* Design frameworks is what I will call tools that help you establish and reuse design patterns, enforce styles and aid in the transition from sketches to visual and interactive prototyping
* Development frameworks is what I will call tools that allow design patterns to be encapsulated in code, creation of reusable modular markup, binding of templated markup to data, and aid in the move from prototype to production

In the case of Zeldman’s article, it would appear he is referring primarily to design frameworks. Things like [Bootstrap](http://twitter.github.com/bootstrap/), [Foundation](http://foundation.zurb.com/) or [Skeleton](http://www.getskeleton.com/), or perhaps even simpler tools like [Responsive Grid System](http://www.responsivegridsystem.com/) or [1140 Grid](http://cssgrid.net/).

Development frameworks might be more reliant on Javascript, require a build process, or other external tools. Examples would be more like [Angular](https://angularjs.org/), [Polymer](https://www.polymer-project.org/1.0/), [Vue](http://vuejs.org/) or [React](https://facebook.github.io/react/).

All of that said, I think it is disingenuous, perhaps even detrimental, to use the catch-all term “frameworks,” without providing the scope of its usage. This is where I think we need precision with the term framework. Generally speaking, I would say it like this:

> Development frameworks possess criteria that make them more about the implementation of a product, than about the establishment of the visual and interactive patterns of that product.


#### As It Relates To People

I do not mean to diminish the skills or talent of any individual person or team, but I want to firmly state that I do not believe any single person must be fluent in all aspects of product development.

While it is truly amazing that there are people who can create an entire product—from stylesheet to database query—all on their own, this is not necessarily what _everyone_ wants to be.

Often, if you are hacking alone, or are a small startup, you may make use of both of these categories of framework (and much more) on a daily basis, just to try out even a simple idea.

Larger organizations may be organized into teams such as visual design and web development, or they may be organized as cross-functional teams focus on a particular feature or project. In these cases, familiarity with different frameworks helps, but day-to-day work might not require you to work outside a few specific tools.

**There is no one single “designer” archetype**, any more that there is one for a developer, author, artist or actor. James Franco, for example, ticks the actor box, but he’s also [done some other stuff](https://www.pastemagazine.com/blogs/lists/2013/07/the-11-professions-of-james-franco.html).

So, when we talk or write about frameworks, learning to code, or the occasional [narwhalicorn](https://www.spreadshirt.ca/narwhal-rainbow-stormtrooper-A13453975), let’s be sensitive to a couple of things:

1. Not every designer wants to code, just like not every developer wants to design.
2. Not all frameworks are created equal. Bootstrap includes behavioral JS where Skeleton does not. 
3. Not everyone needs all of the things, all of the time.
4. We all want the same thing in the end, the best possible experience for our users. 
5. Number four will mean different things to different people—a db designer will want performant queries, while a marketing manager will want better conversion rates—but they all translate to a better experience.

---- 

Okay, that’s my $.02, have a great weekend!

![](/postimg/only-as-hard-as-we-make-it/200.gif)

<a name="dates"></a>
<a name="scope"></a>

---- 

<sup>[1]</sup> Apologies if I’m dredging up old news, as I’m not sure if the article is new or not since CommArts has one of my personal pet peeves, posts with no date. 

<sup>[2]</sup> Please note, both the terms design frameworks and development frameworks are further “scoped” here as part of a web design/development toolkit. I recognize that platforms like iOS and Android have their own tools, as much as there are thousands of development frameworks, scaffolds and libraries all the way down the stack to the db. It simply felt incorrect to prefix the terms with “web” in this discussion.