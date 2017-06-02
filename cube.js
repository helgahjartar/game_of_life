// global webgl variables
var gl;

var vBuffer;
var cBuffer;
var iBuffer;
var mvLoc;
var isAlive;
var willBeAlive;
// Transparent
var colors1 = [
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 ),
    vec4( 0.0, 0.0, 0.0, 0.3 )];
// Black
var colors2 =  [
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( 0.0, 0.0, 0.0, 1.0 )];


var cube = (function() {

    var location = vec3();
    var p = Math.random();
    var color;

    var body = {
        NumVertices : 36,

        indices :[
            1, 0, 3,
            3, 2, 1,
            2, 3, 7,
            7, 6, 2,
            3, 0, 4,
            4, 7, 3,
            6, 5, 1,
            1, 2, 6,
            4, 5, 6,
            6, 7, 4,
            5, 4, 0,
            0, 1, 1
        ],

        vertices : [
            vec4( -0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5, -0.5, -0.5, 1.0 ),
            vec4( -0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5, -0.5, -0.5, 1.0 )
        ],

        render : function(mv, p) {
            // Load information into buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            if (p > 0.3) {
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors1));
              color = 0;
            } else {
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors2));
              color = 1;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(this.vertices));

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint8Array(this.indices))

            // scale and translate the body initially
            mv = mult( mv, scalem(0.4, 0.4, 0.4) );
            mv = mult( mv, translate(0.0, 0.0, 0.0) );

            gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
            gl.drawElements( gl.TRIANGLES, this.NumVertices, gl.UNSIGNED_BYTE, 0 );
        }
    }

    var init = function(glIn, vBufferIn, cBufferIn, iBufferIn, mvLocIn, x, y, z) {
        gl = gl;
        vBuffer = vBufferIn;
        cBuffer = cBufferIn;
        iBuffer = iBufferIn;
        mvLoc = mvLocIn;

        location = [x, y, z];
    }

    // Update cell color based on findings from iteration
    var updateCell = function(cBufferIn) {
        cBuffer = cBufferIn;
    }

    var render = function(spinX, spinY, zDistCube) {

        var mv = lookAt( vec3(0.0, 1.0, zDistCube), vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0) );
        mv = mult( mv, rotateX(spinX) );
        mv = mult( mv, rotateY(spinY) );
        mv = mult( mv, translate(location) );

        body.render(mv, p);
    }

    // Check if cell is occupied by checking color
    function cellOccupied(cubes, i) {
      if (cubes[i].getColor() == 1) {
        return 1;
      } else {
        return 0;
      }
    }

    function getColor() {
      return color;
    }

    function countNeighbors(cubes, i) {
      var neighborCount = 0;

      // Location of neighbor cubes in cube array
      var ind = [1, 19, 20, 21, 179, 180, 181, 199, 200, 201, 219, 220, 221];

      for (var q = 0; q < ind.length; q++) {
        // Check if cube exists (or if we are at the end of the grid)
        if(typeof cubes[i-ind[q]] !== 'undefined' && typeof cubes[i-ind[q]].getColor() !== 'undefined'){
          neighborCount += cellOccupied(cubes, i-ind[q]);
        }
      }

      for (var q = 0; q < ind.length; q++) {
        if(typeof cubes[i+ind[q]] !== 'undefined' && typeof cubes[i+ind[q]].getColor() !== 'undefined'){
          neighborCount += cellOccupied(cubes, i+ind[q]);
        }
      }
      return neighborCount;
    }

    // Update if cell will be alive or not based on neighbor count
    function updateCubes(cubes, i) {
      var isAlive;
      var willBeAlive = false;
      var neighborCount = countNeighbors(cubes, i);
      if (cellOccupied(cubes, i) == 1) {
        isAlive = true;
      } else {
        isAlive = false;
      }

      if ((isAlive && (neighborCount == 5 || neighborCount == 6 || neighborCount == 7)) || (!isAlive && neighborCount == 6)) {
            willBeAlive = true;
       }

      if (willBeAlive) {
          p = 0;
      } else {
          p = 1;
      }
    }

    return {
        init : init,
        render : render,
        countNeighbors : countNeighbors,
        getColor : getColor,
        updateCell : updateCell,
        updateCubes : updateCubes
    };
});
