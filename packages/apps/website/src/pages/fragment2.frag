uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uDistortion;
uniform float uLevel;
uniform float uSpeed;
uniform float uRollSpeed;
varying vec2 vTextureCoord;
vec3 mod289(vec3 x){
  return x-floor(x*(1./289.))*289.;
}
vec2 mod289(vec2 x){
  return x-floor(x*(1./289.))*289.;
}
vec3 permute(vec3 x){
  return mod289(((x*34.)+1.)*x);
}
float snoise(vec2 v)
{
  const vec4 C=vec4(.211324865405187,
    .366025403784439,
    -.577350269189626,
  .024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1;
  i1=(x0.x>x0.y)?vec2(.5,0.):vec2(0.,.5);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289(i);// Avoid truncation effects in permutation
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
  +i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;
  m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
void main(){
  if(uLevel>.0){
    vec2 p=vTextureCoord;
    float ty=uTime*uSpeed;
    float yt=p.y-ty;
    float offset;
    if(uDistortion>0.){
      offset=snoise(vec2(yt*3.,0.))*.2;
      offset=offset*uDistortion*offset*uDistortion*offset;
      offset+=snoise(vec2(yt*500.,0.))*uLevel*.001;
    }else{
      offset=snoise(vec2(yt*500.,0.))*uLevel*.001;
    }
    gl_FragColor=texture2D(tDiffuse,vec2(fract(p.x+offset),fract(p.y-uTime*uRollSpeed)));
  }else{
    gl_FragColor=texture2D(tDiffuse,vTextureCoord);
  }
}
