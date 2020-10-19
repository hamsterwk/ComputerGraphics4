"use strict";

var canvas;
var gl;
var points = [],colors=[],textureCoordData=[]; 
var renderDepth;
var renderType;
var vertices,baseColors;
var viewMatrix;
var step;
var Xdegree,Ydegree,Zdegree;
var program;
window.onload = function init()
{
	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	gl.enable(gl.DEPTH_TEST);
	step = document.getElementById( "step" ).value;
	step = parseInt(step);
	//deal
	deal();


	render();
};

function Orb(i,j,Radius){
	var x=Math.cos(j/360*Math.PI*2)*Math.cos(i/360*Math.PI*2)*Radius;
	var y=Math.cos(j/360*Math.PI*2)*Math.sin(i/360*Math.PI*2)*Radius;
	var z=Math.sin(j/360*Math.PI*2)*Radius;
	return vec3(x,y,z);
}


function deal(){
	var Radius=0.8;
	for(var i=0;i<360;i+=step){//经度
		for(var j=-90;j<90;j+=step){//纬度

			points.push(Orb(i,j,Radius));
			points.push(Orb(i+step,j,Radius));
			points.push(Orb(i+step,j+step,Radius));
			points.push(Orb(i,j,Radius));
			points.push(Orb(i,j+step,Radius));
			points.push(Orb(i+step,j+step,Radius));
		}
	}
}

function render(){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0,0,canvas.width, canvas.height);

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	/*var colorId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );*/
	


	/*var vcolor = gl.getAttribLocation( program, "vcolor" );
	gl.vertexAttribPointer( vcolor, 3, gl.FLOAT, false, 0,0 );
	gl.enableVertexAttribArray( vcolor );*/
	
	Xdegree=document.getElementById( "Xdegree" ).value;
	Ydegree=document.getElementById( "Ydegree" ).value;
	Zdegree=document.getElementById( "Zdegree" ).value;
	viewMatrix = gl.getUniformLocation(program,"viewMatrix");
	var vmat = mult(mult(rotateX(Xdegree),rotateY(Ydegree)),rotateZ(Zdegree) );
	gl.uniformMatrix4fv(viewMatrix,false,flatten(vmat));
	
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
