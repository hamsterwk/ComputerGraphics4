"use strict";

var canvas;
var gl;
var points = [],colors=[],indices=[]; 
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

function Sphere(i,j,Radius){
	var x=Math.cos(j/360*Math.PI*2)*Math.cos(i/360*Math.PI*2)*Radius;
	var y=Math.cos(j/360*Math.PI*2)*Math.sin(i/360*Math.PI*2)*Radius;
	var z=Math.sin(j/360*Math.PI*2)*Radius;
	return vec3(x,y,z);
}

function idx(x,y){
	if(x>360)x-=360;
	if(y>90)y-=90;
	var index=(x/step)*(180/step+1)+(y+90)/step;
	//console.log(x,y,index);
	return index;
}

function deal(){
	var Radius=0.8;
	for(var i=0;i<=360;i+=step){//经度
		for(var j=-90;j<=90;j+=step){//纬度
			points.push(Sphere(i,j,Radius));
		}
	}
	
	for(var i=0;i<=360;i+=step){
		for(var j=-90;j<=90;j+=step){
			var A=idx(i,j),B=idx(i+step,j),C=idx(i+step,j+step),D=idx(i,j+step);
			indices.push(vec3(A,B,C));
			indices.push(vec3(A,D,C));
			
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
	

	var squareIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(indices)), gl.STATIC_DRAW);

	
	Xdegree=document.getElementById( "Xdegree" ).value;
	Ydegree=document.getElementById( "Ydegree" ).value;
	Zdegree=document.getElementById( "Zdegree" ).value;
	viewMatrix = gl.getUniformLocation(program,"viewMatrix");
	var vmat = mult(mult(rotateX(Xdegree),rotateY(Ydegree)),rotateZ(Zdegree) );
	gl.uniformMatrix4fv(viewMatrix,false,flatten(vmat));
	
	gl.drawElements( gl.TRIANGLES, indices.length*3, gl.UNSIGNED_SHORT,0);
}
