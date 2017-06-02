// global webgl variables
var gl;
var mvLoc;
var vBuffer;
var cBuffer;
var iBuffer;

var grid = (function (){
    var x = 10.0;
    var y = 10.0;
    var z = 10.0;
    var NumVertices = 16;

    var indices = [
        0, 1, 2,
        3, 0, 4,
        5, 6, 7,
        4, 7, 3,
        2, 6, 5,
        1
    ]

    // vertices of the grid
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ]

    // color of the vertices
    var colors = [
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),
        vec4( 1.0, 1.0, 1.0, 0.0 ),

    ]

    var init = function(glIn, vBufferIn, cBufferIn, iBufferIn, mvLocIn) {
        // set global webgl variables
        gl = glIn;
        vBuffer = vBufferIn;
        cBuffer = cBufferIn;
        iBuffer = iBufferIn;
        mvLoc = mvLocIn;
    }

    var render = function(spinX, spinY, zDist) {

        // store information in buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint8Array(indices));

        var mv = lookAt( vec3(0.0, 1.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
        mv = mult( mv, scalem(x, y, z) );
        mv = mult( mv, rotateX(spinX) );
        mv = mult( mv, rotateY(spinY) );

        gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
        gl.drawElements( gl.LINE_LOOP, NumVertices, gl.UNSIGNED_BYTE, 0 );
    }

    return {
        init : init,
        render : render,
        x : x,
        y : y,
        z : z
    }
});
