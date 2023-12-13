#version 450

#include "utils.glsl"

layout(location = 0) out vec4 out_frag;

layout(binding = 0) uniform sampler2D in_albedo;
layout(binding = 1) uniform sampler2D in_normal;
layout(binding = 2) uniform sampler2D in_depth;

uniform vec3 sun_dir;
uniform vec3 sun_color;
uniform float sun_intensity;
uniform vec3 ambient_color;

uniform vec3 view_dir;

void main() {
    const ivec2 coord = ivec2(gl_FragCoord.xy);
    vec3 frag;

    vec3 albedo = texelFetch(in_albedo, coord, 0).rgb;
    vec3 normal = texelFetch(in_normal, coord, 0).rgb;
//    float depth = pow(texelFetch(in_depth, coord, 0).r, 0.25);

    // Apply diffuse
    float diffuse = max(dot(normal, normalize(sun_dir)), 0.0);
    frag = albedo * sun_color * sun_intensity * diffuse;

    // Apply specular
//    vec3 reflect = reflect(-sun_dir, normal);
//    float specular = pow(max(dot(reflect, view_dir), 0.0), 32.0);
//    vec3 ks = vec3(0.03);
//    frag += sun_color * specular * ks;

    // Apply ambient
    frag += albedo * ambient_color;  // to multiply with albedo doesn't make sense ?
//    frag = clamp(frag, 0.0, 0.1); // for debugging

    out_frag = vec4(frag, 1.0);
}