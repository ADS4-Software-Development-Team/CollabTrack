import { createProject, getProjects, getProjectByTitle,updateProject } from "../models/ProjectModel.js"

export const createNewProject = async (req, res) => {
  try {
    const { title, description, status, deadline } = req.body;

      const newProject = await createProject(
        title,
        description,
        status,
        deadline,
        req.user.id 
    );
    res.status(201).json(newProject);
    
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
};

export const viewAllProjects = async (req, res) => {
    try {
    const projects = await getProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}
 
export const viewProjectByTitle = async (req, res) => {
    const { title } = req.params;
  
    try {
        const project = await getProjectByTitle(title);
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Failed to fetch project" });

    }
}

//description", "status", "deadline"
export const updateProjectInfo = async (req, res) => { 
  const { title } = req.params;
  const { description,status,deadline } = req.body;

  try {
    const updatedProject = await updateProject(title, description,status,deadline);
    if (!updateProject) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }

}
