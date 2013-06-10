//Import libraries
var $             = require('jquery-browserify')
  , GLOW          = require('./GLOW.js').GLOW
  , ArcballCamera = require('arcball').ArcballCamera
  , utils         = require('./utils.js')
  , EventEmitter  = require('events').EventEmitter;

exports.makeShell = function(params) {
  if(!params) {
    params = {};
  }
  var shell = {};
  var bg_color    = params.bg_color   || [ 0.3, 0.5, 0.87 ]
    , camera_pos  = params.camera_pos || [ 0, 0, 50 ]
    , container   = params.container  || "#container";

  var citem = $(container)[0]

  //Create event emitter
  shell.events = new EventEmitter();

  //Initialize GLOW
  shell.context = new GLOW.Context({ width:citem.clientWidth, height:citem.clientHeight });
  shell.context.setupClear({
      red:    bg_color[0]
    , green:  bg_color[1]
    , blue:   bg_color[2]
  });
  GLOW.defaultCamera.localMatrix.setPosition(
      camera_pos[0]
    , camera_pos[1]
    , camera_pos[2]
  );
  GLOW.defaultCamera.update();
  
  //Create arcball camera
  shell.camera = new ArcballCamera();
  shell.buttons = {
      rotate: false
    , pan: false
    , zoom: false
  };
  
  //Hook up controls
  var buttons = shell.buttons;
  shell.container = container;
  $(container)[0].appendChild( shell.context.domElement );
  $(container).mousemove(function(e) {
    var c = $(container);
    shell.camera.update(e.pageX/c.width()-0.5, e.pageY/c.height()-0.5, {
      rotate: buttons.rotate || !(e.ctrlKey || e.shiftKey) && (e.which === 1),
      pan:    buttons.pan    || (e.ctrlKey && e.which !== 0) || (e.which === 2),
      zoom:   buttons.zoom   || (e.shiftlKey && e.which !== 0) || e.which === 3
    })
  });
  $(document).keydown(function(e) {
    if(e.keyCode === 65) {
      buttons.rotate = true;
    }
    if(e.keyCode === 83) {
      buttons.pan = true;
    }
    if(e.keyCode === 68) {
      buttons.zoom = true;
    }
  });
  $(document).keyup(function(e) {
    if(e.keyCode === 65) {
      buttons.rotate = false;
    }
    if(e.keyCode === 83) {
      buttons.pan = false;
    }
    if(e.keyCode === 68) {
      buttons.zoom = false;
    }
  });
  $(container).blur(function(e) {
    buttons.rotate = buttons.pan = buttons.zoom = false;
  })
  
  var forceUpdate = false
  
  function updateShape() {
    var w = citem.clientWidth|0
    var h = citem.clientHeight|0
    if(forceUpdate ||
       w !== shell.context.domElement.width ||
       h !== shell.context.domElement.height ) {
      shell.context.width = w;
      shell.context.height = h;
      shell.context.viewport.width = w;
      shell.context.viewport.height = h;
      shell.context.domElement.width = w;
      shell.context.domElement.height = h;
      GLOW.defaultCamera.aspect = w / h;
      GLOW.Matrix4.makeProjection(
        GLOW.defaultCamera.fov,
        GLOW.defaultCamera.aspect,
        GLOW.defaultCamera.near,
        GLOW.defaultCamera.far,
        GLOW.defaultCamera.projection
      );
      forceUpdate = false
    }
  }
  $(container).bind("DOMSubtreeModified", updateShape)
  $(window).resize(updateShape)
  shell.updateShape = function() {
    forceUpdate = true
    updateShape()
  }
  
  //Render loop
  function render() {
    shell.context.cache.clear();
    shell.context.setViewport();
    GLOW.defaultCamera.update()
    shell.context.enableDepthTest(true);
    if(params.cullCW) {
      shell.context.enableCulling(true, {frontFace: GL.CW, cullFace: GL.BACK});
    } else if(params.cullCCW) {
      shell.context.enableCulling(true, {frontFace: GL.CCW, cullFace: GL.BACK});
    } else {
      shell.context.enableCulling(false);
    }
    shell.context.clear();
  
    shell.events.emit("render");
    
    utils.nextFrame(render);
  }
  shell.updateShape();
  render();
  
  return shell;
}
