+++
author = ""
categories = []
date = "2016-02-25T10:00:00-07:00"
description = "CORS can be aa bit of an enigma to set up. Laravel makes it even more mystical. Here's a decoder ring."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "In Brief #001: Routing With CORS"
type = "post"
tags = ["In Brief", "Laravel", "CORS"]

+++

If you’re building an API for your app, chances are you have to build in support for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). Doing so in Laravel is pretty straightforward, especially if you snag the [laravel-cors](https://github.com/barryvdh/laravel-cors) package from [Barry van den Heuvel](https://twitter.com/barryvdh).

After adding `laravel-cors` to your project, you can just add route code like any of these:

    Route::post('train', function() { return 'Choo, Choo!'; })->middleware('cors');
    
    Route::post('boat', ['middleware' => 'cors', function() { return 'Hooooonk!'; }]);
    
    Route::group(['middleware' => 'cors'], function($router){
        $router->post('car', function() { return 'Meep, Meep!'; });
    });
    
    Route::group(['middleware' => 'cors'], function() {
        Route::post('truck', function() { return 'Honk, Honk!'; });
    });
    
    Route::group(['prefix' => 'sub', 'middleware' => 'cors'], function() {
        Route::post('marine', function() { return 'Ping!'; });
    });
    
    Route::post('biplane', 'BiplaneController@store')->middleware('cors');
        // "Sputter, Sputter!"
    
    Route::group(['middleware' => 'cors'], function() {
        Route::resource('jet', 'JetController');
    });
        // "Whooooosh!"

What are you waiting for, go add it to your `composer.json` right away!

## Overzealousness / A Word Of Caution
Still here?

Thing is, I spent hours last night getting the `Route::group()` and `Route::resource()` directives to work _*(I actually didn’t break through until this morning)*_. 

Scouring the web, it [looks like loads of other folks](https://laracasts.com/discuss/channels/requests/laravel-5-cors-headers-with-filters?page=1) have [torn their hair out as well](http://stackoverflow.com/questions/33569567/laravel-cors-middleware-fails-for-post-and-resource-request), [even Barry](https://github.com/barryvdh/laravel-cors/issues/24). But, why?

I wanted to make sure it worked if globally applied, so, as per several suggestions, I added the middleware to my global middleware:

##### /App/Http/Kernel.php
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \Barryvdh\Cors\HandleCors::class,
    ];

Lo and behold, this worked. Grrr.

Trouble was, I had not read the [README](https://github.com/barryvdh/laravel-cors/blob/master/readme.md) closely enough …

> The ServiceProvider adds a route middleware you can use, called cors. You can apply this to a route or group to add CORS support.

… and out of force-of-habit, I had added this line:

##### /App/Http/Kernel.php
    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'cors' => \Barryvdh\Cors\HandleCors::class, // <-- MY ADDITION
    ];

By (re)declaring the middleware here, I was trampling the already added middleware. As such, it was not firing early enough in the middleware pipeline, which in turn meant that it did not head off `OPTIONS` requests in time.

## Morals of the story:

1. RTFM
2. Do not manually add the middleware to your Kernel
3. Do not try to debug at 3am
