#version 450

#include "utils.glsl"

layout(location = 0) in vec3 in_pos;
layout(location = 1) in vec3 in_normal;
layout(location = 2) in vec2 in_uv;
layout(location = 3) in vec4 in_tangent_bitangent_sign;
layout(location = 4) in vec3 in_color;

layout(location = 0) out vec3 out_normal;
layout(location = 1) out vec2 out_uv;
layout(location = 2) out vec3 out_color;
layout(location = 3) out vec3 out_position;
layout(location = 4) out vec3 out_tangent;
layout(location = 5) out vec3 out_bitangent;
layout(location = 6) flat out int instanceID;

layout(binding = 0) uniform Data {
    FrameData frame;
};

// to make uniform
uniform uint instance_count;
float spacing = 0.05;
float gravity = 0;

uniform mat4 model;  // The model matrix, replaced by the instancing data

void main() {

    instanceID = gl_InstanceID;
    vec4 position = model * vec4(in_pos + spacing * (gl_InstanceID + 1), 1.0);

    position += vec4(0, -gravity * gl_InstanceID, 0, 0);

    out_normal = normalize(mat3(model) * in_normal);
    out_tangent = normalize(mat3(model) * in_tangent_bitangent_sign.xyz);
    out_bitangent = cross(out_tangent, out_normal) * (in_tangent_bitangent_sign.w > 0.0 ? 1.0 : -1.0);

    out_uv = in_uv;
    out_color = in_color;
    out_position = position.xyz;

    gl_Position = frame.camera.view_proj * position;
}

