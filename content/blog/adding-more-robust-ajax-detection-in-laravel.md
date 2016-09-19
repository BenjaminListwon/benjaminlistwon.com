+++
author = ""
categories = []
date = "2016-02-17T10:00:00-07:00"
description = "Laravel 5.2 (and earlier) ships with ajax detection that is unreliable. Here's a fix that gets almost complete coverage."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Adding More Robust Ajax Detection In Laravel"
type = "post"
tags = ["Laravel", "ajax"]

+++

## TL;DR
The `$request->ajax()` method does not detect XHR sent without an `X-Requested-With` header, so you’ll want to add the following to your own `Request.php` file (or whatever base Request class is used by your controllers).

##### App/Http/Requests/Request.php
    <?php
    namespace App\Http\Requests;
    use Illuminate\Foundation\Http\FormRequest;
    
    abstract class Request extends FormRequest
    {
       public function ajax()
       {
           /* 1. Call the builtin method */
           if ($this->isXmlHttpRequest())
           {
               return true;
           }
    
           /* 2. Then check the Content-Type */
           $content_type = $this->header('Content-Type');
           $allowable_types = array(
                   'application/json', 
                   'application/javascript',
           );
           if (in_array(
                   strtolower($content_type),
                   $allowable_types)) 
           {
               return true;
           }
    
           /* 3. Otherwise, not Ajax */
           return false;
       }
    }

## Background
Recently, while working on some controllers for an API, I started getting redirections to my site’s welcome page. There was no error showing in my logs, and I was stumped for a bit.

I took a look at the payload I was sending from Postman, and realized I had mistyped a value for one of the attributes I was sending. This meant the request was failing one of the validation rules used by my API controller.

But why was the result a redirection to the default web route? Why not a JSON response like any other API error? 

## Ajax, Pjax, JSON, Oh My!
The trouble lay in the validation phase of the request. 

When you call `$this->validate()` on a request, failure to validate throws a `ValidationException` which invokes the following code *(comments mine)*:

##### Illuminate/Foundation/Validation.php
    protected function buildFailedValidationResponse(
                            Request $request, array $errors)
    {
       /* 1. See if we have an Ajax request */
       if (($request->ajax() && ! $request->pjax()) || 
            $request->wantsJson()) 
       {
    
       /* 2. If so, return a JSON response */
           return new JsonResponse($errors, 422);
       }
    
       /* 3. If not, redirect to the form (or default) */
       return redirect()->to($this->getRedirectUrl())
                          ->withInput($request->input())
                          ->withErrors($errors, $this->errorBag());
    }

As you can see, this code utilizes the request object’s builtin methods `ajax()`, `pjax()` and `wantsJson()` to determine if the response should be a JSON response or if the user should be redirected to the originating form with data and error information.

The trouble is that the `ajax()` call may not return a “truthy” value because of the underlying mechanism it uses. Let’s follow it down the call chain.

##### Illuminate/Http/Request.php
    public function ajax()
    {
       return $this->isXmlHttpRequest();
    } 

Which, in turn, simply hands off to `isXmlHttpRequest()`.

##### symfony/http-foundation/Request.php
    /**
    * Returns true if the request is a XMLHttpRequest.
    *
    * It works if your JavaScript library sets an 
    * X-Requested-With HTTP header.
    *
    * It is known to work with common JavaScript frameworks:
    * @link http://en.wikipedia.org/wiki/List_of_Ajax_frameworks#JavaScript
    *
    * @return bool true if the request is an XMLHttpRequest,
    * false otherwise
    */
    public function isXmlHttpRequest()
    {
       return 'XMLHttpRequest' == 
           $this->headers->get('X-Requested-With');
    }

*(Of note, this method of detection is unchanged since at least [version 2.0 on Aug 20, 2010](https://github.com/symfony/symfony/blob/bf82cf42dda099f8c0b6648b7dbd8e8ea7397c1e/src/Symfony/Component/HttpFoundation/Request.php#L640), the oldest Git history entry I could find, so it is likely that it has simply not kept up with the rapid change in the world of Javascript frameworks since.)*

The key part here is that this method is looking for the presence of the `X-Requested-With` header. If it is not found, then this method returns `false`, which bubbles up the chain and ultimately implies that the request is a regular old web request.

As the comment mentions, this method works with “common JavaScript frameworks.” 

In practice, this means *it will detect* requests from libraries like jQuery and YUI, but *will not detect* requests made by Postman, Angular and/or any mechanism that does not set this header. *(Angular has had [a particularly on-again/off-again relationship](http://encosia.com/making-angulars-http-work-with-request-isajaxrequest/%20) with this header.)*

Worse still, by default the header will [not be set on CORS requests](http://stackoverflow.com/questions/8163703/cross-domain-ajax-doesnt-send-x-requested-with-header), and [must be explicitly added, even in jQuery](https://remysharp.com/2011/04/21/getting-cors-working) and other frameworks that do send the header on same-domain requests. As usual, [StackOverflow](http://stackoverflow.com/a/22533680) sheds some light on the matter.

## Adding More Comprehensive Detection
I wanted to add a more reliable method of detecting that a request was using Ajax, and I wanted it to avoid any `X-` headers that are not common and/or might get [stripped in transit](https://www.w3.org/TR/ct-guidelines/#sec-altering-header-values). 

`Content-Type` seemed a logical header to look for on a request. The header is a common one, not unreasonable to ask developers to use when hitting your API, and allows for customizability in the values array, should you decide you need to tweak behavior of detection.

    $content_type = $this->header('Content-Type');
    $allowable_types = array(
           'application/json', 
           'application/javascript',
    );

Also, if we look at `wantsJson()`, we see it is looking at `Accepts` header values to see if JSON responses are allowed. 

##### Illuminate/Http/Request.php
    public function wantsJson()
    {
       $acceptable = $this->getAcceptableContentTypes();
       return isset($acceptable[0]) &&
           Str::contains($acceptable[0], ['/json', '+json']);
    }
 
This is why I view the `Content-Type` header as more thematically consistent than `X-Requested-With`, because **it speaks to the type of the payload, not the mechanism used to fetch it**, just as `wantsJson()` does for the response. 

Anyway, for obvious reasons, this code should not be placed into the foundation code directly. We also don’t want to have ridiculous one-liners all over individual controller methods like, `if (($request->ajax() && ! $request->pjax()) || $request->wantsJson()) || $request->myCustomAjaxCheck())`. 

What an ugly–very error prone–sight.

Therefore, we should just override the request object’s `ajax()` method, invoking the standard test as well as our own custom header check shown in the TL;DR section above (and in the Putting It All Together section below).

## Injecting A Custom Request Object
The only trouble that remains is that our new method will not get invoked where we’ve injected Laravel’s standard request class.

Consider the following way of performing validation on a request (in most cases, the `store()` handler). Here’s the [sample from the Laravel docs](https://laravel.com/docs/5.2/validation#quick-writing-the-validation-logic):

    use Illuminate\Http\Request;
    ...
    public function store(Request $request)
    {
       $this->validate($request, [
           'title' => 'required|unique:posts|max:255',
           'body' => 'required',
       ]);
    
       // The blog post is valid, store in database...
    }

Because the instance of `Request` here is the default, the call to `buildFailedValidationResponse()` will invoke the standard `ajax()` method. 

What we need to do is build out our own base request object, and inherit from it. That’s where the code at the top comes in, and fortunately Laravel has already created a Request template for you at `/app/Http/Requests/Request.php`

Typically, we should also move validation logic to custom request classes as well, and there’s a [few good articles](https://laracasts.com/discuss/channels/requests/laravel-5-validation-request-how-to-handle-validation-on-update) out there on [custom form requests](https://mattstauffer.co/blog/laravel-5.0-form-requests) which I will paraphrase below.

## Putting It All Together

First, add the custom `ajax()` method above into your app’s base request class:

##### /app/Http/Requests/Request.php
    <?php
    namespace App\Http\Requests;
    use Illuminate\Foundation\Http\FormRequest;
    
    abstract class Request extends FormRequest
    {
      public function ajax()
      {
          /* 1. Call the builtin method */
          if ($this->isXmlHttpRequest())
          {
            return true;
          }

          /* 2. Then check the Content-Type */
          $content_type = $this->header('Content-Type');
          $allowable_types = array(
                'application/json', 
                'application/javascript',
          );
          if (in_array(
                strtolower($content_type),
                $allowable_types)) 
          {
              return true;
          }

          /* 3. Otherwise, not Ajax */
          return false;
      }
    }

Next, set up your custom request class, being sure to replace the ellipses (“…”) with any actual code you may require (see the articles above).

##### /app/Http/Requests/MyCustomRequest.php
    <?php 
    namespace App\Http\Requests;
    use App\Http\Requests\Request;
    
    class MyCustomRequest extends Request
    {
         public function authorize() { ... }
      
         public function rules()
         {
             $rules = [];    
             switch($this->method())
             {
                 ...
                 case 'POST':
                 {
                     $this->sanitize();
                     $rules = [
                         'title' => 'required|unique:posts|max:255',
                         'body' => 'required'
                     ];
                 }
                 ...
             }
             return $rules;
         }
      
         public function sanitize() { ... }
    }

Lastly, make use of your custom request back in your controller:

##### /app/Http/Controllers/SomeController.php
    use App\Http\Requests\MyCustomRequest;
    ...
    public function store(MyCustomRequest $request)
    {
       /* Validation happens like magic */
       // The blog post is valid, store in database...
    }

That’s it!

## Going Further
In the end, I may remove the `isXmlHttpRequest()` detection altogether, since my API will require the `Content-Type` header to be set with each request as part of the overall API guidelines.

Further, when I think about how to properly use the Auth guards in Laravel 5.2, incoming API requests will also need an `Authorization` header or an `api_token` in the querystring. 

As such, I may abstract away the JSON detection and run every request behind my `/api` route through a custom middleware that handles all of these issues.

That would allow me to force every response through a single point of return that formats the outgoing payload as JSON.

As always, YMMV.