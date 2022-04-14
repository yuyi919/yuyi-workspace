varying vec2 vTextureCoord;//passed from vect shader

uniform sampler2D uSampler;// 2d texture
uniform float uTime;
uniform float uLevel;
uniform bool uRgb;

float rand(float co){
  return fract(sin(dot(co,12.9898+78.233))*43758.5453);
}

void main(void){
  
  if(uLevel>.0){
    vec2 uv=vTextureCoord;
    vec2 uv1=uv;
    // vec2 uv2=uv;
    
    float uClean=1./60.*uLevel/10.;
    uv1.x-=rand(uv.y*uTime)*uClean-uv.x*uClean*1.5;
    // uv2.x+=rand(uv.y*uTime)/60.*uClean;
    // gl_FragColor = texture2D(uSampler,vec2(fract(uv1.x - rand(uv.y*uTime)/60.*uClean),fract(uv1.y)));
    vec4 e=texture2D(uSampler,uv1);
    // vec4 e2=texture2D(uSampler,uv2);
    vec4 bn=vec4(vec3(e.r+e.g+e.b)/3.,1.);
    
    // if(!uRgb){
    //       vec2 offset=vec2(.01*rand(uTime),sin(uTime)/30./10.*uClean);
    //       e.r=texture2D(uSampler,uv+offset.xy).r;
    //       e.g=texture2D(uSampler,uv).g;
    //       e.b=texture2D(uSampler,uv+offset.yx).b;
    // }
    
    if(sin(uTime*rand(uTime))<.99){
      gl_FragColor=mix(e,bn,.0);
    }else{
      uv.x+=rand(uTime)/(sin(uTime)*10.);
      uv.y-=rand(uTime+2.)/(sin(uTime)*10.)/30.;
      // gl_FragColor=texture2D(uSampler,uv);
      gl_FragColor=mix(e,bn,.0);
    }
  }else{
    gl_FragColor=texture2D(uSampler,vTextureCoord);
  }
}
