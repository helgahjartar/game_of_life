// webgl global variables
var gl;
var canvas;

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist;
var zDistCube;

// Cubes to be drawn
var cubes = [];
var grid;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 36, gl.DYNAMIC_DRAW);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 128, gl.DYNAMIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 1024, gl.DYNAMIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var pers = perspective( 90.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(pers));

    attachEventHandlers();

    // Set grid around cubes
    grid = new grid();
    grid.init(gl, vBuffer, cBuffer, iBuffer, mvLoc);

    // Set camera view
    zDist = -12.0;
    zDistCube = -6.7;

    // Build cubes
    makeCubes(true);

    render();
}

function reloadPage() {
    location.reload();
}

function attachEventHandlers() {

    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        // Disable drag and drop
        e.preventDefault();
    });

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    });

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    window.addEventListener("mousewheel", function(e) {
      if (e.wheelDelta < 0) {
        zDist += 0.5;
        zDistCube += 0.3;
      }

      if (e.wheelDelta > 0) {
        zDist -= 0.5;
        zDistCube -= 0.3;
      }
    });
}

function makeCubes(initial) {

  var x = 2.7;  //inital location of first cube
  var y = 2.7;
  var z = 2.7;

  var i = 0;
  var s = 10;
  var q = 0;
  for (var q = 0; q < 10; q++) {
    z = 2.7;
    for (var p = 0; p < 10; p++) {
      x = 2.7;
      for (i; i < s; i++) {
        if (initial == true) {
          cubes[i] = new cube();
          cubes[i].init(gl, vBuffer, cBuffer, iBuffer, mvLoc, x, y, z);
        } else {
          cubes[i].updateCubes(cubes, i);
          cubes[i].updateCell(cBuffer);
        }
        x -= 0.54;
      }
      z -= 0.54;
      i += 10;
      s += 20;
    }
    y -= 0.54;
  }
}

function render() {
  setTimeout(function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    grid.render(spinX, spinY, zDist);

    cubes.forEach(function(cb) {
        cb.render(spinX, spinY, zDistCube);
    });

    makeCubes(false);
    requestAnimFrame( render );

  }, 40)
}
