struct CameraData {
    mat4 view_proj;
    mat4 view_proj_left;
    mat4 view_proj_right;
    vec4 left_eye_right_plane_WS;
    vec4 right_eye_left_plane_WS;
    uint window_width;
};

struct FrameData {
    CameraData camera;

    vec3 sun_dir;
    uint point_light_count;

    vec3 sun_color;
    float padding_1;
};

struct FurData {
    vec3 fur_color;
    float fur_length;
    float fur_density;
    float gravity;
    float spacing;
    float wind;
    vec3 wind_dir;
    double time;
    uint fur_type;
};

struct PointLight {
    vec3 position;
    float radius;
    vec3 color;
    float padding_1;
};

