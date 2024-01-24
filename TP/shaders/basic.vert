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

layout(binding = 2) uniform Fur {
    FurData fur;
};

uniform mat4 model;  // The model matrix, replaced by the instancing data
uniform uint instance_count;
uniform uint render_mode;
uniform uint left_eye;

#define PI 3.1415

void main() {

    instanceID = gl_InstanceID;
    if (render_mode == 2)
        instanceID = instanceID / 2;
    float instance_ratio = float(instanceID) / float(instance_count);
    vec4 position;

    if (fur.fur_type != 0)
    {
        vec3 wind_displacement = fur.wind_dir * ((instanceID + 1) * 0.01 * fur.wind * sin(float(fur.time) * 2 * PI * fur.wind - instanceID * 0.1f * fur.wind));

        position = model * vec4(in_pos + in_pos * fur.spacing * (instanceID + 1)
        + wind_displacement, 1.0);

        position += vec4(0, -fur.gravity * instanceID, 0, 0);
    }
    else
    {
        position = model * vec4(in_pos, 1.0);
    }

    out_normal = normalize(mat3(model) * in_normal);
    out_tangent = normalize(mat3(model) * in_tangent_bitangent_sign.xyz);
    out_bitangent = cross(out_tangent, out_normal) * (in_tangent_bitangent_sign.w > 0.0 ? 1.0 : -1.0);

    out_uv = in_uv;
    out_color = in_color;
    out_position = position.xyz;

    switch (render_mode)
    {
        case 0:
            gl_Position = frame.camera.view_proj * position;
            break;
        case 1:
            if (bool(left_eye))
                gl_Position = frame.camera.view_proj_left * position;
            else
                gl_Position = frame.camera.view_proj_right * position;
            break;
        case 2:
            if (gl_InstanceID % 2 == 0)
            {
                vec4 position_CS = frame.camera.view_proj_left * position;
                vec4 vPosNDC = position_CS/position_CS.w; //...and further to NDC
                float xNew = (vPosNDC.x - 1.0) / 2.0; //X from [-1,1] to [-1,0]
                vPosNDC.x = xNew;
                gl_Position = vPosNDC*position_CS.w; //Transform back to CS
                //Additional clip plane to the right
                gl_ClipDistance[0] = dot(position, frame.camera.left_eye_right_plane_WS);
            }
            else
            {
                vec4 position_CS = frame.camera.view_proj_right * position;
                vec4 vPosNDC = position_CS/position_CS.w; //...and further to NDC
                float xNew = (vPosNDC.x + 1.0) / 2.0; //X from [-1,1] to [0,1]
                vPosNDC.x = xNew;
                gl_Position = vPosNDC*position_CS.w; //Transform back to CS
                //Additional clip plane to the left
                gl_ClipDistance[0] = dot(position, frame.camera.right_eye_left_plane_WS);
            }
            break;
    }
}

