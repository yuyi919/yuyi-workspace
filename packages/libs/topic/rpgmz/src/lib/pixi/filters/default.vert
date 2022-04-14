attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
// uniform mat3 modelViewMatrix;

varying vec2 vTextureCoord;
// varying vec2 vUv;
void main(void)
{
  gl_Position=vec4((projectionMatrix*vec3(aVertexPosition,1.)).xy,0.,1.);
  vTextureCoord=aTextureCoord;
  // vUv=aTextureCoord;
  // gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
