gl-shells
=========

Simple ready-to-go WebGL shells for making spinning models

Usage
=====

Here is an example using jquery and some data from meshdata showing how to draw a bunny:

    var $ = require("jquery-browserify");
    $(document).ready(function() {
      var viewer = require("gl-shells").makeViewer();
      viewer.updateMesh(require("meshdata").bunny);
    });


Installation
============