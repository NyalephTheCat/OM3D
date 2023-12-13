#version 450

#include "utils.glsl"

layout(location = 0) out vec4 out_color;

layout(location = 1) in vec2 in_uv;
layout(location = 3) in vec3 in_position;

layout(binding = 0) uniform sampler2D in_albedo;
layout(binding = 1) uniform sampler2D in_normal;
layout(binding = 2) uniform sampler2D in_depth;

uniform mat4 model;

uniform vec3 light_pos;
uniform vec3 light_color;
uniform float light_radius;

uniform mat4 view_proj;

vec3 unproject(vec2 uv, float depth, mat4 inv_viewproj) {
    const vec3 ndc = vec3(uv * 2.0 - vec2(1.0), depth);
    const vec4 p = inv_viewproj * vec4(ndc, 1.0);
    return p.xyz / p.w;
}

float light_intensity = 1.0;

float light_intensity(vec3 light_pos, vec3 light_color, float light_radius, vec3 frag_pos) {
    float dist = length(light_pos - frag_pos);
    float intensity = 1.0 - clamp(dist / light_radius, 0.0, 1.0);
    return intensity;
}

void main() {
    const ivec2 coord = ivec2(gl_FragCoord.xy);
    vec3 frag;

    vec3 albedo = texelFetch(in_albedo, coord, 0).rgb;
    vec3 normal = texelFetch(in_normal, coord, 0).rgb;
    float depth = pow(texelFetch(in_depth, coord, 0).r, 0.25);

    vec3 world_pos = unproject(in_uv, depth, inverse(view_proj));
    vec3 view_dir = normalize(-world_pos);
    vec3 light_dir = normalize(light_pos - world_pos);

    // Apply light attenuation
    light_intensity = light_intensity(light_pos, light_color, light_radius, world_pos);

    // Apply diffuse
    float diffuse = max(dot(normal, normalize(light_dir)), 0.0);
    frag = albedo * light_color * light_intensity * diffuse;

    // Apply specular
    //    vec3 reflect = reflect(-sun_dir, normal);
    //    float specular = pow(max(dot(reflect, view_dir), 0.0), 32.0);
    //    vec3 ks = vec3(0.03);
    //    frag += sun_color * specular * ks;

    // Apply ambient
//    frag += albedo * ambient_color;  // to multiply with albedo doesn't make sense ?
    //    frag = clamp(frag, 0.0, 0.1); // for debugging

    out_frag += vec4(frag, 1.0);
}