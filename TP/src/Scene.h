#ifndef SCENE_H
#define SCENE_H

#include <SceneObject.h>
#include <PointLight.h>
#include <Camera.h>

#include <vector>
#include <memory>

#include <TypedBuffer.h>

#include <algorithm>
#include <shader_structs.h>

namespace OM3D {

class Scene : NonMovable {

    public:
        Scene();

        static Result<std::unique_ptr<Scene>> from_gltf(const std::string& file_name);

        void render(double delta_time = 0.0f);

        void add_object(SceneObject obj);
        void add_light(PointLight obj);

        Span<const SceneObject> objects() const;
        Span<const PointLight> point_lights() const;

        Camera& camera();
        const Camera& camera() const;

        void set_sun(glm::vec3 direction, glm::vec3 color = glm::vec3(1.0f));

        TypedBuffer<shader::FrameData> *data_buffer() { return &_data_buffer; }
        TypedBuffer<shader::PointLight> *light_buffer() { return &_light_buffer; }

        glm::vec3 sun_direction() const { return _sun_direction; }
        glm::vec3 sun_color() const { return _sun_color; }
        float sun_intensity() const { return _sun_intensity; }
        glm::vec3 ambient_color() const { return _ambient_color; }

//        void updateFurDensity(int density);

        unsigned instance_count = 50;
        unsigned fur_type = 0;
        float fur_length, fur_density, gravity, wind, spacing;
        glm::vec3 fur_color{}, wind_dir{};

    private:
        std::vector<SceneObject> _objects;
        std::vector<PointLight> _point_lights;
        std::vector<std::shared_ptr<Material>> _materials;
//        std::shared_ptr<Texture> _blue_noise_texture;

        glm::vec3 _sun_direction = glm::vec3(0.2f, 1.0f, 0.1f);
        glm::vec3 _sun_color = glm::vec3(1.0f);
        float _sun_intensity = 1.0f;
        glm::vec3 _ambient_color = glm::vec3(0.01f);


        Camera _camera;
        TypedBuffer<shader::FrameData> _data_buffer;
        TypedBuffer<shader::PointLight> _light_buffer;
};

}

#endif // SCENE_H
