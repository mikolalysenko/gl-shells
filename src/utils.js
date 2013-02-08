exports.flatten = function(arr) {
  var result = new Array(arr.length * 3);
  for(var i=0,j=0; i<arr.length; ++i, j+=3) {
    var p = arr[i];
    for(var k=0; k<3; ++k) {
      result[j+k] = p[k];
    }
  }
  return result;
}


function push_v(r, p) {
  r.push(p[0]);
  r.push(p[1]);
  r.push(p[2]);
}

exports.flattenFaces = function(faces, arr) {
  var result = [];
  for(var i=0; i<faces.length; ++i) {
    var f = faces[i];
    for(var j=2; j<f.length; ++j) {
      push_v(result, arr[f[0]]);
      push_v(result, arr[f[j-1]]);
      push_v(result, arr[f[j-2]]);
    }
  }
  return result;
}

exports.flattenPerFace = function(faces, arr) {
  var result = [];
  for(var i=0; i<faces.length; ++i) {
    for(var j=2; j<f.length; ++j) {
      push_v(result, arr[i]);
      push_v(result, arr[i]);
      push_v(result, arr[i]);
    }
  }
  return result;
}

var nextFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

exports.nextFrame = function(f) { nextFrame(f); };

exports.printVec3 = function(vec) {
  return "vec3(" + vec[0] + "," + vec[1] + "," + vec[2] + ")";
}