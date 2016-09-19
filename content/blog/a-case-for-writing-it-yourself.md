+++
author = ""
categories = []
date = "2016-08-11T10:00:00-07:00"
description = "Quite often it is better to learn how something is made than to simply grab something off the shelf."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "A Case For Writing It Yourself"
type = "post"

+++

Over the years I’ve vacillated between the two extremes of “roll your own code” and “throw together a bunch of libraries.” I suspect I’m not alone in this endless pursuit of “the best” way to build software.

In the end, we all know that each project is unique, and perhaps more importantly, its requirements will change with time. A library you rely upon today may not have all the capabilities you need tomorrow, or perhaps, after real usage data pours in, you realize you only need 1/100th of some module’s functionality and that you can easily write that bit on your own.

That said, more often than not,when it comes to building a project you are bootstrapping on your own dime, you tend to look for solutions and tools that are already out there. 

That’s exactly how I started out on my latest project, which I began writing code for about two weeks ago. But today, I realized there’s value to writing some things on your own in the early stages, even if it takes you some extra time. Let me take a step back first.

----

Last week I was cruising along with my Vue.js-based front end, amazed at how easily I was able to make really large amounts of progress each day. Part of this was due to careful planning, and part was due to the rather permissive structure of Vue itself.

Over the weekend, I wanted to rough out a very simple prototype of in-browser editing for two pretty straightforward, but distinct use cases.

1. The ability to edit a heading, represented by an `h1` or `h2` element. This would only allow for editing the text itself, and perhaps very basic formatting like bold or italic, but would not allow “full RTE” capability, HTML entry, etc. It should however allow a user to paste a value copied from elsewhere, and convert it to just text.
2. The ability to use RTE-like functionality to compose, edit or otherwise author a document in the context of a div, or similar `contenteditable` enabled element. Editing here would allow for things like ordered lists, block quotes, hyperlinks, etc, and perhaps even the occasional image placement. Copy/paste should do a reasonable job of preserving formatting from external documents, and undo/redo should operate as natively as possible.

Immediately I thought of three nice-to-haves:

1. Use something already available, proven and tested
2. Ideally use the same code for both instances—potentially through configuration or an API—so I didn’t have dependency trees for each use case, twice the code to manage, etc
3. Find something developer friendly, that is, something with modularity, a good API or some other way of extending and integrating the editor

Saturday came, and Saturday went. What I realized after doing _a lot_ of research, was that I’d have to mock up the scenarios I wanted to test, and create a list of criteria I was going to use to judge what worked.

I picked up where I left off on Monday, and by Tuesday my head was spinning. I had roughly 20 simple prototype pages built out and none of them was really leaping out as a clear winner.

The strongest candidate for the full-fledged RTE was [Quill], which has a killer [v1 Beta out]. As far as a lightweight solution (and even some RTE functionality), [Medium.js] does a really good job leveraging modern browser features for simple editing.

But, this left me in the unenviable position of possibly having two solutions, one for each use case, or of extending one or the other to enable it to be used for both contexts. 

While that was certainly possible, I found that Quill had one major flaw, undo/redo histories are maintained per-instance, which gets absolutely crazy when you have many instances to manage. It also does not emit events as much as I’d like, so I’d have to write some code there that would be “delicate” at best since it would live outside the core of the editor.

Medium.js lacks some of the more advanced RTE functionality, so I’d be doing a lot of coding to get it up to snuff for document editing. This is obviously more work than finding a way to restrict what a more feature-rich RTE can do.

----

And so it was that Wednesday I decided to write my own code to meet my use cases. By now, I have a very good definition of exactly what I need, and how those needs will evolve (at least for the next few months). I also have learned _a lot_ from poking around inside so many great solutions that are out there.

Along the way though, I’ve also learned just how much support there is in the browser for creating editable content. Starting from [this article] that covers the basics of creating your own RTE, it became clear that it would;t be too hard to get something workable very quickly, then evolve it as I continued other feature development.

There’s loads of resources related to this topic, most notably Mozilla’s docs on [`execCommand`] and a pointer to [some of the hurdles] that browsers put in your way. After about an hour, I had a passable editor that could handle RTE commands nicely, as well as the restricted case for editing a heading.

The one sticky wicket is, of course, copy/paste, but with some tweaking of [this solution] ([here’s a fiddle]), I’ve got just about all the external formatting I want to support in place, and none of the stuff I don’t want.

----

So, what did I learn? Why roll your own? 

Well, I wouldn’t advise it universally. First, do this:

1. Identify your critical functionality, your nice-to-haves and, any bonuses
2. Identify what you don’t want (multiple dependencies, etc)
3. Research what is out there
4. Score them
5. Build super-quick prototypes; aim for equal outcomes for better comparison (like [TodoMVC])
6. Score them again

If your needs are met, great! If not, then maybe roll your own. If you do, consider:

1. __What can you reuse from the exercises above?__ Not just code, but ideas and strategies.
2. __Are there smaller, helper libs that can get you up to speed faster?__ Both Quill and Medium.js make use of other small dependencies to help with things like range selection or undo history. I looked at things like [clipboard.js] to see what I could “delegate.”
3. __What is absolutely critical to build right now, and what can wait?__ Don’t ignore what can wait when you design your code, but plan to build it out later. In other words, build only what you need to validate your criteria, but keep growth in mind so you minimize having to revisit core code later. 

Once you’ve got all that out of the way, start coding! 

I honestly think the above steps are necessary to make the end result actually worthwhile. Too many times I’ve said, “f\*%k it, I’m going to write this myself” and ended up wanting to tear my hair out. Measure twice, cut once, and all that.

In the end, if you’ve done your planning and your homework, I think you get:

* a solution that meets 100% of your needs
* less bloat
* less code to manage
* __a much better understanding of how stuff works__

You can tell from the emphasis on that last one that I think that is the most valuable bit.

Good luck, and happy coding!
