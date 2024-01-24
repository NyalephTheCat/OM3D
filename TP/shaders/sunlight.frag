#version 450

#include "utils.glsl"

layout(location = 0) out vec4 out_frag;

layout(binding = 0) uniform sampler2D in_albedo_left;
layout(binding = 1) uniform sampler2D in_normal_left;
layout(binding = 2) uniform sampler2D in_depth_left;
layout(binding = 3) uniform sampler2D in_albedo_right;
layout(binding = 4) uniform sampler2D in_normal_right;
layout(binding = 5) uniform sampler2D in_depth_right;

uniform vec3 sun_dir;
uniform vec3 sun_color;
uniform float sun_intensity;
uniform vec3 ambient_color;

uniform vec2 resolution;
uniform uint stereo_mode;

void main() {
    const ivec2 coord = ivec2(gl_FragCoord.xy);
    vec3 frag;

    if (stereo_mode == 1)
    {
        const vec2 texCoord = gl_FragCoord.xy / resolution;
        if (texCoord.x < 0.5)
        {
            vec3 albedo = texture2D(in_albedo_left, vec2(texCoord.x * 2.0, texCoord.y)).rgb;
            vec3 normal = texture2D(in_normal_left, vec2(texCoord.x * 2.0, texCoord.y)).rgb;
            float depth = pow(texture2D(in_depth_left, vec2(texCoord.x * 2.0, texCoord.y)).r, 0.25);

            float diffuse = max(dot(normal, normalize(sun_dir)), 0.0);
            frag = albedo * sun_color * sun_intensity * diffuse;

            frag += albedo * ambient_color;
        }
        else
        {
            vec3 albedo = texture2D(in_albedo_right, vec2((texCoord.x * 2.0 - 1.0), texCoord.y)).rgb;
            vec3 normal = texture2D(in_normal_right, vec2((texCoord.x * 2.0 - 1.0), texCoord.y)).rgb;
            float depth = pow(texture2D(in_depth_right, vec2((texCoord.x * 2.0 - 1.0), texCoord.y)).r, 0.25);

            float diffuse = max(dot(normal, normalize(sun_dir)), 0.0);
            frag = albedo * sun_color * sun_intensity * diffuse;

            frag += albedo * ambient_color;
        }
    }
    else
    {
        vec3 albedo = texelFetch(in_albedo_left, coord, 0).rgb;
        vec3 normal = texelFetch(in_normal_left, coord, 0).rgb;
        float depth = pow(texelFetch(in_depth_left, coord, 0).r, 0.25);

        // Apply diffuse
        float diffuse = max(dot(normal, normalize(sun_dir)), 0.0);
        frag = albedo * sun_color * sun_intensity * diffuse;

        // Apply ambient
        frag += albedo * ambient_color;
    }

    out_frag = vec4(frag, 1.0);
}