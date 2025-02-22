#ifndef STATICMESH_H
#define STATICMESH_H

#include <graphics.h>
#include <TypedBuffer.h>
#include <Vertex.h>
#include <glad/glad.h>
#include <glm/glm.hpp>

#include <vector>

namespace OM3D {

struct SphericalBoundingBox {
    glm::vec3 center;
    float radius;
};

struct MeshData {
    std::vector<Vertex> vertices;
    std::vector<u32> indices;
};

class StaticMesh : NonCopyable {

    public:
        StaticMesh() = default;
        StaticMesh(StaticMesh&&) = default;
        StaticMesh& operator=(StaticMesh&&) = default;

        StaticMesh(const MeshData& data);

        // Getter for bounding box
        const SphericalBoundingBox& bounding_box() const;

        void setup() const;
        void draw() const;
        int index_buffer_count() {return int(_index_buffer.element_count());}

    private:
        TypedBuffer<Vertex> _vertex_buffer;
        TypedBuffer<u32> _index_buffer;

        SphericalBoundingBox _bounding_box;
};

}

#endif // STATICMESH_H
