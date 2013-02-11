gl-shells
=========
Simple ready-to-go WebGL shell for viewing meshes in your browser.

Installation/Example
====================
First install the package using npm:

    npm install gl-shells
    
Then you can draw a mesh in your browser directly.  Here is an example showing how to draw a bunny.  It also uses jquery and the Stanford bunny:

    var $ = require("jquery-browserify");
    $(document).ready(function() {
      var viewer = require("gl-shells").makeViewer();
      viewer.updateMesh(require("bunny"));
    });

And here is the accompanying HTML:

    <html><!DOCTYPE html>
    <html>
    <head>
      <title> Quasicrystal </title>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8">
      <script src="bundle.js"></script>
    </head>
    <body>
      <div id="container"></div>
    </body>
    </html>

You can then compile this code using browserify to view it within your browser.  Or if you are feeling lazy, you can spin up a server directly using serverify.  To do that, you first need to install it:

    sudo npm install -g serverify
    
And then go into the example directory and run it:

    cd example/
    serverify

Or you can try it out [in your browser right now on gh-pages](http://mikolalysenko.github.com/gl-shells/example/www/index.html).

Methods
=======

## `makeShell(params)` ##

Creates a viewer taking in an optional JSON object with some parameters

* `bg_color`: Background color of the viewer
* `camera_pos`: Default x,y,z position of camera (always points toward origin)
* `container`: A jquery selector for the element to add the GL context to

Returns a GL shell object which implements EventEmitter and exposes the following events:

### Event `render` ###

Triggered when a frame gets rendered


## `makeViewer(params)` ##

Similar to make shell, except it implements a mesh viewer.  Params has the same function as before, only with the following extra features added:

* `wireframe` : If set to true, then draws mesh in wireframe mode

Also, the viewer object has the following extra methods:

### `viewer.updateMesh(mesh)` ###

This takes a mesh object with two members `positions`, which is an array of 3D arrays representing the x/y/z coordinate of each vertex and `faces` which is an array of 3D arrays giving the indices of each face.


## `GLOW` ##

A WebGL GLOW object.

## `GL` ##

Added to window.GL (unfortunately), the current active GL context.


Credits
=======
(c) 2013 Mikola Lysenko. BSD License