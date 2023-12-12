## Difference de setup avec le projet de base
Les chemin d'accès de shader & texture sont différents: "../" a été retiré à chacun.\
un flag de compilation a été retiré dans le fichier CMakeLists.txt (mis en commentaire)
\
## Gaussian Splatting
### Steps:
 - load the point cloud file (from .ply or .glb) https://drive.google.com/file/d/1aJOjXLXD7KD7Z3LYyazGvvD5QCgj6IeD/view?usp=drive_link

 #### When are the gaussian splats computed?
https://github.com/MrNeRF/awesome-3D-gaussian-splatting
How to compute it ?
 - ellipse rotation of each point: normal ?
 - covariance: from other points (ellipse box with max range: get 4 points, find opposing ones -> cov A and B) ?
    
 - vertex shader: compute the position of each point( and their gaussian splats ?)
 - usage of a geometry/tessellation/... shader to compute the splats
 - fragment shader: responsible for sorting the splats and rendering them (depth index ?)
 - OPTIONAL: optimise the splatting
 - render the splats

## Autre possibilité de projet:
 - transparency
 - Batch light culling
 - Shell Based Fur Technique