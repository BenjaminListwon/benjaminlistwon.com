+++
author = ""
categories = []
date = "2016-09-28T10:00:00-07:00"
description = "Taking our vuex demo one step further using modules, mutation constants, and a dash of cleverness with browser local storage."
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "Vuex Chat Part 2"
type = "post"
tags = ["Vue", "vuex", "javascript", "reactive"]

+++

[![](/postimg/vuex-chat-part-2/demo-small.png)](https://benjaminlistwon.com/demo/vuexchat/)

In my [last post](https://benjaminlistwon.com/blog/data-flow-in-vue-and-vuex/), we took a look at how you might implement shared state in your [Vue.js](https://vuejs.org) app by comparing a [vuex](http://vuex.vuejs.org/en/intro.html) implementation with a hand-coded alternative. Incorporating vuex, as we saw, is pretty straightforward once the core concept of one-way data flow in Vue makes sense.

This time, I'd like to take the demo a little further by introducing [modules](http://vuex.vuejs.org/en/modules.html), [constants](http://vuex.vuejs.org/en/mutations.html#using-constants-for-mutation-names) for mutation names, and organizing our [actions](http://vuex.vuejs.org/en/actions.html) a bit differently.

Along the way, we'll also work with a couple of [mixins](http://rc.vuejs.org/guide/mixins.html) that provide shared functionality to our components, and we will leverage [this localStorage API](https://github.com/bevacqua/local-storage) to simulate passing messages between clients.

Before we dive into the code, go [try the demo](https://benjaminlistwon.com/demo/vuexchat/). One big difference in this demo is that you can spawn two (or three, or ten, or 100) windows / tabs and chat between them. This is accomplished via the local-storage package mentioned above, and we'l cover that later on. In the meantime, try out the chat client, the admin buttons, and see what happens when you add new clients.

_(Note: If your browser doesn't support localStorage or JSON, the demo probably won't work. Apologies as I haven't had time to shim it for earlier browsers; it's on the todo list.)_

This time around, I've thoroughly commented the code, so feel free to go [grab the repo](https://github.com/BenjaminListwon/vue-vuex-demo), sift through the code, and fire it up on your local machine.

## Using vuex Modules

In order to begin to organize our code a little better, we'll start chunking bits of the vuex store into modules. This also has the advantage of scoping mutations to the module's state, not the rootstate (though you can still get at rootstate if you need). Adding a module to `store.js` is a piece of cake.

	
	import messages from './modules/messages'
	
	export default new Vuex.Store({
	  modules: {
	    messages
	  }
	}

With that out of the way, here's the module code:

	
	import { NEW_MESSAGE, LOAD_MESSAGES } from '../mutation-constants'

	const state = { 
	  items: [
	    {
	      text: 'Welcome to vuex chat!',
	      sender: 'Vue.js'
	    }
	  ]
	}

	const mutations = {
	  [NEW_MESSAGE] (state, msg) {
	    state.items.push(msg)
	  },
	  [LOAD_MESSAGES] (state, toLoad) {
	    state.items = toLoad
	  }
	}

	const actions = {
	  newMessage ({commit}, msg) {
	    commit(NEW_MESSAGE, msg)
	  },
	  loadMessages ({commit}, toLoad) {
	    commit(LOAD_MESSAGES, toLoad)
	  },
	  resetMessages ({commit}) {
	    commit(LOAD_MESSAGES, [])
	  }
	}

	export default {
	  state,
	  mutations,
	  actions
	}

I've stripped [the comments](https://github.com/BenjaminListwon/vue-vuex-demo/blob/master/src/vuex/modules/messages.js) out here, but let's take a quick look at what's going on.

1. The `const state` defines the initial state of the module. In reality we would use some initialization when the user "connected", but for now we just hardcode a welcome message.
2. The mutations are nothing new, but there's a couple differences here.
	- Note the ES6 constant syntax `[MUTATION_CONST]` used here. Those are defined in the `mutation-constants` file we import from at the top so that we define names global to our app. It also helps new code authors get acquainted with the codebase a little easier by looking in one file.
	- As mentioned, the state is relative to this module, so `state.items` refers to the state defined in the module, not that from `store.js`.
3. The actions are also mostly the same. The only thing worth noting is that we reuse the `LOAD_MESSAGES` mutation in `resetMessages` to provide component authors with a convenient way to zero out the message store. Nothing fancy, just an example of how to reuse atomic mutation operations to compose actions that are more complex internally, or offer conveniece elsewhere in the app.

For more info on namespacing, designing vuex modules, and the scope of all the moving parts of your store, consult [Section #6 of the vuex docs](http://vuex.vuejs.org/en).

## Mixins

Before we dive into the big changes in `Client.vue`, let's take a look at our mixins. [Mixins](http://rc.vuejs.org/guide/mixins.html) provide additional functionality to components by blending in methods and lifecycle hook callbacks. We could also create a base component that we extend, but mixins allow us to decorate different types of components that may not share a common ancestor.

Here's the simpler of the two, `message-mixin.js`.

	export const messageMixin = {
	  methods: {
	    bundleMessage (message = '', sender = 'Anonymous') {
	      return { text: message, sender: sender }
	    }
	  }
	}

All this mixin provides is a method that takes our message text and the sender's id, then packages it up in a structure we save in our store. It is a simple convenience function, and keeps us from worrying about how a message is composed internally. _(Note also we are making use of ES6 default values.)_ 

Now for `local-storage-mixin.js`.

	import ls from 'local-storage'

	export const localStorageMixin = {
	  methods: {
	    ls_pushMessage (msg) {
	      ls.set('new-message', msg)
	    },
	    ls_pullMessage () {
	      return ls.get('new-message')
	    },
	    ls_attachListener (callback) {
	      ls.on('new-message', callback)
	    }
	  }
	}

1. First we import the `local-storage` package as `ls`. Our mixin is just providing a thin wrapper around the API local-storage exposes so we can easily reuse it in our components. _(There's a bit more about that package is at the end of this post, but you needn't worry about the particulars here.)_
2. `ls_pushMessage` wraps the `set` method, allowing us to push a message to the browser's localStorage.
3. `ls_pullMessage` wraps the `get` method, allowing us to read a message from the browser's localStorage.
4. `ls_attachListener` wraps the `on` method, allowing us to register a callback for when the value at our `new-message` key changes in another process.

When we use any of these mixins, we can call them as if they were methods we had defined directly on our component, so `this.ls_pushMessage(someMessage)`.

## The Main Event, Client.vue

We've moved almost all of the app's functionality into `Client.vue` this time around, removing the code that was in `App.vue` last time so the code is more clearly related to the DOM it acts upon. That also makes it self contained so we can truly plop it into any context without worrying about how to set it up.

The template is largely unchanged, but there are a couple of points of interest. Here's the important bit:

	<header>
	  <h2>{{ clientId }}</h2>
	  <p><a href="#" @click="changeId">Change Id</a> | <a href="#" @click="changeFont">Change Font</a></p>
	</header>

1. We've ditched passing in `clientId` as a prop, and the client is responsible for generating an id and saving it to the store.
2. The two `@click` bindings here are used to illustrate two new bits of functionality
	- `changeId` propmts us for a new id, which then gets saved in the store and changes cascade as we will see
	- `changeFont` toggles a local `data` boolean that is used by a `:class` binding on our client's main display


Now for the code:

	import { localStorageMixin } from '../mixins/local-storage-mixin'
	import { messageMixin } from '../mixins/message-mixin'
	import { mapState, mapActions } from 'vuex'

	export default {
	  mixins: [localStorageMixin, messageMixin],
	  data () {
	    return {
	      userMessage: '',
	      alternateFont: false
	    }
	  },
	  computed: {
	    ...mapState({
	      messages: ({messages}) => messages.items,
	      clientId: state => state.clientId
	    })
	  },
	  methods: {
	    getMessages () {
	      return this.messages.slice(0).reverse()
	    },
	    trySendMessage () {
	      let msg = this.bundleMessage(this.userMessage, this.clientId)
	      this.newMessage(msg)
	      this.ls_pushMessage(msg)
	      this.clearUserMessage()
	    },
	    clearUserMessage () {
	      this.userMessage = ''
	    },
	    handleRemoteMessage () {
	      this.newMessage(this.ls_pullMessage())
	    },
	    changeId () {
	      let newId = window.prompt('What name would you like to use?', this.clientId)
	      if (newId !== null && newId !== '') {
	        this.setClientId(newId)
	      }
	    },
	    changeFont () {
	      this.alternateFont = this.alternateFont ? false : true // eslint-disable-line no-unneeded-ternary
	    },
	    setPageTitle () {
	      document.title = this.clientId + ' | Vuex Chat'
	    },
	    ...mapActions(['newMessage', 'resetMessages', 'setClientId'])
	  },
	  watch: {
	    clientId () {
	      this.setPageTitle()
	    }
	  },
	  mounted () {
	    this.setClientId('Client-' + parseInt(100000 * Math.random()))
	    this.ls_attachListener(this.handleRemoteMessage)
	  }
	}

I won't dive too much into the code here, as the [comments in the file](https://github.com/BenjaminListwon/vue-vuex-demo/blob/master/src/components/Admin.vue) should give a complete picture of what is happening in the file. Here's the highlights:

1. Having inported our mixins, we mix them into the component definition with the line `mixins: [localStorageMixin, messageMixin],`. That's it!
2. You'll see we've added a state mapping for the `clientId`. That will allow us to us it below in `watch`.
3. Rather than loop directly over the `messages` computed property in our template, we use `getMessages` which allows us to reverse the order of the messages so we can display them like a chat window might, scrolling up. If we called `reverse()` directly on `messages` we'd throw a vuex error because we'd be manipulating the state directly.
4. `trySendMessage` is the workhorse here. It makes use of our mixins to bundle a message object, push it into the store, then into localStorage.
5. `handleRemoteMessage` is our callback when another client pushes a message into localStorage. It pushes that message into this client's vuex store.
6. `changeId` prompts the user for a new id, then uses the `setClientId` mapped action to set it on the vuex store.
7. `changeFont` toggles our local boolean `alternateFont` which triggers the `:class` binding to update the client's CSS class.
8. `watch: { clientId ...` calls `setPageTitle` whenever the `clientId` state changes on our vuex store. This keeps the page title always freshly updated. (Big circle on that one!)
9. Lastly, we define a `mounted` lifecycle hook to
	- Set an initial `clientId` value
	- Bind our `handleRemoteMessage` callback to the localStorage message key

Whew. There's a lot going on there, but it all flows pretty nicely from where we've been so far.

## Admin.vue

The Admin component is trying to simulate a server-side administrator doing some things. Obviosuly this wouldn't be exposed alongside the CLient component in real life, but that is a good demonstration of a key concept in Vue: **carefully planned, we can reuse so much of our app's code in different contexts and configurations.** 

In this case, because we moved some common functionality to mixins, and we defined our actions and mutations carefully, we could envision building an admin client quite easily. In fact, next time we'll lift make it so we can inject the admin functionality into an instance of the client so you could run the same app, but with different permissions to allow different functionality.

Anyway, the code!

	export default {
	  mixins: [localStorageMixin, messageMixin],
	  data () {
	    return {
	      sysmsg: [
	        'Vue 2.0rc8 is out!',
	        'Have you tried vue-router yet?',
	        'Three cheers for Evan!'
	      ],
	      adminId: 'Vue.js'
	    }
	  },
	  methods: {
	    tryAdminMessage (broadcast = false) {
	      let randomMessage = this.sysmsg[Math.floor(Math.random() * this.sysmsg.length)]
	      let msg = this.bundleMessage(randomMessage, this.adminId)
	      this.newMessage(msg)
	      if (broadcast === true) {
	        this.ls_pushMessage(msg)
	      }
	    },
	    ...mapActions(['newMessage', 'resetMessages'])
	  }
	}

1. As mentioned, we leverage the same mixins in this component. Yay!
2. The `data` array is filled out with some hardcoded bits to save us from typing as an admin ;-)
3. The big dealio here is the `tryAdminMessage` method. It works much the same as the `trySendMessage` in Client.vue, but here we accept a boolean flag. That flag determines if the message should be broadcast (pushed onto localStorage _and_ the vuex store) or just sent locaally (only pushed onto the vuex store).
4. We also directly bind `resetMessages`, the action we defined in our `messages.js` module, to the reset button in the interface. As we covered in the messages module, we eliminate the need for knowing how that gets implemented internally, so we don't have to worry about if / what we need to pass it here.

## Conclusion and Next Steps

Not bad, eh? We are sending messages around between windows, getting updates, and more. This time around I wanted to demonstrate messaging between clients as we started to modularize, but not require much in the way of additional npm packages or running additional servers.

Next time though, we'll integrate [Feathers.js](http://feathersjs.com/) so we can run a backend server, and get messaging for real. As mentioned, we'll also create a true admin interface, so we can boot rowdy guests, send admin messages and maybe even start "rooms" on our chat server (stretch goal there).

I'm also working on a few other things:

- Wrapping up a [handsontable](https://handsontable.com/) component for Vue2.0/vuex2.0
- Turning [Short Order Vue](https://benjaminlistwon.com/demo/shortordervue/) into a multiplayer diner matching game
- Filling out the newly minted [Resources](https://benjaminlistwon.com/resource/) section _(suggestions welcome / encouraged)_

So stay tuned!

## A Bit About local-storage

As promised, a bit more about the localStorage wrapper I chose. [local-storage](https://github.com/bevacqua/local-storage) seemed to offer everything we needed for this demo. It serializes data for us, using JSON.stringify / JSON.parse, so we don't have to worry about preserving objects or values other than strings. It also provides the watch functionality we needed to trigger updates.

I'm aware of other packages like [store](https://github.com/marcuswestin/store.js), but unless I missed something in the docs, it does not provide a watcher out-of-the-box.

In the end, I needed something quick and dirty to simulate a message server, and local-storage fit the bill. If you have thoughts, or suggestions for a better API wrapper, drop a line or a PR.




