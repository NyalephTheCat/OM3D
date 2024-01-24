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

float pseudoBlueNoise(int x, int y) {
    const int s = 6;
    int a, b, v = 0;

    for (int i = 0; i < s; ++i) {
        b = y;
        a = 1 & (x ^ int(float(x * 212281 + y * 384817) * 0.003257328990228013));
        b = 1 & (b ^ int(float(x * 484829 + y * 112279) * 0.002004008016032064));
        x >>= 1;
        y >>= 1;
        v = (v << 2) | (a + (b << 1) + 1) % 4;
    }

    return float(v) / float(1 << (s << 1));
}

float blue_noise(vec2 TexCoords) {
    return pseudoBlueNoise(int(TexCoords.x * 1024.0 * fur.fur_density), int(TexCoords.y * 1024.0 * fur.fur_density));
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

    out_normal = vec4(normal * 0.5 + 0.5, 1.0);

    if (fur.fur_type == 0) {  // no fur
        out_albedo = vec4(fur.fur_color * in_color, 1.0);
        #ifdef TEXTURED
        out_albedo *= texture(in_texture, in_uv);
        #endif
        return;
    }

    if (instanceID == 0) {
        out_albedo = vec4(0.0, 0.0, 0.0, 1.0);
        out_normal = vec4(normal * 0.5 + 0.5, 1.0); //
        return;
    }

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
        case 4:
            value = blue_noise(in_uv);
            break;
        default:
            value = 1;
            break;
    }

    if (value < float(instanceID) / float(instance_count))
        discard;
    else
        out_albedo = vec4(fur.fur_color * instance_ratio, 1.0) * value;

    #ifdef TEXTURED
    out_albedo *= texture(in_texture, in_uv);
    #endif
    // depth is already written
}

