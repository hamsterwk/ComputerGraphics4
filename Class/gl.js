"use strict";

var canvas;
var gl;
var points = [],colors=[],indices=[],normals=[]; 
var renderDepth;
var renderType;
var vertices,baseColors;
var viewMatrix;
var Radius=0.5,step=5;
var Xdegree,Ydegree,Zdegree;
var Rv=1.0,Gv=0.0,Bv=0.0;
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

function getR(y){
	return 1.0*(255-(255.0/3600)*y*y)/255;
}

function deal(){
	
/*
	points=[
	vec3(-Radius,-Radius,-Radius),
	vec3(-Radius,-Radius,Radius),
	vec3(-Radius,Radius,-Radius),
	vec3(-Radius,Radius,Radius),
	vec3(Radius,-Radius,-Radius),
	vec3(Radius,-Radius,Radius),
	vec3(Radius,Radius,-Radius),
	vec3(Radius,Radius,Radius),
	];
	
	indices=[
	vec3(0,4,6),
	vec3(6,2,0),
	vec3(1,3,7),
	vec3(7,5,1),
	vec3(3,2,6),
	vec3(6,7,3),
	vec3(1,5,4),
	vec3(4,0,1),
	vec3(3,1,0),
	vec3(0,2,3),
	vec3(5,7,6),
	vec3(6,4,5),
	];
/*
	normals=[
	vec3(0,0,-1),
	vec3(0,0,-1),
	vec3(0,0,1),
	vec3(0,0,1),
	vec3(0,1,0),
	vec3(0,1,0),
	vec3(0,-1,0),
	vec3(0,-1,0),
	vec3(-1,0,0),
	vec3(-1,0,0),
	vec3(1,0,0),
	vec3(1,0,0),
	];

normals=[
	vec3(-1,-1,-1),
	vec3(-1,-1,1),
	vec3(-1,1,-1),
	vec3(-1,1,1),
	vec3(1,-1,-1),
	vec3(1,-1,1),
	vec3(1,1,-1),
	vec3(1,1,1),
	];
	for(var i=0;i<8;i++)colors.push(vec4(0.3,0.5,0.8,1));*/
	
	
	for(var i=0;i<=360;i+=step){//经度
		for(var j=-90;j<=90;j+=step){//纬度
			points.push(Sphere(i,j,Radius));
			colors.push(vec4(Rv,Gv,Bv,1));
			normals.push(vec3(Math.cos(j/360*Math.PI*2)*Math.cos(i/360*Math.PI*2),Math.cos(j/360*Math.PI*2)*Math.sin(i/360*Math.PI*2),Math.sin(j/360*Math.PI*2)));
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

function setLight(gl) {
  var u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
  var u_DiffuseLight = gl.getUniformLocation(program, 'u_DiffuseLight');
  var u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');
  if (!u_DiffuseLight || !u_LightDirection || !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  //设置漫反射光
  gl.uniform3f(u_DiffuseLight, 0.7, 0.7, 0.7);

  var solarAltitude = 180.0;
  var solarAzimuth = 275.0;
  var fAltitude = solarAltitude * Math.PI / 180; //光源高度角
  var fAzimuth = solarAzimuth * Math.PI / 180; //光源方位角

  var arrayvectorX = Math.cos(fAltitude) * Math.cos(fAzimuth);
  var arrayvectorY = Math.cos(fAltitude) * Math.sin(fAzimuth);
  var arrayvectorZ = Math.sin(fAltitude);
  
  var lightDirection = new vec3(0.3,0.7,0);
  lightDirection = normalize(lightDirection);

  gl.uniform3fv(u_LightDirection,flatten(lightDirection));

  //设置环境光
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
}

function render(){
	
	setLight(gl);
	
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
	
	var colorId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	


	var vcolor = gl.getAttribLocation( program, "vcolor" );
	gl.vertexAttribPointer( vcolor, 4, gl.FLOAT, false, 0,0 );
	gl.enableVertexAttribArray( vcolor );
	


	var NormalId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, NormalId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

	var normalLoc = gl.getAttribLocation(program, 'a_Normal');
	gl.enableVertexAttribArray(normalLoc);
	gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
	
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
