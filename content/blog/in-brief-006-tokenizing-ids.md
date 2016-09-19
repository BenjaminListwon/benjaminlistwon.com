+++
author = ""
categories = []
date = "2016-03-16T10:00:00-07:00"
description = "Integrating a Laravel-friendly package to auto-magically hash DB ids for use in templates and URLs."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #006: Tokenizing Ids"
type = "post"

+++



As I was designing an API this last week, I decided that I wanted to obfuscate object ids in the JSON messages I sent back and forth. To do so, I wanted to use the terrific [Hashids](http://hashids.org/) library, so I sniffed out [this Laravel wrapper](https://github.com/vinkla/hashids) for it.

##### composer.json
    "require": {
        ...
        "hashids/hashids": "1.0.6",
        "vinkla/hashids": "2.2.2",
        ...
    }

Note: You should peg your versions in Composer so you avoid incompatible hashes down the road, especially if you store computed hashes for use or comparison later.

## Automating The Encoding

Everything worked swimmingly. I passed obfuscated ids to the client and then decoded them when they were sent back in future API requests. The trouble was, I found myself manually adding `Hashids::encode` and `Hashids::decode` all over the place. 

It was tedious and very error prone, not to mention that future collaborators should not have to think about the implementation. Encoding and decoding should be transparent.

So, I created a trait for database models that will look at a list of items to encode, similar to the way the `$fillable` and `$hidden` properties work. 

##### /app/Database/TokenizesIds.php
    <?php
    
    namespace App\Database;
    use Hashids;
    
    trait TokenizesIds
    {
        /**
         * Convert the object into something JSON serializable.
         * \Illuminate\Database\Eloquent\Model\jsonSerialize
         *
         * Here, we override the default serialization to provide a way to use hashids
         * to obfuscate id values
         *
         * @return array
         */
        public function jsonSerialize()
        {
            $arr = $this->toArray();
    
            if (isset($this->tokenize) || $this->tokenize !== null) {   
                array_walk_recursive($arr, array($this, 'tokenizeItem'), array('tokenList' => $this->tokenize) );
            }
    
            return $arr;
        }
    
        /**
         * If the item occurs in the tokenList, it is tokenized using hashids
         *
         * @return void
         */
        public static function tokenizeItem(&$item, $key, $params) {
            if (in_array($key, $params['tokenList'])) {
                $item = Hashids::encode($item);
            }
        }
    }


Then, in a model you simply use the trait and add a list like this:

##### /app/SampleModel.php
    <?php
    
    use App\Database\TokenizesIds;
    
    class SampleModel extends Model
    {
        use TokenizesIds;
        protected $tokenize = ['id', 'user_id'];
        ...


## What About Decoding

I’m still looking into a way to decode incoming route parameters like `post/{id}`. The difficulty here is that the request object itself does not have access to the route parameters. 

At first I thought that I might add some code to a custom Request object like:

    $route = Route::current();
    if ($route->getParameter('post')) 
    {
        $route->setParameter('post', Hashids::decode($route->getParameter('post')));
    }

But back in the controller, the injected parameter does not get this modified route parameter. 

    public function show(Request $request, $post)
    {
        // $post != decoded param
    }

I think that altering it is too late in the request lifecycle, so perhaps a middleware will work. At any rate, adding the code that works directly with the Route object into the controller ends up getting messier than just inlining the decode ...

    $result = Post::where('id', Hashids::decode($post))->first();

... and pulling the modified route parameter is just as ugly ...

    $result = Post::where('id', Route::current()->getParameter('post'))->first();

So, for now I will keep digging on how to automate this half of the process. If I figure something out, I’ll add the solution to a follow-up. If you have any ideas, don’t hesitate to [reach out](mailto:ben@benjaminlistwon.com).