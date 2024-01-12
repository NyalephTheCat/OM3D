#version 450

#include "utils.glsl"

// fragment shader filling the g-buffer

// #define DEBUG_NORMAL

layout(location = 0) out vec4 out_albedo;
layout(location = 1) out vec4 out_normal;

layout(location = 0) in vec3 in_normal;
layout(location = 1) in vec2 in_uv;
layout(location = 2) in vec3 in_color;
layout(location = 3) in vec3 in_position;
layout(location = 4) in vec3 in_tangent;
layout(location = 5) in vec3 in_bitangent;
layout(location = 6) flat in int instanceID;

layout(binding = 0) uniform sampler2D in_texture;
layout(binding = 1) uniform sampler2D in_normal_texture;
layout(binding = 2) uniform sampler2D in_fur_texture;

layout(binding = 0) uniform Data {
    FrameData frame;
};

layout(binding = 1) buffer PointLights {
    PointLight point_lights[];
};

layout(binding = 2) uniform Fur {
    FurData fur;
};

const vec3 ambient = vec3(0.0);

uniform uint instance_count;
float instance_ratio = float(instanceID) / float(instance_count);

float furNoise(vec2 uv, float scale, float threshold) {
    float x = (uv.x * scale) * 1234.5678f;
    float y = (uv.y * scale) * 4321.1234f;
    float z = dot(vec2(x, y), vec2(12.9898f, 78.233f));
    float noise = fract(sin(z) * 43758.5453f);
    return step(threshold, noise);
}

float fur_pattern(vec2 TexCoords) { // varies depending on fur.density
    float frequency = fur.fur_density * 100 * 2.0 * 3.14159; // Adjust the frequency as needed
    float pattern = sin(TexCoords.x * frequency) * sin(TexCoords.y * frequency);
//    return pattern;
    return step(0.5, pattern); // Convert the pattern to binary (black and white)
}

float stripe_pattern(vec2 TexCoords) {
    return sin(200.0 * TexCoords.x * fur.fur_density) ;
}

float thicc_hairs_pattern(vec2 TexCoords) {
    return sin(fur.fur_density * 300.0 * TexCoords.x) * sin(fur.fur_density * 300.0 * TexCoords.y);
}

void main() {
    #ifdef NORMAL_MAPPED
    const vec3 normal_map = unpack_normal_map(texture(in_normal_texture, in_uv).xy);
    const vec3 normal = normal_map.x * in_tangent +
    normal_map.y * in_bitangent +
    normal_map.z * in_normal;
    #else
    const vec3 normal = in_normal;
    #endif

    if (instanceID == 0) {
        out_albedo = vec4(0.0, 0.0, 0.0, 1.0);
        out_normal = vec4(normal * 0.5 + 0.5, 1.0); //
        return;
    }

    // if fragment is not in the square pattern, discard it
//    if (square_pattern(in_uv) == true)
//        discard;
//    else
//        out_albedo = vec4(1.0, 1.0, 1.0, 1.0);

    float value;
    switch (fur.fur_type) {
        case 1:
            value = fur_pattern(in_uv);
            break;
        case 2:
            value = thicc_hairs_pattern(in_uv);
            break;
        case 3:
            value = stripe_pattern(in_uv);
            break;
        default:
            value = 1;
            break;
    }

    if (value < float(instanceID) / float(instance_count))
        discard;
    else
        out_albedo = vec4(fur.fur_color * instance_ratio, 1.0) * value;

//    out_albedo = vec4(in_color, 1.0);

    #ifdef TEXTURED
    out_albedo *= texture(in_texture, in_uv);
    #endif

    out_normal = vec4(normal * 0.5 + 0.5, 1.0);
    // depth is already written
}

