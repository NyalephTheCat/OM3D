#version 450

#include "utils.glsl"

layout(location = 0) out vec4 out_frag;

layout(binding = 0) uniform sampler2D in_buffer_left;
layout(binding = 1) uniform sampler2D in_buffer_right;

uniform uint g_buffer_mode;
uniform uint stereo_mode;
uniform vec2 resolution;

void main() {
    const ivec2 coord = ivec2(gl_FragCoord.xy);

    vec3 frag;

    if (stereo_mode == 1)
    {
        const vec2 texCoord = gl_FragCoord.xy / resolution;
        if (texCoord.x < 0.5)
            frag = texture2D(in_buffer_left, vec2(texCoord.x * 2.0, texCoord.y)).rgb;
        else
            frag = texture2D(in_buffer_right, vec2(texCoord.x * 2.0 - 1.0, texCoord.y)).rgb;

        if (g_buffer_mode == 3) // if depth and not albedo or normal
            frag = vec3(pow(frag.r, 0.25));
    }
    else
    {
        frag = texelFetch(in_buffer_left, coord, 0).rgb;

        if (g_buffer_mode == 3) // if depth and not albedo or normal
            frag = vec3(pow(frag.r, 0.25));
    }

    out_frag = vec4(frag, 1.0);
}


