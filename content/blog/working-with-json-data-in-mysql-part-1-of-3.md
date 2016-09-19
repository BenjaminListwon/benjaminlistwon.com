+++
author = ""
categories = []
date = "2016-03-23T10:00:00-07:00"
description = "An introduction to MySQL's new JSON data type, and the functionality to work with it."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Working With JSON Data In MySQL - Part 1 of 3"
type = "post"
tags = ["JSON", "MySQL", "getting started"]

+++

This is the first in a series of posts about the MySQL JSON data type, how it compares to working with a document-oriented store like MongoDB, and how we can make use of it in the Laravel framework.

* Part 1 is a quick look at the data type itself, and some of the functions available to work with that data. Specifically, we’ll focus on what kind of data to store and how to work with it, regardless of framework.  
* In Part 2 we’ll walk through which MongoDB patterns can be replicated in MySQL with the JSON type, as well as what can’t. We’ll also check out some alternative strategies for document-oriented storage using MySQL as a backing store.  
* Lastly, Part 3 will focus on using the JSON data type in Laravel applications, what contexts it is best suited for, and I’ll take a stab at some simple code you can use to extend Eloquent and Query Builder to work more fluently with JSON data.

## The JSON Data Type
First introduced in MySQL 5.7.8, the [JSON data type](https://dev.mysql.com/doc/refman/5.7/en/json.html) is a specialized binary column type, similar to a `blob`, but with added machinery to optimize the storage and retrieval of values from a column typed as `json`.

If you check out the docs, you’ll notice there’s some great built-in functionality such as automatic validation, normalization of JSON documents and autowrapping of values. There’s also one crucial restriction, `JSON columns cannot be indexed`, which we’ll take a look at below.

The good news is, a column of type `json` basically “just works” the way you’d expect it to.

## Storing JSON Data
Chances are you’ll have a JSON structure in your code that you will simply insert into the database. That said, it is also possible to send other data types to MySQL, and to [utilize a JSON creation function](https://dev.mysql.com/doc/refman/5.7/en/json-creation-functions.html) to convert the data for you.

For the rest of this series I’ll be assuming we are simply storing a valid JSON string in our `json` column when we perform an insert, but you can just as easily use the above-mentioned functions to coerce different types of data.

By way of more concrete discussion, here’s an example of an event object for the API I’m building for [Sir Tracksalot](https://sir.tracksalot.com):

    {
        "identity": "5eb63bbbe01eeed093cb22bb8f5acdc3",
        "event": "Added to Cart",
        "details": {
            "itemId": "THX-1138",
            "cartId": "LUH-3417"
        }
    }

This document can go straight into the database as a record of the message that was sent to the API. This is handy because we can keep the original document around, unaltered, and retrieve or transform it at any future date.

In practice I add some more metadata to the document before committing it to the db. It ends up looking something more like this sample:

    {
        "ip": "10.0.0.1", 
        "url": "https://sir.tracksalot.com/api/v1/event",
        "referer": "https://a.webstore.com/cart/add", 
        "userAgent": "Mozilla/5.0 (iPad; CPU OS 9_2_1 ... Mobile/13D15",
        "eventBody": {
            "identity": "5eb63bbbe01eeed093cb22bb8f5acdc3",
            "event": "Added to Cart", 
            "details": {
                "itemId": "THX-1138",
                "cartId": "LUH-3417"
            } 
        }
    }

We’ll use the above as we discuss what values to pull out for indexing, how to optimize queries around something like “hits from IP = xyz” and what items belongs in our JSON document versus what should get a column of its own.

## A Quick Note On Schemata

For folks new to storing JSON data directly in a DB, one thing that may seem a bit off is that there is no inherent schema that the data must adhere to. Thus, a single `json` column can have values like:

    {"name": "Ben"}
    {"name": "Ben", "color": "taupe"}
    {"animal": "cat"}
    {"name": "Ben"}
    {"aList": [1, 2, 3]}
    {"name": "Ben", "color": 5}

Different sizes _**(sometimes dramatically)**_, different or non-existent keys or values, completely different document structures, and more are all possibilities in a `json` column.

There are ways to enforce document contents _**(in MySQL, Mongo and other document-oriented stores)**_ that we’ll take a look at in Part 2, but for now we’ll assume that we’re doing some level of structural work elsewhere in our code.

## Querying Against JSON Data
There’s a handful of [JSON search functions](https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html) at our disposal for `SELECT` statements, 


#### JSON\_EXTRACT
Perhaps the function we’ll turn to most is `JSON_EXTRACT`. It is efficient, in the sense that it looks for values at a specific path, and will default to index lookups when we establish them later on.

Considering our example document from above, we’d use it like:

    SELECT * FROM `event` WHERE 
        JSON_EXTRACT(eventdoc, "$.ip") = '10.0.0.1';

* `event` is the table name
* `eventdoc` is the `json` column

This will, of course, return all the rows that match that IP. _**(If we wanted to capture just this row, we still have some work to do. More on that below.)**_

Accessing properties further down the JSON hierarchy is pretty straightforward. We simply use dot notation to create a path to the key we’d like to match on. For example:

    SELECT * FROM `event` WHERE 
        JSON_EXTRACT(eventdoc, "$.eventBody.identity") = 
        '5eb63bbbe01eeed093cb22bb8f5acdc3';

With this, we can get all the events triggered by the given user identity, a unique identifier supplied by the remote web app. 

As you’d expect, `AND` clauses work just as they would normally. The following gets all the events triggered by the specified user identity, that came from the specified IP.

    SELECT * FROM `event` WHERE 
        JSON_EXTRACT(eventdoc, "$.ip") = '10.0.0.1' AND
        JSON_EXTRACT(eventdoc, "$.eventBody.identity") = 
        '5eb63bbbe01eeed093cb22bb8f5acdc3';

#### JSON\_CONTAINS\_PATH
Another common operation is seeing if a record has a particular key present, often in conjunction with the above. Consider the case where we want to see all the events which contain additional metadata provided by the application in the `details` object:

    SELECT * FROM `event` WHERE 
        JSON_CONTAINS_PATH(eventdoc, 'one', 
            "$.eventBody.details");

Here, the `'one'` indicates we want a boolean `OR` for path arguments. This value can also be `'all'` for an `AND` operation, such as:

    SELECT * FROM `event` WHERE 
        JSON_CONTAINS_PATH(eventdoc, 'all',
            "$.eventBody.details.itemId"
            "$.eventBody.details.cartId");

#### JSON\_CONTAINS
`JSON_CONTAINS` is less straightforward than `JSON_CONTAINS_PATH` oddly enough. It matches presence based on the type of object it is searching for; scalar, array, object, etc. Given our sample construct, the following will be true:

    SELECT * FROM `event` WHERE 
        JSON_CONTAINS(eventdoc, JSON_QUOTE('THX-1138'),
            "$.eventBody.details.itemId");
    
    SELECT * FROM event WHERE 
        JSON_CONTAINS(eventdoc, '{"itemId": "THX-1138"}',
            "$.eventBody.details");

* The use of `JSON_QUOTE` in the first example is the same as writing `‘“THX-1138”’`, it just feels a little less messy. 
* The first query matches a) a string value, b) the string `THX-1138` and c) its presence at the path `eventBody.details.itemId`
* The second matches a) the entire object represented by `{"itemId": "THX-1138"}`, b) the value for that key being a string and c) its presence at the path `eventBody.details`

These will be false:

    SELECT * FROM event WHERE 
        JSON_CONTAINS(eventdoc, JSON_QUOTE('THX-1138'),
            "$.eventBody.details");
    
    SELECT * FROM event WHERE 
        JSON_CONTAINS(eventdoc, '1138',
            "$.eventBody.details.itemId");

* The first fails because the string value `THX-1138` is not an direct descendant at the path `eventBody.details`
* The second fails because `JSON_CONTAINS` is not performing substring searches on values. It looks for an exact type _and_ value match.

#### JSON\_SEARCH
That last case above, where we want to match a partial string, or we just need to find a string but we may not know the path, is a perfect use case for `JSON_SEARCH`. This function is noticeably slower on large docsets, given the fact that it is searching on an unindexed column.

`JSON_SEARCH` returns path expressions, so it makes its use in `WHERE` clauses a little bit funky. It feels like it should return truthy values when a search matches a row, but it is actually expected to be used as part of a test for truthiness.

For example, this just nets you loads of warnings about invalid values for casting:

    SELECT * FROM event WHERE 
        JSON_SEARCH(eventdoc, 'all', '1138');

A note, before we go further, `all` and `one` function very differently in `JSON_SEARCH`.
* `one` will return only the first path that matches in any single JSON document.
* `all` will return a list of all the paths that match in any single JSON document

In practice, using it to test against a path is no better than using `JSON_CONTAINS`:

    SELECT * FROM event WHERE 
        JSON_SEARCH(eventdoc, 'all', '1138') 
            = '$.eventBody.details.itemId';

Thus, in order to use it in a manner such as “If the value ‘abc’ is in the JSON string …” then you must write a query more like:

    SELECT * FROM event WHERE 
        JSON_SEARCH(eventdoc, 'all', '1138') 
            IS NOT NULL;

This will return all the rows that contain the value `1138` in _any_ location in the document.

That is still matching on an exact value. Thus the above would return an empty set in our example row. If you require string fuzziness, you can use the same operators as you would in a `LIKE` clause, namely `%` and `_`. From the docs “% matches any number of characters (including zero characters), and \_ matches exactly one character.”

So, to match our record, we could write:

    SELECT * FROM event WHERE 
        JSON_SEARCH(eventdoc, 'all', '%1138%') 
            IS NOT NULL;

#### JSON\_KEYS
I’d be incomplete if I didn’t mention `JSON_KEYS` here. It is not very useful in a `SELECT` context as it returns a JSON array of keys at a given path depth _**(defaults to root if no path is given)**_. 

It is, however, handy if you want to test if an object has all the keys you need in a document. For example:

    SELECT * FROM `event` WHERE 
        JSON_KEYS(eventdoc) = 
            JSON_ARRAY('ip', 'url', 'referer', 'userAgent', 'eventBody');

Note that we use `JSON_ARRAY` here in the equality test, because `JSON_KEYS` we need to compare JSON arrays and MySQL will take care of all the ordering, etc.

## Indexing And Efficiency
You’ve no doubt worked out by now that some of these queries have the possibility of getting really slow on large datasets. As mentioned a couple of times above, indexing isn’t an option for JSON data columns, so we have to work around that limitation to start optimizing query plans.

[This tremendous article](http://rpbouman.blogspot.com/2015/11/mysql-few-observations-on-json-type.html) by [Roland Bouman](https://twitter.com/rolandbouman) does a great job explaining how to go about creating generated columns that we can use for indexes. The [MySQL docs on this](https://dev.mysql.com/doc/refman/5.7/en/create-table.html#create-table-secondary-indexes-virtual-columns) are a little less approachable for me personally, but give you a good idea of how the machinery works.

Roland’s example, found near the end under the heading “JSON Columns and Indexing Example,” is perfect if our documents will have an `id` or other unique attribute within the document itself. However, in the case of our event example, we are maintaining the ids for each entry in a typical `id` column, such as:

    CREATE TABLE event (
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `eventdoc` json NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB

We could inject the value of `id` into the JSON document, but that’s sort of moving backwards. 

So, what if you want an index on something that is not unique in each document. For example, let’s say we wanted to do fast lookups on events by IP address.

    SELECT * FROM event WHERE 
        JSON_EXTRACT(event, "$.ip") = '10.0.0.1';

If we do an explain on that query, we see that it is going to be pretty inefficient as the table grows:

    mysql> EXPLAIN SELECT * FROM `event` WHERE JSON_EXTRACT(event, "$.ip") = '10.0.0.1';
    +----+-------------+-----------+------------+------+---------------+------+---------+------+------+----------+-------------+
    | id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
    +----+-------------+-----------+------------+------+---------------+------+---------+------+------+----------+-------------+
    |  1 | SIMPLE      | event     | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1139 |   100.00 | Using where |
    +----+-------------+-----------+------------+------+---------------+------+---------+------+------+----------+-------------+

First we’ll add the virtual column by extracting the IP value out of the JSON documents. Note that we use `JSON_UNQUOTE` here because we want the data to fit into the varchar column of length 15. _**(An IPv4 string can be 15 characters in length `aaa.bbb.ccc.ddd`, but the JSON value will get extracted as `"aaa.bbb.ccc.ddd"` which is too long.)**_

    ALTER TABLE `event`
        ADD `ip` VARCHAR(15)
        GENERATED ALWAYS AS (JSON_UNQUOTE(
            JSON_EXTRACT(eventdoc, '$.ip')
        ))
        VIRTUAL NOT NULL

Then we create our index.

  CREATE INDEX ip_index ON event (ip);

Finally, our query plan should improve.

    mysql> EXPLAIN SELECT * FROM `event` WHERE JSON_EXTRACT(eventdoc, "$.ip") = '10.0.0.1';
    +----+-------------+-----------+------------+------+---------------+----------+---------+-------+------+----------+-------+
    | id | select_type | table     | partitions | type | possible_keys | key      | key_len | ref   | rows | filtered | Extra |
    +----+-------------+-----------+------------+------+---------------+----------+---------+-------+------+----------+-------+
    |  1 | SIMPLE      | event     | NULL       | ref  | ip_index      | ip_index | 47      | const |    2 |   100.00 | NULL  |
    +----+-------------+-----------+------------+------+---------------+----------+---------+-------+------+----------+-------+

Voila!

## Whew, Wrapping Up
If you’ve made it this far, you’re a trooper. Thanks for following along.

As you can see, the JSON data type is pretty flexible, and the good folks on the MySQL dev team have packed a lot of great functionality in, right from the start. As Roland Bouman wrote in his post, with such a great start, the future of JSON in MySQL looks pretty bright.

In the next segment, we’ll take a look at some of the patterns that might be familiar to those who have worked with MongoDB or other document-oriented stores, as well as what can be done in MySQL that can’t be done in Mongo. 

We will also start to look at how enforcing a document schema might work, and what tools are out there to help make that job easier.

I expect to drop the next segment around the same time next week, so stay tuned, and thanks again for visiting!
