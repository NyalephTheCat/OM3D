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
    wind = 0.5f;
    spacing = 0.01f;
    fur_color = glm::vec3(1.0f);
    wind_dir = glm::vec3(1.0f, 0.0f, 0.0f);
    fur_type = 0;
//    _blue_noise_texture = std::make_shared<Texture>(Texture::BlueNoiseTexture(64)) ;

    eye_separation = 0.0f;
}

void Scene::updateFurLength() {
    instance_count = static_cast<unsigned int>(fur_length / spacing);
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

void Scene::render(double delta_time, unsigned char stereo_mode, bool left_eye) {
    glm::mat4 view_proj_left, view_proj_right;
    glm::vec4 left_eye_right_plane_WS, right_eye_left_plane_WS;
    if (stereo_mode > 0) {
        view_proj_left = _camera.view_proj_matrix() * glm::translate(glm::mat4(1.0f), _camera.right() * -eye_separation);
        view_proj_right = _camera.view_proj_matrix() * glm::translate(glm::mat4(1.0f), _camera.right() * eye_separation);
        if (stereo_mode > 1) {
            left_eye_right_plane_WS = glm::vec4(_camera.build_frustum_WS()._right_normal, -eye_separation);
            right_eye_left_plane_WS = glm::vec4(_camera.build_frustum_WS()._left_normal, eye_separation);
        }
//        _camera.set_ratio(16.0f / 9.0f * 2.0f);
    }
    // Fill and bind frame data buffer
    _data_buffer = TypedBuffer<shader::FrameData>(nullptr, 1);
    {
        auto mapping = _data_buffer.map(AccessType::WriteOnly);
        mapping[0].camera.view_proj = _camera.view_proj_matrix();
        if (stereo_mode > 0) {
            mapping[0].camera.view_proj_left = view_proj_left;
            mapping[0].camera.view_proj_right = view_proj_right;
        }
        if (stereo_mode > 1) { // for instanced stereo rendering
            mapping[0].camera.left_eye_right_plane_WS = left_eye_right_plane_WS;
            mapping[0].camera.right_eye_left_plane_WS = right_eye_left_plane_WS;
            mapping[0].camera.window_width = window_width;
        }
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
                fur_color, fur_length, fur_density, gravity, spacing, wind, wind_dir, delta_time, fur_type
        };
    }
    fur_buffer.bind(BufferUsage::Uniform, 2);

    // Render every object
    for(const SceneObject& obj : _objects) {
        // is my object seen ? (inside the camera frustum)
//        if (obj.check_frustum(camera()))
        if (fur_type != 0 && obj.isFur()) {
            // measure distance from camera to object
            auto distance = glm::distance(camera().position(), obj.position());
            // if distance is greater than distance_before_fade, fade the object
            auto instance_count_ = instance_count;
            if (distance > _distance_before_fade) {
                // reduce instance count
                auto ratio = 1 - (distance - _distance_before_fade) / 10;
                if (ratio < 0.2f)
                    ratio = 0.2f;
                instance_count_ = (unsigned) (instance_count * ratio);

            }
            instance_count_ *= (stereo_mode == 2 ? 2 : 1);
            obj.renderFur(instance_count_, stereo_mode, left_eye);
        }
        else
            obj.render(stereo_mode, left_eye);
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
