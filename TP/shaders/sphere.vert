#version 450

#include "utils.glsl"

layout(location = 0) in vec3 in_pos;
layout(location = 2) in vec2 in_uv;

layout(location = 1) out vec2 out_uv;
layout(location = 3) out vec3 out_position;

uniform mat4 model;

uniform vec3 light_pos;
uniform vec3 light_color;
uniform float light_radius;

uniform mat4 view_proj;

void main() {
    vec4 position = model * vec4(in_pos * light_radius, 1.0);
    // have light_radius multiply position to get the correct light radius in world space
    position = vec4(position.xyz + normalize(position.xyz - light_pos) * light_radius, 1.0);
    //const vec4 position = instanceMatrix[gl_InstanceID] * vec4(in_pos, 1.0);


    out_uv = in_uv;
    out_position = position.xyz;

    gl_Position = view_proj * position;
}