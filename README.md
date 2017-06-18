# Webpack Plugin Webpack Plugin

*facepalm*

## <span style="font-size: 0.5em">~~Overview~~ ~~Background~~ ~~Rationale~~ ~~Explanation~~</span> Excuse

I was working on an old application that uses lots of spaghetti JavaScript, trying to add CDN functionality (bundling, hashing, etc.) to a portion of it. The project had no build process at the time so I gravitated towards Webpack since it's the current fad.

After days of fighting with integrating the non-module-based legacy-locked things I wanted to do and needed to work with into Webpack, and failing most of the time, I jumped off the struggle bus. I wrote this plugin (my first Webpack plugin) so that I could pummel raw JavaScript into the Webpack build pipeline, which would allow me to do all the pre- and post-processing I want (raw ES, shell commands, etc.). It worked dangerously well.

Foot, meet gun.

## Design

This plugin is essentially a lightweight wrapper around the internals of Webpack's plugin system. The user creates an instance of the plugin class and provides a configuration object to the plugin instance. This configuration object includes property keys and values which get assigned to the various "phases" or "steps" or callback hooks in Webpack's plugin system (and thereby its build cycle). These plugin system hooks are described at <https://github.com/webpack/docs/wiki/plugins>.

This mapping is done dynamically and as such shouldn't require any changes for minor plugin API changes (like additions). Only two exceptions exist:

### The Compilation Hook

This plugin system hook of the Webpack plugin system is implemented as an additional child object, sort of like a plugin within a plugin, so that is extracted and handled separately (the same way as the main plugin is handled). The user just needs to supply a nested or child `compilation` property in the main configuration object and this child object should have its own properties for any associated plugin system hooks. It shouldn't really be noticeable, but it _is_ handled separately behind the scenes.

### The Initialization Hook

There is a special `initialize` plugin system hook (and associated configuration object property key) which doesn't exist in Webpack's actual plugin system. This pseudo-hook is called when the plugin first gets initialized by the plugin system. It should probably be called `apply`, which is what it is internally called, but "initialize" sounded better to me (and `apply` is already a thing)...

## Usage

Here is a simple example that logs the occurrance of some plugin system hooks:

```
new WebpackPluginWebpackPlugin({
	compiler: {
		'after-compile': () => { console.log('after-compile'); },
		compilation: {
			'after-hash': () => { console.log('after-hash'); },
			optimize: () => { console.log('optimize'); }
		},
		compile: () => { console.log('compile'); },
		//emit: () => { console.log('emit'); },
		//make: () => { console.log('make'); }
	}
})
```

This is the resulting output:

```
> *node_modules\.bin\webpack*
compile
optimize
optimize
after-hash
after-compile
optimize
after-hash
after-compile
optimize
after-hash
after-compile
optimize
after-hash
after-compile
optimize
after-hash
after-compile
```

> **Warning:** Specifying some plugin system hooks seems to break the Webpack build process.

For example, the same config as above but with the "make" property uncommented results in this output:

<pre>
> <b>node_modules\.bin\webpack</b>
compile
make
</pre>

The plugin system hooks such as `done` and `after-compile` don't no longer produce any output. This may be because this simple configuration object only runs simple `console.log` functions and doesn't return anything or execute any callbacks. I haven't investigated the cause; I just moved on as I didn't need to use these plugin system hooks.

### Arguments

Various plugin system hooks have arguments. One can access those in two ways:

#### Function Parameters

In the configuration object below, the `modules` parameter is used to log the modules of which Webpack is aware:

```
new WebpackPluginWebpackPlugin({
	compiler: {
		compilation: {
			'optimize-modules': (modules) => { console.log('optimize-modules'); console.log(modules); }
		}
	}
})
```

The above configuration object results in the following output:

```
optimize-modules
[ MultiModule {
    dependencies: [ [Object], [Object], [Object], [Object], [Object] ],
    blocks: [],
    variables: [],
    context: '...',
    reasons: [],
    debugId: 1000,
/* ... lots and lots and lots of output ... */
    optional: false,
    building: undefined,
    buildTimestamp: 1497703923662,
    cacheable: true } ]
```

#### Global `arguments` object

In the configuration object below, the global ECMAScript `arguments` object is used to access functinon arguments:

```
new WebpackPluginWebpackPlugin({
	compiler: {
		compilation: {
			'optimize-modules': () => { console.log('optimize-modules'); console.log(arguments); }
		}
	}
})
```

The above configuration object results in the following output:

```
optimize-modules
{ '0': {},
  '1':
   { [Function: require]
     resolve: [Function: resolve],
     main:
      Module {
        id: '.',
        exports: {},
        parent: null,
        filename: '...',
        loaded: true,
        children: [Object],
        paths: [Object] },
/* ... lots and lots and lots of output ... */
     loaded: true,
     children: [ [Object], [Object], [Object], [Object], [Object] ],
     paths:
```

### Initialization

One can specify an `initialize` property key, and, if the value is a function, that function will be executed when the Webpack plugin system initially loads this plugin. The function will be provided the compiler instance that was provided to this plugin by Webpack. For example:

```
new WebpackPluginWebpackPlugin({
	initialize: (compiler) => { /* ... naughty bits ... */ },
	compiler: { /* ... */ }
})
```
