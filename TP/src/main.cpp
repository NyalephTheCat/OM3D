#include <glad/glad.h>

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <imgui/imgui.h>
#include <imgui/imgui_impl_glfw.h>
#include <imgui/imgui_impl_opengl3.h>
#include <stb/stb_image.h>

#include <iostream>
#include <vector>
#include <filesystem>


static float delta_time = 0.0f;
static std::vector<std::string> scene_files;
int currentImageIndex = 0;

float img_width = 0;
float img_height = 0;
std::vector<GLuint> images;

void glfw_check(bool cond) {
    if(!cond) {
        const char* err = nullptr;
        glfwGetError(&err);
        std::cerr << "GLFW error: " << err << std::endl;
        std::exit(EXIT_FAILURE);
    }
}

double program_time() {
    return glfwGetTime();
}

void update_delta_time() {
    static double time = 0.0;
    const double new_time = program_time();
    delta_time = float(new_time - time);
    time = new_time;
}

void process_inputs(GLFWwindow* window) {
    static glm::dvec2 mouse_pos;

    glm::dvec2 new_mouse_pos;
    glfwGetCursorPos(window, &new_mouse_pos.x, &new_mouse_pos.y);

    {
        glm::vec3 movement = {};
        if(glfwGetKey(window, 'W') == GLFW_PRESS) {
        }
        if(glfwGetKey(window, 'S') == GLFW_PRESS) {
        }
        if(glfwGetKey(window, 'D') == GLFW_PRESS) {
        }
        if(glfwGetKey(window, 'A') == GLFW_PRESS) {
        }

        float speed = 10.0f;
        if(glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS) {
            speed *= 10.0f;
        }
    }

    if(glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
        const glm::vec2 delta = glm::vec2(mouse_pos - new_mouse_pos) * 0.01f;
        if(delta.length() > 0.0f) {

        }
    }

    {
        int width = 0;
        int height = 0;
        glfwGetWindowSize(window, &width, &height);
    }

    mouse_pos = new_mouse_pos;
}

int main() {
    // Initialiser GLFW
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    // Créer une fenêtre GLFW
    GLFWwindow* window = glfwCreateWindow(800, 600, "ImGui Demo", NULL, NULL);
    glfwMakeContextCurrent(window);

    // Initialiser GLAD
    gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);

    // Initialiser ImGui
    ImGui::CreateContext();
    ImGui_ImplGlfw_InitForOpenGL(window, true);
    ImGui_ImplOpenGL3_Init("#version 330");

    // Boucle principale
    while (!glfwWindowShouldClose(window)) {
        // Commencer le frame ImGui
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();

        // Afficher la fenêtre de démonstration ImGui
        ImGui::ShowDemoWindow();

        // Terminer le frame ImGui
        ImGui::Render();
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());

        // Échanger les tampons et traiter les événements GLFW
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // Nettoyer ImGui
    ImGui_ImplOpenGL3_Shutdown();
    ImGui_ImplGlfw_Shutdown();
    ImGui::DestroyContext();

    // Nettoyer GLFW
    glfwDestroyWindow(window);
    glfwTerminate();

    return 0;
}
