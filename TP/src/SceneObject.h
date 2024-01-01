#ifndef SCENEOBJECT_H
#define SCENEOBJECT_H

#include <StaticMesh.h>
#include <Material.h>
#include <Camera.h>

#include <memory>

#include <glm/matrix.hpp>

namespace OM3D {

class SceneObject {

    public:
        SceneObject(std::shared_ptr<StaticMesh> mesh = nullptr, std::shared_ptr<Material> material = nullptr);

        void setup() const;
        void render() const;
        void renderFur() const;

        void set_transform(const glm::mat4& tr);
        const glm::mat4& transform() const;

        bool check_frustum(const Camera camera) const;
        std::shared_ptr<Material> material() const { return _material; }

        SphericalBoundingBox bounding_box() const;
        int index_buffer_count() {return _mesh->index_buffer_count();}

    private:
        glm::mat4 _transform = glm::mat4(1.0f);

        std::shared_ptr<StaticMesh> _mesh;
        std::shared_ptr<Material> _material;

};

}

#endif // SCENEOBJECT_H
