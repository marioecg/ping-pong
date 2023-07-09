precision highp float;

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float textureWidth;
uniform float textureHeight;

void main() {
    vec4 color = vec4(0.0,0.0,0.0,0.0);
    float denom = 0.0;

    for (int i=-5; i<=5; i++) {
        float u = vUv.x + float(i) / textureWidth;
        if (u > 0.0 && u < 1.0) {
            denom += 1.0;
            color += texture2D(tDiffuse, vec2(u, vUv.y));
        }
    }
    
    gl_FragColor = color / denom;
}