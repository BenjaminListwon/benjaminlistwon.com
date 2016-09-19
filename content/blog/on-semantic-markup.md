+++
author = ""
categories = []
date = "2016-05-18T10:00:00-07:00"
description = "Our front-end toolboxes are awesome these days, but why bend over backwards just to describe HTML?"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "On Semantic Markup"
type = "post"
tags = ["opinion", "HTML", "semantic"]

+++

## The Backdrop
_(In which the author is, once again, too hasty.)_

Yesterday, I saw this tweet pass through my timeline:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/snookca">@snookca</a> x1000 this. Reading that ALA article, I had two thoughts…<br><br>1. ALA used to have good content.<br><br>2. What year is it? Did we go *back*?</p>— Nathan Smith (@nathansmith) <a href="https://twitter.com/nathansmith/status/732607288893018112">May 17, 2016</a></blockquote>

Naturally, I was immediately curious about what Jonathan had written, and what the ALA article was about. 

I headed off, read them both, and then after some coffee I hastily penned a “comment” that ended up being more like an article itself. 

As usual though, I did a pretty poor job reflecting on the matter at hand, and thought I’d take some time to articulate my own position on CSS, semantics and the modular tools in use in so-called “modern” web development.

## The Premises

In case you haven’t read them, _[More  Meaningful CSS](http://snook.ca/archives/html_and_css/more-meaningful-css)_ is [Jonathan’s](http://snook.ca/about/) response to _[Meaningful CSS: Style Like You Mean It](http://alistapart.com/article/meaningful-css-style-like-you-mean-it)_, an ALA article by [Tim Baxter](http://alistapart.com/author/tim-baxter) from earlier this month.

I suggest giving both a read before continuing here, but if I were to briefly summarize each post …

Tim’s post asserts that semantic elements in HTML5, and other tools like [ARIA](https://www.w3.org/TR/wai-aria/) should enable us to write semantic CSS, not get lost in a soup of meaningless classnames. In his own words: 

> Why reinvent the semantic meanings already defined in the spec in our own classes? Why duplicate them, or muddy them?

Jonathan’s post acknowledges that there are times when rigid systems break down in practical usage, when using a class-based, modular approach is more effective than adherence to dogma for adherence’s sake. He writes:

> This is where class-based CSS systems like SMACSS excel. You can give something meaning with a name—a name that you and your team can decide together what it means.

In the end, I think Both Tim and Jonathan are right. 

No, this is not a hedge, and I hope to convey in the coming paragraphs that by building on a strong semantic footprint, we allow ourselves the ability to easily alter the layout or appearance of modular components without excessive `class` values or additional markup.

## The Problem(s)

To summarize briefly, HTML or CSS that is non-standard, proprietary, highly customized or unnecessarily opaque means:

1. our code is harder to read and comprehend
2. there is a greater learning curve for new contributors
3. our code is increasingly tied to a particular system, method or technology
4. we devote ever-increasing time to documenting our code and educating the collective
5. the more contributors there are, the more amplified any deviations will become

Those factors cost us time, money and frankly, our own personal sanity—we constantly juggle how exactly to specify attributes for an `h1` in Jade (or Haml, or jQuery, or Vue.js, or …).

Think about something completely different for a second. Isn’t the popularity of [markdown](https://daringfireball.net/projects/markdown/) due to the fact that we collectively like the portability of a document that can be transformed into dozens (possibly hundreds) of different types of output? Isn’t its explosive growth do to a terse set of a few basic rules? Isn’t a major factor of its appeal, its utter simplicity?

Well that was, and still is, the idea behind [SGML](https://en.wikipedia.org/wiki/Standard_Generalized_Markup_Language), the granddaddy of XML, HTML and the like. Create a way to describe a document that can, in turn, be interpreted by any software and transformed into some sort of friendly, user-facing presentation of that document.

_(I’ll come back to transformations down in The Solution section.)_

There’s a reason HTML is still _the_ markup for the entire internet. It is standardized, people all have a more-or-less consistent understanding of its parts, and it is versatile enough that it can describe loads of different outcomes.

HTML has grown, changed and adapted (albeit slowly) as the industry has matured, but it has never been thrown out, completely rewritten or otherwise torn down.

The same notion of semantic meaning is present in CSS, though is perhaps undersold relative to the semantics of HTML. There are, of course, external influences that have contributed to less rigor in CSS semantics:

* browser prefixes
* uneven browser support 
* divergent precompiler syntaxes <sup>†</sup>
* less than clear/complete specifications for several properties (often due to a reluctance to over-prescribe in the spec)

Despite the turbulence within and across different toolsets, and in the face of uneven adoption of CSS3, things were manageable for quite a while. Then, along came the rise of the Javascript Framework (dum, dum, dummmmm).

Let’s take a look at how these situations got amplified, then see if we can’t solve some of it.

_<sup>†</sup> Incidentally, precompilers utilizing an auto-prefix library to automagically fill in values for different browsers is a terrific example of a tool helping us out._

## Those Problems, Intensified

About a year ago [Samuel Fine](https://twitter.com/samuelfine) had this to say (amongst other tweets):
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">BEM sounds super useful if you don't know how HTML or CSS work.</p>— Samuel Fine (@samuelfine) <a href="https://twitter.com/samuelfine/status/575646836251344897">March 11, 2015</a></blockquote>

_(Thanks to [css-tricks](https://css-tricks.com/bem-101/) for hanging onto them in an article on BEM.)_

The way I see it, we’ve let more modern approaches to rendering the front-end dictate how we should write—and even think about—the styles and markup we write. 

The rampant `div`ification of our markup and “classname over-proliferation” Tim alludes to are almost entirely the result of the rapid adoption of front-end frameworks. 

[For example](https://www.facebook.com):

    <h2 class="inlineBlock _3ma _6n _6s _6v" 
        style="padding: 42px 0 24px; font-size: 28px; 
        line-height: 36px"> Connect with friends and the<br />
        world around you on Facebook.</h2>

That code is clearly generated programmatically, and it is likely that more descriptive classnames and code are written behind by the original authors before being optimized and obfuscated for maximum efficiency.

However, why are we voluntarily obfuscating our own work? It’s less readable / intelligible / maintainable in the long run. Our own tools often <strike>allow us</strike> force us to relinquish the generation of styles and markup to code. 

Code that frequently falls back on techniques we’d immediately condemn if written by an actual person, just like the Facebook snippet above. 

Let’s take a sampling.

Stylistic approaches to CSS, like [BEM](https://en.bem.info/), tell us we need to [write CSS classnames](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/) in a manner comparable to how Javascript traditionally annotates HTML as it generates or manipulates elements:

    .person {}
    .person__hand {}
    .person--female {}
    .person--female__hand {}
    .person__hand--left {}

Front-end frameworks like [Bootstrap](http://getbootstrap.com/) require you to write HTML that looks like it is machine generated _([btw](#btw))_:

    <div class="row">
    <div class="col-sm-5 col-md-6">Huh?</div>
    <div class="col-sm-5 col-sm-offset-2 
        col-md-6 col-md-offset-0">Wut?</div>
    </div>
    <div class="row">
    <div class="col-sm-6 col-md-5 col-lg-6">
        This is an actual ...</div>
    <div class="col-sm-6 col-md-5 col-md-offset-2 
        col-lg-6 col-lg-offset-0">... example 
        from the docs.</div>
    </div>

Javascript-based frameworks like [Angular](https://angularjs.org/), or libraries like [Polymer](https://www.polymer-project.org/1.0/) do away with standard tags altogether:

    <paper-dropdown-menu label="Your favourite pastry">
        <paper-listbox class="dropdown-content">
            <paper-item>Croissant</paper-item>
            <paper-item>Donut</paper-item>
            <paper-item>Financier</paper-item>
            <paper-item>Madeleine</paper-item>
        </paper-listbox>
    </paper-dropdown-menu>

_(Ssshhhh, that’s a `select` in disguise. More on that irony, [just below](#irony).)_

We even got too tired and lazy to write HTML (or even worse, let our editor auto-complete HTML for us). Witness [HAML](http://haml.info/):

    %section.container
        %h1= post.title
        %h2= post.subtitle
            .content
                = post.content

I mean, c’mon. _[[An aside](#anaside)]_

#### Deja Vu All Over Again
Incidentally, folks have been reinventing / augmenting / building [atop web standards](https://en.wikipedia.org/wiki/XUL) for “ages,” [or at least since 2002](http://www.mozillazine.org/articles/article2278.html): 

> XUL can be used to write cross-platform applications such as Mozilla Firefox, where it is interpreted by the layout engine, known as Gecko, which renders Firefox's user interface and Web page display.
>  
> […]
>  
> XUL relies on multiple existing Web standards and Web technologies, including CSS, JavaScript, and DOM. Such reliance makes XUL relatively easy to learn for people with a background in Web programming and design.

… wait for it … <a name="irony"></a>

> The Polymer library is designed to make it easier and faster for developers to create great, reusable components for the modern web.
>  
> […]
>  
> With custom elements, you can extend the vocabulary of HTML with your own elements. Elements that provide sophisticated UI. Elements that are as easy to use as \<select\>

I guess [XSL](https://en.wikipedia.org/wiki/XSL) probably clocks in as one of the earlier technologies to dabble in transformations built on web standards, with its first draft out in 1998.

## Some Solutions
_(Or, at least, the kernel of how to employ them.)_

You may think, from the above, that I am sour on technologies like Polymer, Vue or Angular, that I steer clear of Bootstrap, underscore or Foundation.

On the contrary, I think client-side rendering is a good thing. I think having the ability to create applications that primarily pass data back and forth allows for greater autonomy, and tremendous possibility for the software—and indeed embedded hardware—that we will build in the next decade.

However, I do not believe there is any reason why we shouldn’t write semantic markup and/or styles. 

HTML is standardized, well-understood and documented, and familiar to anyone that picks up our code, not just ourselves or our immediate team. So too should our CSS be.

#### Semantic First
_(It’s like mobile-first, but for linguistic nerds.)_

Even in large-scale systems, I truly believe that semantic markup is the strongest foundation on which to build. Why reinvent the wheel?

For example, this will always be more comprehensible to a broader audience:

    <article>
        <header>
            <h1>Cats And Dogs</h1>
        </header>
        <p>Cats and dogs could not be more different, yet ... </p>
    </article>

than this:

    <div class="article">
        <div class="article__header">Cats And Dogs</div>
        <p>Cats and dogs could not be more different, yet ... </p>
    </div>

And the `article` version does exactly what the `div class="article"` version does, arguably more transparently. Removing the `h1` and adding style to the `article__header` element also removes implicit understanding of what’s inside and what it should look like. 

Often though, things go the other way—more divs. Here’s just the containers for the title text of a [video on Youtube](https://www.youtube.com/watch?v=gFUSF_UB2R8):

    <div id="watch7-headline" class="clearfix">
        <div id="watch-headline-title">
            <h1 class="yt watch-title-container" >
                <span id="eow-title" class="watch-title" dir="ltr" 
                    title="What It Would Be Like to Live on the Death Star? 
                        A Look at What Life Was Like During Rogue One">
                    What It Would Be Like to Live on the Death Star? 
                    A Look at What Life Was Like During Rogue One
                </span>
            </h1>
        </div>
    </div>

What the what? I can _maybe_ justify one containing `div` (though there is another parent `div` in the markup that might work just as well), but the span is almost guaranteed to be excess markup and nearly all of those classnames are likely unnecessary.

Moving on.

Certainly, when it comes to CSS, it seems ridiculous to waste time and effort renaming what already exists. Compare:

    ul.menu { width: 200px; }
    ul.menu li { background: #fff; }
    ul.menu a { color: #369; }
    ul.menu a:hover { color: #333; } 

with:

    .menu { width: 200px; }
    .menu__item { background: #fff; }
    .menu__link { color: #369; }
    .menu__link:hover { color: #333; } 

and tell me it isn’t just wasted naming effort and additional cognitive load to remember and transform those names in your head.

As far as individual customizations or special scenarios, if you want to change one particular menu in one particular place, both of these will still require at least one parent or combining class that changes the children’s behavior:

    ul.menu.inverted { ... }
    ul.inverted a:hover li { ... }
    -- vs --
    .menu.menu--inverted { ... }
    .menu--inverted .menu__link:hover .menu_item { ... }

So, let’s stick with elements that have semantic meaning, and the styles that target them, until we absolutely cannot.

#### Classnames Are Not _All_ Bad
Another aspect of the discussion was about changing appearance with classnames. 

I have always interpreted the `class` attribute as a way to add properties to, or change the properties of,  a “base” class. For that, classnames are 100% appropriate. 

This idea is very similar to the notion of [duck typing](https://en.wikipedia.org/wiki/Duck_typing) in object-oriented programing. _(A duck is a bird, but not every bird is a duck!)_ 

If we have a signup form that looks like:

    <form>
        <p>
            <label>Email Address</label>
            <input type="email" name="email">
        </p>
        <p>
            <label>Password</label>
            <input type="password" name="password">
        </p>
    </form>

It is pretty easy to think about how we’d style this form in CSS. We can give our site consistent form look-and-feel by using general `input` selectors, or specifics like `input[type="email"]`.

Now, let’s say we want our signup form to have a colorful background on certain pages where we want it to stand out, we would simply add a class to the form, or use an ancestor to control the change:

    form.party-time { background: url(celebrate.jpg); }
    -- or --
    body.party-time form { background: url(celebrate.jpg); }

And if we had a need for a specific `input` alteration based on some other prevailing condition, we can just as easily target that in CSS:

    form.party-time input[type="password"] { transform: rotate(180deg); }

This becomes more relevant, and less oversimplified, as we head into larger applications.

#### Applications And Components
One area where folks often argue that semantic-only markup and styles fail is in a web application context. 

In such cases there is often a need to use a generic HTML element, such as a `div`, for a few reasons. The biggest reason though is usually that one cannot predict the context of where a component will be inserted into the DOM, thus we need some sort of hook to hang localized styles off of. _(I have an idea for that in the next section.)_

An example might be something like the [Bootstrap progress bar](http://getbootstrap.com/components/#progress). Here’s the HTML for the basic example:

    <div class="progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;">
            <span class="sr-only">60% Complete</span>
        </div>
    </div>

To Tim’s point, there is no need for the class `progress-bar` in the above example, _especially_ when there is also already an ARIA `role` attribute present. Either of these will work:

      div.progressbar > div
      div[role="progressbar"]

The span with the class `sr-only` is intended to indicate that the text within should be read by screenreader, but that there is a style somewhere that hides the text from visual display. 

This can be accomplished with the `aria-label` attribute, a global attribute intended expressly for labels not displayed visually, or functionally equivalent to the HTML `title` attribute. So we could rewrite the above as:

    <div class="progress">
        <div role="progressbar" aria-label="60% Complete" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;"></div>
    </div> 

I almost cooked up a way to eliminate the outer `div` but ran up against a wall. That would let us express a progress bar (save for the [stacked](http://getbootstrap.com/components/#progress-stacked) case), like so:

    <div role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;" aria-label="60% Complete"></div>

 _(I’ll keep at it and update here if I can do it.)_ 

#### The Magic Of Title
I’ve secretly been holding onto “this 1 cool trick” the whole time. 

Going back to our signup form, I can feel some readers squirming in their seats thinking about “But, what if I want to have a base form, then signup details, then party-time awesomeness? Won’t that need multiple classes?”

    <form class="signup party-time">
    ...
    </form>

Before you go classifying every component in your toolbox, consider using the `title` attribute. In HTML5, you can add it to _any_ element! 

Plus, not only can you use it as a selector target, you can helpfully provide context for screen readers.

    <form title="Signup Form" class="party-time">
    ...
    </form>

Now, we can target all three, or any combo, in CSS:

    form { ... }
    form[title="Signup Form"] { .. }
    form.party-time { ... }
    form[title="Signup Form"].party-time { .. }

Using `title` pretty much eliminates an urge to create poorly descriptive classnames like “that-one-form-with-the-special-button” or names that could otherwise be titles, like the one above. 

So now there’s really no need for classes like “form basic-form signup-form” or  using `id` to do the same `id="signupForm"`.

Use this power wisely my friends!

#### Let The Software Do Some Work
In all seriousness: why do we put the load on ourselves, not our tools?

**At the end of the day, so long as the browser remains our de facto target, then the end result will ALWAYS BE HTML.**

Just let that simmer for a minute. No matter how many transformations between source file and output, no matter how clever the abstraction, no matter how trendy javascript gets, the browser still consumes HTML.

HTML is inherently expressive, and so is CSS (I’ll allow that there are places where both get very murky). We should strive to use that expressiveness in our everyday work, and adapt our tools so that they can use that input to create generated output.

Since something like Polymer already supports scoped styling, shadow (shady) DOM and other methods that allow for an autonomous component, there is no reason the internal markup of a component has to be like the completely proprietary markup above instead of:

    <label>Your favourite pastry</label>
    <select>
        <option>Croissant</option>
        <option>Donut</option>
        <option>Financier</option>
        <option>Madeleine</option>
    </select>

Polymer adherents will point out that there is no root element to attach to for DOM insertion, etc. However, that is _precisely_ the kind of transformation our software should do for us:

    If there is more than one DOM node in the template
        > create a root node
        > clone the child nodes
        > append the clones to the root
    Else
        > clone the root node
    Finally
        > insert the root into the dcoument

We should not have to write source files with nested `div`s just so our Javascript doesn’t have to check the number of child nodes in a container.

Let’s push for our tools, toolsets and toolchains to support workflows that allow us to have to carry less of the load. Not tools that purport to save us time by trading for our brainspace, but tools that save us time by embracing the foundations of the web, and allow us to be the innovative, creative souls that we are.

In the meantime, we’ll have to do our best to build components within those frameworks that leverages semantic HTML and CSS. We can do this in a framework like Polymer by building components with less `div` elements, no custom elements like `x-elem` and scoped styles that utilize semantic selectors, not classnames.

We should aim for how Vue.js operates, allowing us to express data-bound, modular components that use clean, semantic markup. Here’s a [bound `select` in Vue](http://vuejs.org/guide/forms.html#Select):

    <select v-model="selected">
        <option v-for="option in options" v-bind:value="option.value">
            {{ option.text }}
        </option>
    </select>

## Conclusion
Though I’m not sure I accomplished what I set out to do here, or that I wrote about anything novel, I do think it is important to keep the conversation about semantic HTML + CSS going.

The pace of our innovation, and our toolset(s) for that matter, keep increasing. And the more we let them abstract away the correlation between source material and output, the greater the risk to our community and our colleague’s understanding of how those technologies actually work.

It never took me long to explain how HTML works to a new hire, be it 20 years ago or today. Let’s work to ensure that our shiny new tools and meta-languages are just as clear, and just as well-suited for the job as those technologies that have proven so resilient all these years.



---- 
<a name="btw"></a>
## BTW
Did you know: [CSS3 column support](http://caniuse.com/#search=column) has been in Chrome since version 4, which shipped in [January 2010](https://en.wikipedia.org/wiki/Google_Chrome_release_history) and Firefox since version 2, which shipped in [October 2006](https://en.wikipedia.org/wiki/Firefox_release_history)!  

Just saying.


<a name="anaside"></a>
## An Aside
Full Disclosure: Way back, my very first “big” gig was to remove proprietary, in-house markup from over 2,000 untemplated pages (save a header and footer template), implement CSS for the first time, and templatize the whole site. 

The in-house code functioned basically the same as any of the above abstractions, but it was untenable as the team had grown from one designer to eight, and a half dozen engineers to forty.

The solution was to go back to basics, wipe the slate clean, and re-write the whole thing from the ground up in semantic HTML and CSS. Productivity soared, build times shrunk, bug counts fell and features began shipping in weeks not months or quarters. 

And yes, we did it on a site with 10M active users.

So, maybe I’m partial to semantic solutions. Maybe I’m nostalgic to some degree. But I do think simplicity enables growth, and in a completely different sense, complexity.


<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>