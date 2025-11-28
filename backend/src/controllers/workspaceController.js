import {
  createWorkspace,
  addWorkspaceMember,
  getWorkspaceMembers,
} from "../models/WorkspaceModel.js";

// Create a new workspace and add the creator as an admin member
export const createAndJoinWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // from protect middleware

    // 1. Create the workspace
    const newWorkspace = await createWorkspace({
      name,
      description,
      created_by: userId,
    });

    // 2. Add the creator as the first member with an 'admin' role
    const memberDetails = {
      workspace_id: newWorkspace.id,
      user_id: userId,
      member_role: "admin", // The creator is the admin
    };
    await addWorkspaceMember(memberDetails);

    res.status(201).json({
      message: "Workspace created and user added as admin.",
      workspace: newWorkspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Failed to create workspace" });
  }
};

//Add a new member to a specific workspace
export const addMemberToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { user_id, member_role } = req.body;

    const newMember = await addWorkspaceMember({ workspace_id: workspaceId, user_id, member_role });
    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding workspace member:", error);
    res.status(500).json({ message: "Failed to add workspace member" });
  }
};

// Get all members for a specific workspace
export const getMembersOfWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const members = await getWorkspaceMembers(workspaceId);
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    res.status(500).json({ message: "Failed to fetch workspace members" });
  }
};