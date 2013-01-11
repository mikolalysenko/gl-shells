var $ = require("jquery-browserify");
$(document).ready(function() {
  var viewer = require("gl-shells").makeViewer();
  viewer.updateMesh(require("meshdata").bunny);
});