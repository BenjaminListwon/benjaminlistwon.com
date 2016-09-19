+++
author = ""
categories = []
date = "2016-02-29T10:00:00-07:00"
description = "A quick look at how to use a Laravel migration to populate values for a new column after using ALTER."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #002: Updating Rows In A Migration"
type = "post"

+++

[Laravel Migrations](https://laravel.com/docs/5.2/migrations) are a great way to manage your database tables. If you add [Doctrine](https://github.com/doctrine/dbal) to your composer dependencies, then you can easily alter a table’s columns, indices and loads of other properties, without changing the way you write migrations.

Sometimes, when you alter a table to add a new column, you want to populate it with values. There’s a couple ways to do this for basic operations.

1. If your column will allow a default value, you can add it as part of the migration itself `$table->string('colName')->default('foo');`
2. You can use a [Seeder](https://laravel.com/docs/5.2/seeding) to insert rows, or to run just about any query you’d like.
3. You can add `DB` code to your migration.

This last is not well documented, perhaps because it is not best practice or perhaps because not many folks run into it. 

Call me crazy if you like, but most times I’d prefer to place the column-populating logic in the migration, rather than have to remember to maintain and run a Seeder as well.

Here’s a situation I just ran into. I wanted to add a `slug` column to my `post` table, and I wanted to set the value of that column to `str_slug('title')` for each post. 

I didn’t feel like creating a slugify function for MySQL that would mimic the one in Laravel, and I don’t have a ton of posts to worry about a long-running query in this case. So, I opted to just prefer the update in a super-lazy fashion, right in the migration.

##### /database/migrations/2016\_02\_29\_174351 \_alter\_post\_table\_add\_slugs.php
    public function up()
        {
            /* 1. Add 'slug' column and an index */
            Schema::table('post', function ($table) {
                $table->string('slug', 255);
                $table->index('slug');
            });
    
            /* 2. Update each post with a shiny new slug */
            $rows = DB::table('post')->get(['id', 'title']);
            foreach ($rows as $row) {
                DB::table('post')
                    ->where('id', $row->id)
                    ->update(['slug' => str_slug($row->title)]);
            }
        }

Obviously I would not recommend running this kind of query on a table with a jillion rows in it, or if there were any greater complexity. That kind of task would fall to a much more dedicated migration job that could run asynchronously in the background, or require downtime if there were a risk of corrupting data otherwise.

That said, it is great to know you can run any DB facade code you might run elsewhere, right in the migration. To me, this is much more readable and easy to maintain, than having to look in two or three places each time you want to alter a table _and_ populate it with data.
