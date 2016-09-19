+++
author = ""
categories = []
date = "2016-04-07T10:00:00-07:00"
description = "It's late, you're tired, and Laravel keeps eating your DB ids. WTF?!?"
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #008: The Case Of The Disappearing Id Values"
type = "post"
tags = ["In Brief", "Laravel", "MySQL"]

+++

It's midnight, and for the past hour I’ve been trying to figure out why I was unable to echo the correct id values for rows of data in my blade templates. I thought I was going crazy. Here’s the relevant template snippet, and its output:

##### feed/index.blade.php

    <ul>
    @foreach ($feeds as $feed)
        <li><a href="/feed/{{ $feed->id }}">{{ $feed->title }}</a></li>
    @endforeach
    </ul>

##### Output
    <ul>
        <li><a href="/feed/0">BBC News - Business</a></li>
    </ul>

There is obviously a value in the object sent to the template, which meant the id attribute was present at least. But why was it being set to zero?

I added some more feed entries, to get a few more id values, but now they were all being set to zero. 

Puzzled, I recalled that you can set a `$hidden` array in your model, to hide attributes on serialization. However, that would simply remove those key/value pairs from the resulting array or JSON object.

## Where’s The Magic?
So I started debugging inside Illuminate’s base Model class by looking at what happens during serialization with the `toArray()` method.

The key part was in the function `attributesToArray()`. From the comments:

> Next we will handle any casts that have been setup for this model and cast the values to their appropriate type. If the attribute has a mutator we will not perform the cast on those attributes to avoid any confusion.

That “handle any casts” is accomplished by this function:

##### Illuminate/Database/Eloquent/Model.php
    public function getCasts()
    {
        if ($this->getIncrementing()) {
            return array_merge([
                $this->getKeyName() => 'int',
            ], $this->casts);
        }
        return $this->casts;
    }

`getCasts()` checks to see if the table has a “truthy” value for `$this->incrementing`. By default, it is true, assuming that your `id` (or other) column will be auto-incrementing, which in turn implies it is an integer. <sup>[\[1\]](#fn1)</sup>

As a result, it executes an `int` cast on the id attribute.

## Solution Time!
The above cast is bad news if you don’t have an integer id column. Because I’m using hashed values of unique identifying info, my Feed schema looks like this:

##### Feed Schema
    Schema::create('feed', function (Blueprint $table) {
        $table->char('id', 64);
        ...
        $table->primary('id');

So how do we keep Eloquent from munging our id fields? Two ways.

If you have an model instance around, you can call `$model->setIncrementing(false)`. But, in all likelihood you just want to specify it at the class level and call it a day. To do that, just add this to your Model class(es):

##### Feed.php
    class Feed extends Model
    {
        public $incrementing = false;

Easy as pie! Now I get this _gorgeous_ result:

##### Output
    <ul>
    <li><a href="/feed/accddd6be48cda351f6de300ea8edcd4b616c2582197136157f88a61d63ebbd8">BBC News - Business</a></li>
    </ul>

As always, hope it helps someone get unstuck!

----

<a name="fn1">[1]</a>: FWIW, while I understand the convenience behind the design decision to assume incrementing is true, I think it is a bad idea. A better solution would be to examine the table schema for a column designated as `$table-\>increments()`, then set this boolean to true.