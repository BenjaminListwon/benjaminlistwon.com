+++
author = ""
categories = []
date = "2016-04-28T10:00:00-07:00"
description = "I've been away / busy for a while. Here's a glimpse at some things I've found along the way."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Tidbits"
type = "post"
tags = ["personal", "update"]

+++

Wowzers, have the days simply flown by in April! It has been a little while since my last post, and this one is going to be a brief one to be sure, but I wanted to catch up to what’s been going on this month.

## Reboot!
First up, [May 1st Reboot](http://www.may1reboot.com/) is right around the corner. Just three days left to crank! If you’re launching, relaunching or just breathing new life into something on the web, you should check it out and follow [\#May1Reboot](https://twitter.com/hashtag/may1reboot) to see what our colleagues and community are up to.

## MySQL As A Document Store
If you were following along in my last two posts about using MySQL to store JSON (Part 1 and Part 2) then you may be wondering where Part 3 is. Turns out, MySQL dropped the X Plugin (well, in truth they expanded its capabilities) a couple weeks back, and now you can use MySQL as a proper document store in client applications, just like you’d use Mongo or similar.

There’s some documentation about [MySQL as document store](https://dev.mysql.com/doc/refman/5.7/en/document-store.html) and [authoring code](https://dev.mysql.com/doc/refman/5.7/en/mysql-shell-interactive-code-execution.html) to make use of this tremendous new functionality. It is crazy that it comes in a [point release](https://dev.mysql.com/doc/relnotes/mysql/5.7/en/news-5-7-12.html), but I am stoked at the possibilities of being able to use MySQL for key-value, relational and document-oriented storage. I don’t think I’ll ever run up against resource limitations in my personal projects, so it is a huge win to not have to worry about deploying two or three flavors of DB for a single project.

At any rate, this new functionality means my previous project example, that sort of shoehorned documents into a table, is no longer the best way to work with MySQL document storage. Currently there is no PHP (thus no Laravel) bridge to the X Plugin or the shell, but I have been working on executing shell commands using the [javascript shell](https://dev.mysql.com/doc/refman/5.7/en/mysql-shell-tutorial-javascript.html) interface by writing some code sugar around PHP’s [program exec functions](http://php.net/manual/en/ref.exec.php). _(If I were clever enough, I’d write some sort of library to do the “right” thing, but I’m not.)_

So, stay tuned.

## 3, 2, 1 Linkage
While jamming on my May 1st Reboot project, I’ve been tackling a host of different problems. As a result, I’ve been learning **loads** of new things. Here’s a few links to some projects, code and info I found along the way.

#### In-Browser Rich Text Editors (RTE)
I needed an RTE that lets users create and edit basic documents, both on an edit page and occasionally in-place on a given page or template. The leading contenders are:

* [Quill](http://quilljs.com/) - a themable RTE with collaborative, simultaneous editor functionality, a decent API and  all the expected core functionality
* [Epic Editor](http://epiceditor.com/) - a markdown editor loaded with features, no external dependencies, and a friendly dev API
* [Summernote](http://summernote.org/) - a Bootstrap “powered” editor that comes with loads of features, a great API, support for “floating” editor instances and hinting for things like @mention typeahead

Also, very worthy of mention is [Stackedit](https://github.com/benweet/stackedit) if you want a markdown editor with live-preview, offline editing, LaTeX math expressions and other great features. It just did not meet my requirements.

There are some other terrific offerings out there, but I am looking for something 100% OSS where possible, and without additional operating costs. [Textbox.io](https://textbox.io/) is a crazy feature-rich editor with a pretty affordable cost. It is also the only editor I’ve ever found that supports cut-and-paste of 99% of Word and Excel markup. There’s also [CKEditor](http://ckeditor.com/) which is free OSS, but also has a license option that provides support and assistance. If you want something that is basically Word on a web page, this is it.

#### Firewall For Dummies (Like Me)
Let’s say you want to isolate your DB machine from the world at large, communicating only over private interfaces and only on port 3306 (or whatever your DB’s go-to port may be). I used to fiddle with iptables and its arcane rule syntax to get that job done. 

But now there’s [UncomplicatedFirewall](https://wiki.ubuntu.com/UncomplicatedFirewall) (UFW) in Ubuntu! Here’s a [little tutorial](https://www.howtoforge.com/tutorial/ufw-uncomplicated-firewall-on-ubuntu-15-04/) on the basics that’s a bit more digestible than the raw docs. _(Ignore the fact that it’s 15.04, the concepts are the same.)_

Currently, I deploy machines with Forge + Linode, and then SSH into the machines to finish up with tasks like UFW configuration. I’m working on some post-install scripts over at [Forge Recipes](http://forgerecipes.com/) which I’ll write about later.

#### PouchDB
The cuter, Australian cousin of CouchDB? Sort of.

[PouchDB](https://pouchdb.com/) is a client-side JavaScript database that provides offline storage and syncs to a CouchDB (or couch-like) interface when available. It removes all the headache of sync, and let’s you focus on the app you’re building.

If you don’t want to futz with Couch for whatever reason, [Nolan](https://twitter.com/nolanlawson) has also written a [PouchDB Server](https://github.com/pouchdb/pouchdb-server) that has the same API and slots right in as your backend.

Highly recommend a look if document integrity and/or offline editing is critical for your app.

## Newsletter
Last but not least, I will start sending out a newsletter two weeks from now. My apologies to all the great folks that have subscribed and are simply lost in life without such infotainment :)

Seriously though, I’d [love to hear](mailto:ben@benjaminlistwon.com) what you’d like to read about, learn about, or otherwise see in your inbox on a regular basis. I promise to keep it light, short and jam-packed with goodies so you get a high return on your investment.

Thanks again for signing up, and for your support!


