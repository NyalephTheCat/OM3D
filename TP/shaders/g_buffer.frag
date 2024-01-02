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

layout(binding = 0) uniform Data {
    FrameData frame;
};

layout(binding = 1) buffer PointLights {
    PointLight point_lights[];
};

const vec3 ambient = vec3(0.0);

uniform uint instance_count;
uint fur_density = 10; // nb of hair per unit somewhat
float hair_width = 0.1; // [0-1]

bool square_pattern(vec2 TexCoords) {

    // marginSize depends on fur_density, hair_width and gl_InstanceID
//    float marginSize = (hair_width / fur_density) * (1.0 + float(instanceID) / float(instance_count));
    float marginSize = 0.05;

    vec2 pos = TexCoords / fur_density;
    vec2 inSquarePos = fract(pos);

    bool inMargin = any(lessThan(inSquarePos, vec2(marginSize)))
                 || any(greaterThan(inSquarePos, vec2(1.0 - marginSize)));
    if (inMargin)
        return false;

    bool inOddSquare = bool(int(floor(pos.x) + floor(pos.y)) % 2);
    if (inOddSquare)
        return true;
    else
        return false;
}

float stripe_pattern(vec2 TexCoords) {
    return sin(100.0 * TexCoords.x) * sin(100.0 * TexCoords.y);
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

    // if fragment is not in the square pattern, discard it
//    if (square_pattern(in_uv) == true)
//        discard;
//    else
//        out_albedo = vec4(1.0, 1.0, 1.0, 1.0);

    float value = stripe_pattern(in_uv);
    if (value < 0.2 + 1 * float(instanceID) / float(instance_count))
        discard;
    else
        out_albedo = vec4(1.0, 1.0, 1.0, 1.0) * value;

//    out_albedo = vec4(in_color, 1.0);

//    #ifdef TEXTURED
//    out_albedo *= texture(in_texture, in_uv);
//    #endif

    out_normal = vec4(normal * 0.5 + 0.5, 1.0);
    // depth is already written
}

