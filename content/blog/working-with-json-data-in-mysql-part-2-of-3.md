+++
author = ""
categories = []
date = "2016-04-01T10:00:00-07:00"
description = "Implementing document-oriented patterns with the new JSON support in MySQL."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Working With JSON Data In MySQL - Part 2 of 3"
type = "post"
tags = ["JSON", "MySQL", "getting started"]

+++


In last week’s post, [Part 1 of 3](https://benjaminlistwon.com/working-with-json-data-in-mysql-part-1-of-3), we took a look at the JSON data type support added in MySQL 5.7.8. This week, I wanted to look at some of the document-oriented patterns that MongoDB uses so we can see how we might accomplish the same in MySQL.

The goal is not to 100% replicate what Mongo does, but to see which patterns will make the best use of JSON support in MySQL, allowing us to get the best of an SQL store and a document-oriented one.

I also want to tee up next week’s post, where we’ll take a look at how to implement models that make use of the JSON data type in Laravel, as well as how to work with them using the query builder and other mechanisms.

**Warning:** This one’s a bit of a long read. Here’s a high-level TOC.

1. [A Micro-Intro To MongoDB](#intro1)
2. [Square Peg, Round Hole](#squarepeg)
3. [What To Do Then?](#whattodo)
4. [Why Does This Matter?](#whymatter)
5. [Whew!](#whew)

<a name="intro1"></a>

---- 

## A Micro-Intro To MongoDB
If you’re unfamiliar with [MongoDB](https://www.mongodb.org/), I’ll let their [introduction](https://docs.mongodb.org/manual/introduction/) bring you up to speed:

> A record in MongoDB is a document, which is a data structure composed of field and value pairs. MongoDB documents are similar to JSON objects. The values of fields may include other documents, arrays, and arrays of documents.

#### Documents
A document looks like any JSON object you may be familiar with:

    {
        name: "Benjamin Listwon",
        height: 75,
        likes: [ "coffee", "cashews" ],
        pets: [{
            name: "Daytona",
            type: "dog"
            }]
    }

Technically, documents are stored as [BSON](https://www.mongodb.com/json-and-bson), which is basically a binary representation of JSON-esque data structures that allows for a few more data types as well as faster retrieval and indexing.

#### ObjectId
Upon insertion, each document will get a document id, very similar to how `auto_increment` works, but with some metadata encoded into it such as a timestamp. An id looks like this:

    "_id" : ObjectId("54c955492b7c8eb21818bd09")

There’s also information like the machine the document was created on. That metadata is part of the underpinnings of topics like sharding, a strategy for scaling beyond a single DB machine. 

The entirety of an [ObjectId is covered in this document](https://docs.mongodb.org/manual/reference/method/ObjectId/), but I bring it up here because it will facilitate comparisons in our queries.

#### Querying
When we want to query for documents, we would issue a statement like this:

    db.people.find( { "height": 75 } )

The equivalent in SQL would look something like:

    SELECT * FROM `people` WHERE 'height' = 75;

In Mongo, we use dot-notated paths to query embedded objects or documents. Considering our example document above, we could do something like:

    db.people.find( { "pets.name": "Daytona" } )

Finally, boolean queries such as AND and OR are expressed as follows:

    db.people.find( { "name": "Benjamin Listwon", "height": 75 } )
    db.people.find( $or: [ { "name": "Benjamin Listwon" } , { "height": 75 } ] )

<a name="squarepeg"></a>

---- 

## Square Peg, Round Hole
With our whirlwind tour of Mongo under our belt—and before we dive into what the JSON data type will be good at—let’s take a look at an example of something we shouldn’t try to force in MySQL. 

Within the [Data Models Section](https://docs.mongodb.org/manual/core/data-modeling-introduction/), Mongo provides several patterns that are the building blocks for every well-designed Mongo database. There’s a lot to explore in the subtopic “Data Model Examples and Patterns,” and if you’re interested in Mogno, you should definitely check it out when you get a chance. 

For now, let’s focus on [Model One-To-Many Relationships With Document References](https://docs.mongodb.org/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/). This pattern example discusses the relationship of books to publishers. A book may be published by more than one publisher, and publishers certainly publish more than one book.

#### Design 1: Error Prone Subdocuments
As noted in the example, storing a publisher subdocument with the book means we have duplicate data all over the place, and we leave ourselves wide open to errors.

    {
        title: "MongoDB: The Definitive Guide",
        ...
        publisher: {
            name: "O'Reilly Media",
            founded: 1980,
            location: "CA"
        }
    },
    {
        title: "50 Tips and Tricks for MongoDB Developer",
        ...
        publisher: {
            name: "O'Reilly Media",
            founded: 1980,
            location: "CA"
        }
    }

#### Design 2: Books Field May Grow Too Large
If we create a field for the book ids within a publisher document, we potentially have a field that will grow too large, too fast, and may exceed the max document size _(amongst other concerns)_.

    publisher: {
        _id: "oreilly",
        name: "O'Reilly Media",
        founded: 1980,
        location: "CA",
        books: [1234, 5678, ... 0987]
    }

#### Design 3: Publisher Reference(s)
Therefore, after we reason about the data a bit, the best way to store this relationship is with a publisher reference on each book entry. This has the added benefit of affording multiple publishers _(though we could have further discussion about how to record different published editions, dates, etc)_.

    {
        title: "MongoDB: The Definitive Guide",
        ...
        publisher: ["oreilly", "wiley"]
    },
    {
        title: "50 Tips and Tricks for MongoDB Developer",
        ...
        publisher: ["oreilly"]
    }

#### Multiple Queries
A potential downside to the design(s) above is that you must make multiple queries to retrieve the books, and their publishers. There is no notion of JOINing in Mongo. 

So, you’d have to make two queries to get a) books where “oreilly” is the publisher and b) the publisher data for “oreilly.” This gets more complex if you want to do something like “get all the books with publishers founded in 1980.” In SQL, this could be done with some JOINing, albeit a semi-complex one.

#### Design 4: DB References
An alternative is [DB References](https://docs.mongodb.org/manual/reference/database-references/) (DBRef), which will “slurp” the referenced document into the parent document. Let’s re-imagine Design 3 with DBRefs instead:

    {
        title: "MongoDB: The Definitive Guide",
        ...
        publisher: [
            {
                "$ref": "publishers",
                "$id": "oreilly",
                "$db": "LoCcatalog"   // Optional
            },
            {
                "$ref": "publishers",
                "$id": "wiley",
                "$db": "LoCcatalog"   // Optional
            }
        ]
    },
    {
        title: "50 Tips and Tricks for MongoDB Developer",
        ...
        publisher: [
            {
                "$ref": "publishers",
                "$id": "oreilly",
                "$db": "LoCcatalog"   // Optional
            }
        ]
    }

Now, when we execute a query for books with “MongoDB” in the title, Mongo will automatically pull in the referenced documents:

##### Query
  // This is the equivalent of LIKE or %MongoDB%
  db.books.find( { title: /MongoDB/ } )    

##### Partial Result
    {
        title: "MongoDB: The Definitive Guide",
        ...
        publisher: [
            {
                _id: "oreilly",
                name: "O'Reilly Media",
                ...
            },
            {
                _id: "wiley",
                name: "John Wiley & Sons",
                ...
            }
        ]
    } ...

#### Design 5: MySQL Join, No JSON Data
Facilitating many-to-many relationships in SQL might typically use an intermediate or “pivot” table. Continuing the book and publisher example, we’d end up with `book`, `publisher` and `book_publisher` tables.

In order to get a result similar to Design 4 above, we’d do something like:

    SELECT book.title, book..., publisher.id, publisher.name, ...
        FROM book 
        LEFT JOIN book_publisher ON book_publisher.bookid = book.id 
        LEFT JOIN publisher on book_publisher.publisherid = publisher.id 
        WHERE publisher.id IS NOT NULL     // Exclude books without publishers
        AND book.title LIKE "%MongoDB%";   // Don't do LIKE in real world apps!

We’d still have some work to do to coalesce publishers to books, since this will yield a row for each book + publisher combo. You can get fancy with GROUP\_CONCAT and GROUP BY clauses to avoid this, but that may not be what you want either.

#### Design 6: Not A Valid Idea
Assuming we had similar JSON data stored in MySQL rows, we might try to do something like this:

##### This Is PsuedoSQL; Won’t Work
    SELECT book.id, book.jsondoc, publisher.jsondoc 
        FROM book 
        JOIN publisher 
        ON publisher.id IN JSON_EXTRACT(book.bookdoc, "$.publisher")
        WHERE publisher.id IS NOT NULL;

Trouble is, `JSON_EXTRACT` will return an object that is a JSON Array, so `["oreilly", "wiley"]` and there is no easy way to convert that to a value you can use for an `IN` clause, or any other comparison for that matter.

We _can_ compare things that are strings or numeric values, so we could do joins on extracted data that was castable to one of those types. Basically, you can join on scalar values, but not on scalar values within arrays or objects. _(Note: You can, however, run some comparisons on whole arrays or objects themselves.)_

<a name="whattodo"></a>

---- 

## What To Do Then?
Working with JSON data in MySQL is still in its infancy, and I expect the architects of JSON support are observing how it behaves and gets used in practice. That said, MySQL is still a relational database, so it is unreasonable to expect a toolset or behavior like that we find in Mongo.

To make working with JSON data a reality, we’ll need to bridge the world of relational SQL and that of document-oriented storage by selectively extracting data from incoming JSON messages, and utilizing the virtual index technique we looked at in Part 1.

If you are designing an API, you might apply a rigorous schema to filter incoming data, but if you need to remain flexible it is worthwhile to revisit [Postel’s Law](https://en.wikipedia.org/wiki/Robustness_principle)

> Be conservative in what you send, be liberal in what you accept

With that in mind, we need to make the best use of well-tuned relational operations while taking advantage of the new possibilities the JSON data type presents.


#### Complex, Arbitrary Data
Working on [Sir Tracksalot](https://sir.tracksalot.com) I allow API users to send some fairly loosely defined data structures in tracking messages. For example, the most basic track event looks like this:

    {
        "identity": "5eb63bbbe01eeed093cb22bb8f5acdc3",
        "event": "Logged In",
        "details": {}
    }

As you can see, no details were passed, so the event is quite simple. The details object though can be fairly freeform. I have a general recommendation that:
1. Only top-level properties in the details object can act as filters in the tracking UI (e.g. “show me ‘logged in’ events where ‘promo’ is equal to ‘sale123’)
2. Details objects may only be three levels deep
3. Details objects have a max size of X (where X is TBD)

That means someone can send a message like:

    {
        "identity": "5eb63bbbe01eeed093cb22bb8f5acdc3",
        "event": "Logged In",
        "details": {
            "name": "Benjamin",
            "is_tuesday": true,
            "colors": [
                {
                  "name": "blue",
                  "hex": "0000ff"
                }
            ],
            "address": [
                {
                    "type": "home",
                    "street": [
                        "123 Some St",
                        "Apt #400"
                    ],
                    "zip": "12345"
                }
            ]
        }
    }

Add to that the metadata—referer, ip address, user agent, etc—and each document can get pretty sizable.

While I could make up schemata for common objects like addresses, geolocations, or whatever, I’ll never be able to define everything a user could possibly want, nor should I try.

Instead, I am remaining flexible on what I accept, and creating tools to help users make sense of the data they store. It is possible I will build out the query engine to support a query that could match against arbitrary data in the JSON, but not right now.

All of that said, I’m working on strategies to make queries more performant, and to allow users to get more from their data. Here’s some of the goals I have set for storing and retrieving the JSON data.

1. Keep a record of the original document intact, always
2. Optimize for fast retrieval of primary data
3. Enable users to perform intelligent slicing on key data
4. Enable users to filter queries based on top-level “details” data
5. Be flexible, but be performant (don’t do it if it won’t perform)
6. Avoid dependency on caching strategy, but embrace caching

#### Strategy 1: Extract Key Data
One strategy is to use `JSON_EXTRACT` to build indexes on crucial properties in the data. Within the event message, I will extract certain data based on the API specification. Specifically, the following properties, if present, will be extracted and indexed so that JOINs or other complex operations can be performed on them.

    {
        "event_id": "ABC-123",
        "is_user": true,
        "is_logged_in": true
    }

These come from feedback about common things that folks would like to track, that may not be immediately obvious from a message sent to the API. 

For example, if a user logged into a site an chose “remember me” they may come back weeks later and there is no easy way to tell if they are logged in or not if the initial message to the API is not related to authentication.

Just like in Part 1, I will extract those values into an indexed column upon insertion:

    ALTER TABLE `event`
        ADD `remote_event_id` INT(10) UNSIGNED
        GENERATED ALWAYS AS (JSON_UNQUOTE(
            JSON_EXTRACT(eventdoc, '$.event_id')
        ))
        VIRTUAL NOT NULL
    CREATE INDEX remote_event_id_index ON event (remote_event_id);

Great! Now if a user wants to look for that event based on their system’s id, the query is as simple as ``SELECT * FROM `event` WHERE remote_event_id = "ABC-123";``.

We can also use `JSON_EXTRACT` on that property, ``SELECT JSON_EXTRACT(event.eventdoc, "$.event_id") FROM `event```, and MySQL will use the index!

#### Strategy 2: Denormalized Data &  Basic Relationships
Obviously, we should avoid creating too many columns on any single table, and we need to keep overall table and index size in mind. In the case of the event table, having a column for every aspect of the event metadata would be prohibitive. Let’s consider the user agent string for a moment.

    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) 
        AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 
        Safari/537.36"

I’m using [Agent](https://github.com/jenssegers/agent) by Jens Segers to parse the UA string into little bits I can store in the DB. Generally, I need to enable queries like “how many people accessed the site using Chrome last week” or “last month” or “mobile Chrome.”

In order to enable efficient queries on this data, as well as allowing the most flexibility for those using the query tools, I have done this _(yes, it is denormalized for sure)_.

1. Create an `event_browserinfo` table with columns for `ip, browser, browser_ver_major, browser_ver, is_mobile, os, os_ver_major, os_ver_minor, os_ver` and a few more.
2. Store the column values as individual values in the JSON object as well
3. Store the original UA string in the event JSON object

The first point above allows for joins that let us answer questions like “show all events triggered in Chrome.” The key here is we can index the columns in `event_browserinfo` with an index that spans  each row, as the `event_id` will guarantee uniqueness even where all the other values are the same.

    SELECT * from `event` 
        JOIN `event_browserinfo`
        ON event.id = event_browserinfo.event_id
        WHERE browser = "Chrome";

The second point allows for queries within the event table itself. These will of course not be indexed because they are in the JOSN blob, but are useful when we can restrict the candidate rows through other means such as date ranges, user\_id, etc.

  SELECT * from `event` 
      WHERE JSON_UNQUOTE(JSON_EXTRACT(event.jsondoc, "$.browser")) = "Chrome";

The last point simply stores the original string, so we can work with it should new features arise.

#### Strategy 3: Complex Relationships
As noted at the outset, many-to-many relationships are impossible to facilitate in the way Mongo allows. However, if we know the data we wish to relate, we can get smart about producing results. 

If we combine what we can do in MySQL directly, with a bit of work in software, we can avoid the pivot table scenario and get closer to the manner in which Mongo works.

The trouble was that `publisher` was an array in the initial JSON. If we convert it to a string, we can use an `IN` clause to match on.

##### Revised Book Row
    {
        "title": "MongoDB: The Definitive Guide", 
        "publisher": "oreilly, wiley"
        ... 
    }

Now, this will work:

    SELECT book.*, publisher.* FROM book
        JOIN publisher
        WHERE publisher.id 
        IN (JSON_UNQUOTE(JSON_EXTRACT(book.jsondoc, "$.publisher")));

Still, we don’t get to index the publisher values which means we lose some overall performance. Also, applying the JSON functions to obtain the value to search is quite expensive. 

For that, we have to revisit our lengthy join:

    SELECT book.*, GROUP_CONCAT(publisher.jsondoc) FROM book 
        LEFT JOIN book_publisher ON book_publisher.bookid = book.id 
        LEFT JOIN publisher ON book_publisher.publisherid = publisher.id 
        WHERE publisher.id IS NOT NULL 
        GROUP BY book_publisher.bookid;

If we set up our tables as follows, then we can index the id columns in all three, making the above query pretty performant.

##### A Publisher Row
    id => 100
    jsondoc => '{"id": "oreilly", 
        "name": "O'Reilly Media", 
        ... }'

##### A Book Row
    id => 123,
    jsondoc => '{"title": "MongoDB: The Definitive Guide", 
      "publisher": "oreilly, wiley" // same as above
        ... }'

##### Pivot Table
    book_id => 123, publisher_id => 100
    book_id => 123, publisher_id => 999
    book_id => 456, publisher_id => 100

Note that we’ve also converted the publisher array to as string, which lets us continue to perform the basic JOIN using the IN clause above at our discretion.

<a name="whymatter"></a>

---- 

## Why Does This Matter?
Most of the above may seem academic, but it is important to understand the design limitations of working with JSON data in a relational context. There are patterns in Mongo that work brilliantly, but that break down in MySQL because of how documents and columns are indexed respectively. 

#### The Keyword Search Pattern
Let’s consider one last pattern, the [Keyword Search](https://docs.mongodb.org/manual/tutorial/model-data-for-keyword-search/) pattern. Note that this is not a fulltext search, rather a way to match documents based on an array of keywords (think tags).

##### Sample Data
    { 
        title : "Moby Dick" ,
        author : "Herman Melville" ,
        published : 1851 ,
        ISBN : 0451526996 ,
        topics : [ "whaling" , "allegory" , "revenge" , "American" ,
            "novel" , "nautical" , "voyage" , "Cape Cod" ]
    }

In Mongo, you can create what is called a “multi-key index” which in this case basically means that all the keys listed in the `topics` array will get indexed as individual entries that map to this book. _**(As the page notes, if your total possible keyspace is very large, insertions will incur a penalty.)**_

    db.volumes.createIndex( { topics: 1 } )

With that index in place, you can execute a query that looks for books with a given keyword and expect some pretty great retrieval performance.

    db.volumes.findOne( { topics : "voyage" }, { title: 1 } )
    // { title: 1 } means get items with a title

In MySQL, as we’ve already discussed, we’re unable to index the JSON data. Since this is another many-to-many relationship, creating a pivot table with the topic ids mapped to book ids will allow us to index both and perform more efficient joins and selections. 

In fact, this pattern is so prevalent—assigning tags to blog posts, matching user likes to photos, etc—that carefully reasoning about our JSON data means keeping an eye out for spots where incoming arrays or lists will need their own pivot tables.

#### Other Data To Look Out For
There are, of course, other things to look out for. Generally speaking, data in an array that you want to query on _(or sometimes in an object)_, is a candidate for promotion to its own column or relation so you an index against that data.

Geospatial data is a good example. MySQL has [functions for working specifically with GeoJSON data](https://dev.mysql.com/doc/refman/5.7/en/spatial-geojson-functions.html), but extracting that data from incoming JSON documents will allow you to create a more performant index because you can convert the data to numeric data types when you store them.

Geo coordinates typically come in pairs of `[lat, long]`, but so does point data, and polygons or other geometry are often arrays of arrays `[[0,0], [0,10], [10,10], [10,0]]`.

You might also want to keep an eye on incoming formats, and reformat the data to normalize it for queries that need to compare on that data. Timecodes and currency data fall into this bucket. 

If you accept a `price` attribute, you may want to accept whatever data comes in. This could mean `$9.99`, `$.99`, `9.99`, `.99`, `0.99`, `999`. That last is hard to interpret. To assure that all values a comparable, you may want to specify that all currency data is sent in integers only, by capping precision at two decimals and multiplying by 100 `int(9.99 * 100)`. 

However, you may _have_ to deal with conversion from strings or floats yourself if you cannot control the data. If that is the case, thinking about how to format the incoming JSON, and cleaning it up is a must before committing it to the DB.

<a name="whew"></a>

---- 

## Whew!
That was indeed a long one. This background will help us easily move into Laravel and drop this functionality into our models and query builders.

In two weeks, I’ll have a complete implementation of a simple app that uses JSON data in a Laravel project. We’ll take a look at how to build out the book example we’ve been using, with a few simple forms for adding books, publishers and viewing our catalog. That means building out migrations, models and controllers that make use of our JSON data. 

I’ll also throw the functioning code up on GitHub so you can follow along.

If you’ve made it this far, thank you for toughing it out. I promise several shorter articles before the next big one ;-)
