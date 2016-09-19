+++
author = ""
categories = []
date = "2016-02-27T10:00:00-07:00"
description = "Cartalyst has a great tags package for your Laravel projects, but there's a couple tricks to make using it feel seamless."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Adding Tags In Eloquent With Cartalyst"
type = "post"
tags = ["Laravel", "tags", "Cartalyst"]

+++

When I was first building out the code for this blog, I gave some thought to how to add tagging. The Laravel Docs actually use [tagging as an example of polymorphic relations](https://laravel.com/docs/5.2/eloquent-relationships#many-to-many-polymorphic-relations). But then, over on his new jam [Makers Clique](https://makersclique.com/), [Scrivs](https://twitter.com/scrivs) mentioned a package called [Cartalyst Tags](https://cartalyst.com/manual/tags/2.0#introduction) which looked like it ticked all the boxes.

After following the installation instructions, I added a tags field to my post forms:

##### /resources/views/post/create.blade.php
    <p>
        {{ Form::label('tags', 'Tags (separate with comma)') }}
        {{ Form::text('tags') }}
    </p>

_(I’m using the [Laravel Collective Form & HTML package](https://laravelcollective.com/docs/5.2/html) here. More on that below, and in another post._

Displaying the tag list on a post was pretty easy as well:

##### /resources/views/post/show.blade.php
    @if ($post->tags)
        <ul class="tags">
        @foreach ($post->tags as $tag)
            <li><a href="/tag/{{ $tag->slug }}">{{ $tag->name }}</a></li>
        @endforeach
        </ul>
    @endif

Then I tweaked my `store` and `update` methods and voilà, my posts were taggable. 

## Getting The Tags For Update

So, I hit a huge brick wall when I wanted to retrieve the tags in my edit form. I’ll keep this as brief as I can.

Calling `$post->tags` will give you a collection of tag objects.  This can be useful if you are going to work with them in code, but is not so great for display in a template:

    [{
        "id":2,
        "namespace":"App\\Database\\Models\\Post",
        "slug":"laravel",
        "name":"Laravel",
        "count":2,
        "pivot":{"taggable_id":1,"tag_id":2}
    }, ...]
 
Of course, you can iterate over that array, pulling out items by key if all you need is display. Trouble is, because I use the [Form package](https://laravelcollective.com/docs/5.2/html), I cannot control the output so easily.

`Form` objects are bound to a model—in this case `Post`—so references to model properties will invoke the appropriate accessor. In the case of tags, it will use the `$post->tags`, which returns the above, and places it in the `value` attribute. Blech!

##### /resources/views/post/edit.blade.php
    {{ Form::model($post, ['method' => 'PUT', 
            'action' => ['PostController@update', $post->id]] ) }}
    ...
    <p>
       {{ Form::label('tags', 'Tags (separate with comma)') }}
       {{ Form::text('tags') }}
    </p>
    ...
    {{ Form::close() }}

Basically, I wanted the value of `tags` to be something like “Tag, Tag 2, Another Tag” when it was being placed back into the text field on my edit form.

Things I tried:

1. Decorate the results of `$post->tags` on the way back to the template. For reasons I didn’t dig too much further into, and because `$post->tags` retrieves a relationship, it is expected to return an object of type Relation. Mucking with it at all yields this error: `Relationship method must return an object of type Illuminate\Database\Eloquent\ Relations\Relation`

2. [Custom Accessors](https://laravelcollective.com/docs/5.2/html#form-model-binding) looked like the way to go for a while, but `formTagAttribute` will never get called, because `tags` is not an attribute of the model, it is a relationship.  

3. I tried to make a [custom component](https://laravelcollective.com/docs/5.2/html#custom-components) to render the form field correctly, but that just kicked the above can down the road.  

4. I also tried adding another accessor and a custom property to my `Post` model, but they all continued to run into the Relation issue above.

In the end, here’s what worked:

##### /App/Database/Models/Post.php
    public function tagList() 
    {
        $tags = $this->tags;
        $tagList = array();
        foreach ($tags as $tag) {
            array_push($tagList, $tag->name);
        }
        return implode(', ', $tagList);
    }

Which I use like so:
    <p>
      {{ Form::label('tags', 'Tags (separate with comma)') }}
      {{ Form::text('tags', $post->tagList()) }}
    </p>

Unfortunately, I don’t get the automatic handling of `old('tags')`, then fall through to the above, then fall through to blank. But, I think that can be added to a custom component, which I will throw together now that I have the way to retrieve the data I need.

## Displaying Posts With Tag XYZ

You may have noticed that the link I use to get all posts with a given tag looks like this `<a href="/tag/{{ $tag->slug }}">{{ $tag->name }}</a>`. 

The `$tag->slug` uses Laravel’s default slug generator, so a tag like “Dogs and Cats” will get sluggified as “dogs-and-cats”.

One thing [the documentation](https://cartalyst.com/manual/tags/2.0#get-all-the-entities-with-the-given-tags) doesn’t make clear is that you MUST use the slug to retrieve items tagged with a given tag. Here’s the example:

  $products = Product::whereTag('foo, bar')->get();

From that, it is impossible to tell if ‘foo’ and ‘bar’ represent `tag->name` or `tag->slug` properties.

So, your controller method for this will look something like:

##### /App/Http/Controllers/TagController.php
    public function show($slug)
    {
        $posts = Post::whereTag($slug)->orderBy('created_at', 'desc')->get();
        $tag = Tag::where('slug', $slug)->first();
        return view('tag.show', array_merge(compact('posts', 'tag')));
    }

Note that I am also fetching the tag itself here, just so I can refer to it outside the scope of any given post in my template.

## Displaying All Tags

The final issue I ran up against was retrieving all the tags. While [the docs say](https://cartalyst.com/manual/tags/2.0#get-all-the-tags-from-an-entity-namespace) you can use the `allTags()` method to retrieve all the tags for a given domain, it failed to return any results no matter what I did.

Having blown way too much time on the above, I opted to simply add my own model, so I could query the `tags` table myself.

##### /App/Database/Models/Tag.php
    <?php
    
    namespace App\Database\Models;
    
    use Illuminate\Database\Eloquent\Model;
    
    class Tag extends Model
    {
    
        /**
         * The database table used by the model.
         *
         * @var string
         */
        protected $table = 'tags';
    
        /**
         * The attributes that are mass assignable.
         *
         * @var array
         */
        protected $fillable = ['namespace', 'name', 'slug', 'count'];
    
    }

With that in place, I simply did the following:

##### /App/Http/Controllers/TagController.php
    public function index()
    {
        $tags = Tag::get();
        return view('tag.index', array_merge(compact('tags')));
    }

Later, I will add queries to fetch by domain, etc.

Hope the above can help someone. Cheers!
