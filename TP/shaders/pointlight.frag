#version 450

#include "utils.glsl"

layout(location = 0) out vec4 out_frag;
layout(location = 0) in vec2 in_uv;
layout(binding = 0) uniform sampler2D in_albedo;
layout(binding = 1) uniform sampler2D in_normal;
layout(binding = 2) uniform sampler2D in_depth;

uniform vec3 light_pos;
uniform vec3 light_color;
uniform float light_radius;

uniform mat4 inv_view_proj;

vec3 unproject(vec2 uv, float depth, mat4 inv_viewproj) {
    const vec3 ndc = vec3(uv * 2.0 - vec2(1.0), depth);
    const vec4 p = inv_viewproj * vec4(ndc, 1.0);
    return p.xyz / p.w;
}

void main() {
    const ivec2 coord = ivec2(gl_FragCoord.xy);
    vec3 frag;

    vec3 albedo = texelFetch(in_albedo, coord, 0).rgb;
    vec3 normal = texelFetch(in_normal, coord, 0).rgb;
    float depth = pow(texelFetch(in_depth, coord, 0).r, 0.25);

    vec3 pos = unproject(in_uv, depth, inv_view_proj);

    vec3 light_dir = normalize(light_pos - pos);
    float light_dist = distance(light_pos, pos);
    float light_atten = 1.0 - clamp(light_dist / light_radius, 0.0, 1.0);

    float diffuse = max(dot(normal, light_dir), 0.0);
    vec3 diffuse_color = light_color * diffuse * light_atten;

    frag = albedo * diffuse_color;

    out_frag += vec4(frag, 1.0);
}