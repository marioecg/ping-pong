precision highp float;

varying vec2 vUv;

uniform sampler2D tDiffuse;

float srgbSingle(float c) {
    float a = 0.055;
    
    if (c <= 0.0)
    return 0.0;
    else if (c < 0.0031308) {
        return 12.92 * c;
    } else {
        if (c >= 1.0)
        return 1.0;
        else
        return (1.0 + a) * pow(c, 1.0 / 2.4) - a;
    }
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    
    gl_FragColor = vec4(srgbSingle(color.x), srgbSingle(color.y), srgbSingle(color.z), color.w);
}