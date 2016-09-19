+++
author = ""
categories = []
date = "2016-04-06T10:00:00-07:00"
description = "A follow-up on the brief series on MySQL + JSON, with new resources and information."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #007: An Update On MySQL + JSON"
type = "post"
tags = ["In Brief", "MySQL", "JSON"]

+++


After publishing [Part 2](https://benjaminlistwon.com/working-with-json-data-in-mysql-part-2-of-3) of a series on JSON data in MySQL last week, a few folks reached out to me with some great feedback. Not only that, but they shared some resources I thought would be beneficial to pass on.

---- 

[Morgan Tocker](https://twitter.com/morgo), the Product Manager that works on JSON support in MySQL pointed me toward the [MySQL Server Team’s blog](http://mysqlserverteam.com/), which is more approachable than the docs for topical matters and directed discussion. Specifically he highlighted the [JSON category](http://mysqlserverteam.com/category/json/), which has several great posts on everything from using path expressions to ‘upgrading’ json data previously stored in TEXT data columns to JSON data columns. Definitely worth perusing.

As I was Googling around, I also found [this slide deck](http://www.slideshare.net/morgo/mysql-57-json) from Morgan, running through the JSON support in the 5.7 series, as well as generated columns and some other goodies. A great intro.

---- 

Morgan also mentioned the use of transactions, and the possibility of using a transaction to sort of bridge the gap between de-normalized JSON docs and normalized relational data. I think this is a pretty terrific point, and one that I will explore in more depth in Part 3, as I head into Laravel.

If we took a look back at the example where we wanted to “cast” a JSON array into a string, the quick version would look something like (in pseudocode):

    DB::transaction(function () {
        $publishers = DB::select('SELECT JSON_EXTRACT
            (book.jsondoc, "$.publisher") 
            FROM book WHERE id = :id', 
            ['id' => 123]);
    
        $publishers = join(',', $publishers)
    
        DB::update('UPDATE book JSON_REPLACE
            (book.jsondoc, "$.publisher", :publisher)
            WHERE id = :id',
            ['publisher' => $publishers, 'id' => 123]);
    });

That would replace the publisher array, with the stringified form. (I know, I know, it's just thinking-out-loud pseudocode.)

##### Before
    id => 123,
    jsondoc => '{"title": "MongoDB: The Definitive Guide", 
        "publisher": ["oreilly", "wiley"]
        ... 
    }'

##### After
    id => 123,
    jsondoc => '{"title": "MongoDB: The Definitive Guide", 
        "publisher": "oreilly, wiley"
        ... 
    }'

Obviously, transactions can be used for much more, but I’ll leave that to the sample code for Part 3.

---- 

Craig Russell, an Architect at Oracle, also reached out with a pointer to [Database Jones](https://github.com/mysql/mysql-js/tree/master/database-jones), a package that lets you build database apps in Node.js. Check out this killer feature list:

* Simple API for create, read, update, delete
* Bulk operations for high performance
* Support for ACID transactions, both explicit and implicit
* Flexible mapping from JavaScript objects to relational tables
* A fluent Query language using domain model tokens
* Default mapping of relational tables to simple objects
* Complex mapping of relational tables to complex objects
* Asynchronous API using well-known node.js callback patterns
* Promises/A+, allowing easier management of callbacks
* Connection pooling, allowing in-process scale up

Using Node with a backing store that can accept and work with JSON data natively is a obvious pairing.

I’ve not got a Node project going at the moment, but this package looks really well thought out, comprehensive, and with an API that is familiar enough to be very approachable. I’m going to have to find an excuse to try it out!
 
---- 

A couple of folks asked about, or sent recommendations for, visual DB tools for Windows and Mac environments, and their support for the JSON data type. 

I don’t personally use a visual db browser, but I would assume that [MySQL Workbench](https://www.mysql.com/products/workbench/) is up-to-date.  This is where I’d start, since it is free, right format he source, and runs on Windows, OS X and Linux.

Other folks mentioned [HeidiSQL](http://www.heidisql.com/) for Windows (which added support last November), and there was glowing praise for [Querious](http://www.araelium.com/querious/) on the Mac (Querious runs around $50 for a license).

---- 

Thanks again to everyone who wrote in, and I hope that some of the above resources help you along in your journey with JSON and MySQL.