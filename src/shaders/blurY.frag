precision highp float;

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float textureWidth;
uniform float textureHeight;

void main() {
    vec4 color = vec4(0.0);
    float denom = 0.0;
    
    for (int i=-5; i<=5; i++) {
        float v = vUv.y + float(i) / textureWidth;
        if (v > 0.0 && v < 1.0) {
            denom += 1.0;
            color += texture2D(tDiffuse, vec2(vUv.x, v));
        }
    }
    
    gl_FragColor = color / denom;
}