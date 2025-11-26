import {
  addmember,
  getProjectMembers,
  getProjectByID,
  updateProjectMemberRole,
} from "../models/ProjectMemberModel.js";


export const addMemberToProject = async (req, res) => {
  try {
    const { project_id, user_id, project_role } = req.body;

  
    const allowedRoles = ["manager", "member"];
    if (!allowedRoles.includes(project_role)) {
      return res.status(400).json({
        message: `Invalid project_role. Allowed values are: ${allowedRoles.join(", ")}.`,
      });
    }

    const newMember = await addmember(project_id, user_id, project_role);
    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding project member:", error);
    res.status(500).json({ message: "Failed to add project member" });
  }
};


export const getAllProjectMembers = async (req, res) => {
  try {
    const members = await getProjectMembers();
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Failed to fetch project members" });
  }
};


export const getMembersForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const members = await getProjectByID(projectId);
    if (!members || members.length === 0) {
      return res.status(404).json({ message: "No members found for this project" });
    }
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Failed to fetch project members" });
  }
};


export const updateMemberRole = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { project_role } = req.body;
        const updatedMember = await updateProjectMemberRole(projectId, { project_role });
        res.status(200).json(updatedMember);
    } catch (error) {
        console.error("Error updating project member role:", error);
        res.status(500).json({ message: "Failed to update project member role" });
    }
};