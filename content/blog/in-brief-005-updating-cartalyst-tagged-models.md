+++
author = ""
categories = []
date = "2016-03-11T10:00:00-07:00"
description = "Using a migration to update the base model used by Cartalyst's tags package for Laravel."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #005: Updating Cartalyst Tagged Models"
type = "post"

+++

I was fiddling with the blog over the last few days, updating the look-and-feel a little bit, as well as doing some housekeeping on the back end. One thing I wanted to do was migrate my posts from an old model `PostModel` to just plain `Post`. _**(I know, what a horrible name I started with. I have learned!)**_

This was no big deal, as I pretty much just had to do a quick find-and-replace for `App\PostModel` in my code. As I was testing, everything checked out. Posts were viewable, editable, creatable, and taggable. But when I went to view all the articles tagged with, let’s say “Laravel”, I noticed that some of my old posts were not showing up in the tagged list page.

The way [Cartalyst Tags](https://cartalyst.com/manual/tags/2.0) works is by associating a taggable type with the model that represents that entity in your system. In this case, old posts were using `App\PostModel`, so they were not showing up for entities associated with the new model. 

## Migrations To The Rescue

Since Forge will automatically run new migrations for you, the fix was an easy one to push out alongside the new model class. Here’s what my migration looks like.

    <?php
    
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Migrations\Migration;
    
    class UpdateTaggedEntries extends Migration
    {
        /**
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {
            DB::table('tags')
                ->where('namespace', 'App\PostModel')
                ->update(['namespace' => 'App\Post']);
            DB::table('tagged')
                ->where('taggable_type', 'App\PostModel')
                ->update(['taggable_type' => 'App\Post']);
        }
    
        /**
         * Reverse the migrations.
         *
         * @return void
         */
        public function down()
        {
            // We don't want to go back
        }
    }

As you can see, it is pretty darned easy to handle. One thing you want to do is make sure you are only updating the affected models by using a `where` clause, otherwise you may trample other types of taggable entities in the table. 

Also, there's no need for a down function here because I do not want to reverse the change if a rollback is needed.

Hope it may help someone with a similar change. Have a great weekend!

