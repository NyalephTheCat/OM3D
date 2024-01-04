#include "Scene.h"

#include <TypedBuffer.h>

#include <algorithm>
#include <shader_structs.h>

namespace OM3D {

Scene::Scene() {
    instance_count = 50;
    fur_length = 0.5f;
    fur_density = 0.5f;
    gravity = 0.0f;
    wind = 0.0f;
    spacing = fur_length / instance_count;
    fur_color = glm::vec3(1.0f);
    wind_dir = glm::vec3(0.0f);
//    _blue_noise_texture = std::make_shared<Texture>(Texture::BlueNoiseTexture(64)) ;
}

void Scene::add_object(SceneObject obj) {
    if (std::find(_materials.begin(), _materials.end(), obj.material()) == _materials.end())
        _materials.emplace_back(obj.material());
    _objects.emplace_back(std::move(obj));
}

void Scene::add_light(PointLight obj) {
    _point_lights.emplace_back(std::move(obj));
}

Span<const SceneObject> Scene::objects() const {
    return _objects;
}

Span<const PointLight> Scene::point_lights() const {
    return _point_lights;
}

Camera& Scene::camera() {
    return _camera;
}

const Camera& Scene::camera() const {
    return _camera;
}

void Scene::set_sun(glm::vec3 direction, glm::vec3 color) {
    _sun_direction = direction;
    _sun_color = color;
}

void Scene::render(float delta_time) {
    // Fill and bind frame data buffer
    _data_buffer = TypedBuffer<shader::FrameData>(nullptr, 1);
    {
        auto mapping = _data_buffer.map(AccessType::WriteOnly);
        mapping[0].camera.view_proj = _camera.view_proj_matrix();
        mapping[0].point_light_count = u32(_point_lights.size());
        mapping[0].sun_color = _sun_color;
        mapping[0].sun_dir = glm::normalize(_sun_direction);
    }
    _data_buffer.bind(BufferUsage::Uniform, 0);

    // Fill and bind lights buffer
    _light_buffer = TypedBuffer<shader::PointLight>(nullptr, std::max(_point_lights.size(), size_t(1)));
    {
        auto mapping = _light_buffer.map(AccessType::WriteOnly);
        for(size_t i = 0; i != _point_lights.size(); ++i) {
            const auto& light = _point_lights[i];
            mapping[i] = {
                light.position(),
                light.radius(),
                light.color(),
                0.0f
            };
        }
    }
    _light_buffer.bind(BufferUsage::Storage, 1);

    auto fur_buffer = TypedBuffer<shader::FurData>(nullptr, 1);
    {
        auto mapping = fur_buffer.map(AccessType::WriteOnly);
        mapping[0] = {
                fur_color, fur_length, fur_density, gravity, spacing, wind, wind_dir
        };
    }
    fur_buffer.bind(BufferUsage::Uniform, 2);

    // Render every object
    for(const SceneObject& obj : _objects) {
        // is my object seen ? (inside the camera frustum)
//        if (obj.check_frustum(camera()))
        if (obj.isFur())
            obj.renderFur(instance_count, delta_time);
        else
            obj.render();
    }

}

//void Scene::updateFurDensity(int density) {
//    *_blue_noise_texture = Texture::BlueNoiseTexture(density);
//
//    for (auto& obj : _objects) {
//        if (obj.isFur())
//            obj.material()->set_texture(2, _blue_noise_texture);
//    }
//}

}
