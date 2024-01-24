#version 450 core
#extension GL_NV_stereo_view_rendering : require

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

layout(binding = 2) uniform Fur {
    FurData fur;
};

uniform mat4 model;  // The model matrix, replaced by the instancing data
uniform uint instance_count;
uniform uint render_mode;
//uniform uint left_eye;
uniform float IPD;

float instance_ratio = float(gl_InstanceID) / float(instance_count);

#define PI 3.1415

void main() {

    instanceID = gl_InstanceID;
//    vec4 position = model * vec4((in_pos + in_pos * fur.spacing * (gl_InstanceID + 1)) * sin(time), 1.0);
    vec3 wind_displacement = fur.wind_dir * ( (gl_InstanceID + 1) * 0.01 * fur.wind * sin(float(fur.time) * 2 * PI * fur.wind - gl_InstanceID * 0.1f * fur.wind) );
    vec4 position = model * vec4(in_pos + in_pos * fur.spacing * (gl_InstanceID + 1)
                                        + wind_displacement, 1.0);
    position += vec4(0, -fur.gravity * gl_InstanceID, 0, 0);

    out_normal = normalize(mat3(model) * in_normal);
    out_tangent = normalize(mat3(model) * in_tangent_bitangent_sign.xyz);
    out_bitangent = cross(out_tangent, out_normal) * (in_tangent_bitangent_sign.w > 0.0 ? 1.0 : -1.0);

    out_uv = in_uv;
    out_color = in_color;
    out_position = position.xyz;

    mat4 view = frame.camera.view;

    gl_Position = frame.camera.proj * translate(view, frame.camera.right * -IPD) * position;
    gl_SecondaryPositionNV = frame.camera.proj * translate(view, frame.camera.right * IPD) * position; // Offset for the secondary view
    gl_SecondaryViewportMaskNV[0] = 0x3; // Use the first two viewports for the secondary view
}

