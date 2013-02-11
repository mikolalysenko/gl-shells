//Simple mesh viewer
var $             = require('jquery-browserify')
  , GLOW          = require('./GLOW.js').GLOW
  , utils         = require('./utils.js')
  , normals       = require("normals");

var vertexNormals = normals.vertexNormals;
var faceNormals = normals.faceNormals;

exports.makeViewer = function(params) {

  if(!params) {
    params = {};
  }
  var shell = require('./shell.js').makeShell(params);
  
  shell.params = params;
  
  if(!params.lightPosition) {
    params.lightPosition = [100,100,100];
  }

  var shaderInfo = {
    vertexShader: [
      "uniform     mat4     transform;",
      "uniform     mat4     cameraInverse;",
      "uniform     mat4     cameraProjection;",
      
      "attribute  vec3      position;",
      "attribute  vec3      color;",
      "attribute  vec3      normal;",
      
      "varying    vec3      eyeDir;",
      "varying    vec3      f_color;",
      "varying    vec3      f_normal;",
      "varying    vec3      f_position;",
      
      "void main(void) {",
        "vec4 t_position = transform * vec4( position, 1.0 );",
        "gl_Position = cameraProjection * cameraInverse * t_position;",
        "eyeDir = normalize(t_position.xyz);",
        "f_color = color;",
        "f_normal = normal;",
        "f_position = position;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "#ifdef GL_ES",
        "precision highp float;",
      "#endif",
      
      "uniform    vec3  lightPosition;",
      "uniform    float     ambientPower;",
      "uniform    float     diffusePower;",
      "uniform    float     specularPower;",
      
      "varying    vec3      eyeDir;",
      "varying    vec3      f_color;",
      "varying    vec3      f_normal;",
      "varying    vec3      f_position;",
      
      "void main() {",
      
        "vec3 lightDir = normalize(lightPosition - f_position);",

        "float diffuse = clamp(dot(lightDir, f_normal), 0.0, 1.0);",
        "float specular = clamp(dot(f_normal, normalize(lightDir + eyeDir)), 0.0, 1.0);",
        "specular = pow(specular, 32.0);",
        "float intensity = ambientPower + diffusePower * diffuse + specularPower * specular;",
        
        "gl_FragColor = vec4(intensity * f_color, 1.0);",
      "}"
    ].join("\n"),
    data: {
      transform:        new GLOW.Matrix4(),
      cameraInverse:    GLOW.defaultCamera.inverse,
      cameraProjection: GLOW.defaultCamera.projection,
      position:         new Float32Array([0,0,0,1,0,0,0,1,0]),
      color:            new Float32Array([0,0,1,1,0,0,0,1,0]),
      normal:           new Float32Array([0,0,1,0,0,1,0,0,1]),
      lightPosition:    new GLOW.Vector3(params.lightPosition[0], params.lightPosition[1], params.lightPosition[2]),
      ambientPower:     new GLOW.Float(0.4),
      diffusePower:     new GLOW.Float(0.6),
      specularPower:    new GLOW.Float(0.5)
    },
    interleave: {
      position: false,
      normal:   false,
      color:    false
    },
    primitives: GL.TRIANGLES,
    usage:     GL.DYNAMIC_DRAW
  };
  
  
  var wireInfo = {
    vertexShader: [
      "uniform     mat4     transform;",
      "uniform     mat4     cameraInverse;",
      "uniform     mat4     cameraProjection;",
      
      "attribute  vec3      position;",
      
      "void main(void) {",
        "vec4 t_position = transform * vec4( position, 1.0 );",
        "gl_Position = cameraProjection * cameraInverse * t_position;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "#ifdef GL_ES",
        "precision highp float;",
      "#endif",
      
      "void main() {",
        "gl_FragColor = vec4(0, 0, 0, 1);",
      "}"
    ].join("\n"),
    data: {
      transform:        new GLOW.Matrix4(),
      cameraInverse:    GLOW.defaultCamera.inverse,
      cameraProjection: GLOW.defaultCamera.projection,
      position:         new Float32Array([0,0,0,1,0,0]),
    },
    interleave: {
      position: false,
    },
    primitives: GL.LINES,
    usage:     GL.DYNAMIC_DRAW
  };
  
  shell.shader = new GLOW.Shader(shaderInfo);
  shell.wireShader = new GLOW.Shader(wireInfo);
  
  //Update mesh
  shell.updateMesh = function(params) {
    
    var faces = params.faces || params.cells;

    //Update normals
    if(shell.params.flatShaded) {
      var normals = params.faceNormals || faceNormals(faces, params.positions);
      shell.shader.normal.bufferData(new Float32Array(utils.flattenPerFace(faces, normals)));
    } else {
      var normals = params.vertexNormals || vertexNormals(faces, params.positions);
      shell.shader.normal.bufferData(new Float32Array(utils.flattenFaces(faces, normals)));
    }
    
    //Update colors
    if(params.colors) {
      shell.shader.color.bufferData(new Float32Array(utils.flattenFaces(faces, params.colors)));
    } else if(params.faceColors) {
      shell.shader.color.bufferData(new Float32Array(utils.flattenPerFace(faces, params.faceColors)));
    } else {
      for(var i=0; i<normals.length; ++i) {
        for(var j=0; j<3; ++j) {
          normals[i][j] = 0.5 * normals[i][j] + 0.5;
        }
      }
      if(shell.params.flatShaded) {
        shell.shader.color.bufferData(new Float32Array(utils.flattenPerFace(faces, normals)));
      } else {
        shell.shader.color.bufferData(new Float32Array(utils.flattenFaces(faces, normals)));
      }
    }
    
    //Update buffer data
    shell.shader.position.bufferData(new Float32Array(utils.flattenFaces(faces, params.positions)), GL.DYNAMIC_DRAW);
    
    shell.shader.elements.length = 3*utils.elementLen(faces);
    
    if(shell.params.wireframe) {
      var wire_pos = [];
      for(var i=0; i<faces.length; ++i) {
        var f = faces[i];
        for(var j=0; j<f.length; ++j) {
          wire_pos.push(params.positions[f[j]]);
          wire_pos.push(params.positions[f[(j+1)%f.length]]);
        }
      }
      shell.wireShader.position.bufferData(new Float32Array(utils.flatten(wire_pos)));
      shell.wireShader.elements.length = wire_pos.length;
    }
  }

  //Draw mesh
  shell.events.on('render', function() {
    var matrix = shell.camera.matrix()
      , xform0  = shell.shader.transform
      , xform1  = shell.wireShader.transform;
    for(var i=0; i<4; ++i) {
      for(var j=0; j<4; ++j) {
        var ptr = i+4*j;
        xform0.value[ptr] = xform1.value[ptr] = matrix[i][j];
      }
    }
    shell.shader.draw();
    if(shell.params.wireframe) {
      GL.lineWidth(2.0);
      shell.wireShader.draw();
    }
  });

  return shell;
}
