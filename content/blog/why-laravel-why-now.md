+++
author = ""
categories = []
date = "2016-03-04T10:00:00-07:00"
description = "My journey to Laravel, why it fits my needs, and why it may or may not be right for your next project."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Why Laravel? Why Now?"
type = "post"

+++

_(Update: Can't believe I forgot Laracasts when I wrote about the [Laravel ecosystem](#ecosystem) below.)_

First, a confession. I’ve only been doing “serious” Laravel development for about four or five weeks now. 

In fact, it has been about a decade since I did any serious PHP development at all.

I’m still getting my hands dirty digging through how Laravel works, and I’m certainly a way off from “mastery” of the framework, but the single best way to learn a new language, technology or framework is to have a project, a timeline, and to just get cracking.

So yeah, with that, let’s continue.

## Let's Take A Step Back
Ages ago (1998 to be exact), PHP was the first language I learned (after JavaScript) as I realized how crucial it was for a designer to be fluent in the development side of things. Not only was it relatively easy to pick up, it was also the type of language that fed curiosity by gently bumping up against databases, caching, OOP and more.

As time went on, I ended up working on problems that PHP was not well-suited to solve. And so, I shifted to Python, where I spent the last decade or so.

Python could solve diverse problems, where PHP felt like the language you built a website with. That diversity meant that my own growth could expand as well, taking on larger problems, greater challenges and, crucially, I could keep learning.

Python, too, has its practical limits. A close friend and unofficial mentor introduced me to Go. As a language, Go has loads of appeal. 

_([This article on Moovweb](http://www.moovweb.com/blog/survival-of-the-fittest/) is eerily similar to my own journey, and does a much better job explaining it. If anyone knows who the author is, [let me know](mailto:ben@benjaminlistwon.com) and I’ll add a credit here.)_

But as I fiddled with Go I realized I had, at some point, moved too far away from doing the things I liked. Large, challenging problems provide tremendous reward when you tackle them, but I missed being at the nexus of developing a product and watching a  person use it. I missed the human aspect of development.

Some might call this the interface, or UX, or HCI or whatever, I simply think of it as __the goal__. 

It is a goal we all share as makers, whether you make toboggans, websites or artisan cocktails. It is the pride in the craft, the journey and the moment when someone has an actual emotional reaction to the thing you’ve built.

## Where’s This Going? 
“Hey Ben,” I hear you saying, “What’s all this got to do with Laravel, eh?”

The short answer: I wanted to get back to just building and shipping products.

Over the last few years I've gotten comfortable building sites in Python and Flask. But, there's still a lot of boilerplate work you have to do to get a Flask app out the door. 

_(In theory I could have collected all that work into a repository I could reuse from one project to another, but I'm not really clever enough to get it all abstracted appropriately.)_

There was too much junk keeping me from actual making. I didn’t want to maintain my own framework, spend all day writing a database abstraction layer or wrestle with nginx configurations.

Finally, last November, I started to look around to see if someone had done that work on top of Flask, and I started getting some Laravel mentions in my search results. When 5.2 shipped in late December, I put a pot of coffee on, buckled up and took some time to go down the rabbit hole. 

_(BTW, If you looked at Larval in the 4.x days, as I did once, the 5.x series, especially 5.2, are night-and-day different. Go check it out.)_

Here’s what stood out, and led to my conversion this past January.

## Expressivity / Expressiveness
These words kept popping up, and, to be honest, I was skeptical at first. PHP itself is notoriously “unexpressive” in nature. Some folks have actually [quantified the expressivity](http://redmonk.com/dberkholz/2013/03/25/programming-languages-ranked-by-expressiveness/) of common languages, and [PHP does not fare well](http://hammerprinciple.com/therighttool/statements/this-language-is-expressive).

The best summary of expressivity I have seen is from the above article from Moovweb, 

> Design patterns exist to compensate for a programming language's lack of expressiveness.

Crucially, this speaks more to a developer’s ability to _be expressive_ in a language than the expressivity (or lack thereof) of a language’s syntax.

Robin Winslow has a great post about [writing expressive code](https://robinwinslow.uk/2013/11/22/expressive-coding/) that speaks to this notion.
 
A great example of the expressivity of Laravel comes the the [variety of handy methods](https://laravel.com/docs/5.2/eloquent-collections#available-methods) that collections provide. Coming from Python, so many of these are comfortably familiar (`zip`, `slice`, `map`), that the transition was a lot easier. 

And some are great additions, like `toJson` being available without needing to invoke a separate method like `json_encode($collection)`. The latter is still readable for sure, but the encapsulation of that expression in a callable property is, for me, far more preferable.

The fact that `all` will give you back more than one object and `first` will give you a single object is so subtly intuitive that you don’t even think about the ability to iterate over the former and not the latter. 

Delivering on that implicit expectation is expressivity at its finest.

## Reducing Complexity
Not entirely unrelated to the above, simplifying complex operations is a boon to development time and to the legibility of a developer’s intent. 

Not that all code should be over-simplified, but that, where possible, we should strive to reduce how much time there is between someone else reading our code and understanding what it does.

Perhaps the clearest example of what you get out of the box comes from being able to work easily with Eloquent relationships. Consider this example [from the docs](https://laravel.com/docs/5.2/eloquent-relationships#many-to-many):

  $roles = App\User::find(1)->roles()->orderBy('name')->get();

There’s _a lot_ of code under the hood to make this work as expected. That’s code I’ve written before in Python, and that I’ve experienced (unfavorably) in lots of other ORMs.

Sure, there’s still some part of my brain that is screaming about more complex SQL relationships and the ability to control those statements. But that stuff isn’t what gets a product out the door and in front of people that will give you feedback and help you grow to the point where any of that matters in the first place.


## Developer Friendly Integrations
Whether it is an integration with something like Redis or memcache, or with a third party service such as Stripe or Rackspace, Laravel's framework ships with API wrappers that developers love to use. And, almost always, if the integration you're looking for isn't included in the Laravel core, it is easily obtained from Github or [Packalyst](http://packalyst.com/). 

For example, [given the recent news about Mandrill](http://blog.mandrill.com/important-changes-to-mandrill.html), it is great comfort to know you can use the other builtin interface to Mailgun, or go out and find packages for Postmark, Sendgrid and more. 

Other frameworks boast loads of integrations as well, of course. But one thing that sets Laravel apart is the consistency of working with third party APIs as a result of the service container and Service Providers. 

When writing code for Flask, I often had to learn about the way a particular module was written, in addition to the service's API itself. 

In Laravel, I find I am spending much less time negotiating a given service provider's interface, allowing me to get an integration up and running much more quickly.

That consistency comes form the fusion of a few things:
1. A well documented, well tested service provider framework
2. A strong, approachable community that support the framework, its packages, and those that use them
3. Relentless consistency provided by shared underlying objects in the framework

The combined net effect of that consistency and not having to learn/relearn a whole new interface with each integration, coupled with choices developers already use, means that the time it takes to integrate is not compounded exponentially with each new integration.

Think about how much time and effort you have sunk into wrapper X for such-and-such an API. Bleh.

<a name="ecosystem"></a>
## The Laravel Ecosystem
Using [Homestead](https://laravel.com/docs/5.2/homestead) to manage virtual environments on your development box could not be easier. I remember when configuring and using a local VM was a configuration nightmare and a resource luxury all at once. Now, I don’t know how I could get things done without [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/wiki/VirtualBox).

Together Laravel, [Forge](https://forge.laravel.com) and [Envoyer](https://envoyer.io/) make the process of development to deployment as quick and painless as possible. I cannot understate how great this entire process is. Couple the deployment process with the fact that it will deploy to AWS, DigitalOcean and/or Linode, and you have great options regardless of your skill level or price point.

[Lumen](https://lumen.laravel.com/) is a pared down version of Laravel that makes API creation pretty much dead simple. It compares pretty directly with something like [flask-restless](https://flask-restless.readthedocs.org/en/stable/) for those also coming from the Flask world. One bonus though is that code written for Lumen is portable to Laravel proper, should you need to do so, because the underlying framework is shared.

[Ottomatik](https://ottomatik.io/) (“testimonialized” by Taylor Orwell) makes backups of your machine instances, and your data, dead simple.

[Laracasts](https://laracasts.com/) and the [discussion forums there](https://laracasts.com/discuss) should be your first stop (often the only stop you'll need) if you are looking for details on the framework, how to solve practical problems with it, or just about anything in the Laravel world. [Jeffrey Way](https://twitter.com/jeffrey_way) does an incredible job with every video he puts out, and the entire site is an invaluable resource for community building as well. _(Oh, and [Taylor Otwell](https://twitter.com/taylorotwell) has been known to put together some videos as well ;-)_

And the list kind of goes on and on.

I will, however, acknowledge there are some things that still need manual doing / tweaking. 

For example, the default Forge deployment will install and run MySQL, postgres, memcache and redis on top of nginx, php-fpm, etc. It is unlikely you will want both MySQL and postgres, for example, and also quite possible you won’t want either on the same machine as your web server.

Forge allows you to use deployment scripts to take care of some of these tasks, but you still have to do some digging on [Forge Recipes](http://forgerecipes.com/recipes) or similar.

Some things, like creating a VPN, you just kind of have to do yourself though. Which is fine, because the aim of Forge or Envoyer is not to cover every situation, but the most common ones. And for that, they are perfect.

## Ideas To Reality
All of the above seek to minimize the time from idea to functioning product. That means developers, designers and product creators of all stripes can focus more on the quality of the product they are making, and worry far less about the particulars of how it gets done.

I’m certain that advocates for Rails or Django or Cake or whatever can make similar (or better) points in support of their framework of choice. And that is fine. This post is not intended as a mandate for Laravel, but as documentation of the beginning of a new journey for me both technically and professionally.

For me personally, Laravel gets me back to that critical point where a product gets used by people. It challenges me to deliver something that will have a meaningful, direct impact for someone in their daily life.

And that is a challenge I’ll gladly take up any day.

