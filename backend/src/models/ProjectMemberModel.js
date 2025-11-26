//Admin – can create projects, manage users, and view all data
import { supabase } from "../config/database.js";

//Add a new user
export const addmember = async (
    project_id,
    user_id,
    project_role,

) => {
  try {
    const { data, error } = await supabase
      .from("project_members") 
      .insert({
       project_id,
       user_id,
       project_role,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding project member:", error);
    throw error;
  }
};

//Get all projectMembers
export const getProjectMembers = async () => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .select("*")
      .order("project_id", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw error;
  }
};

//Get project members by ID
export const getProjectByID = async (project_id) => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", project_id)

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching project by title:", error);
    throw error;
  }
};

//update project members role
export const updateProjectMemberRole = async (project_id, { project_role }) => {
    try {
         const { data, error } = await supabase
           .from("project_members")
           .update({ project_role })
           .eq("project_id", project_id)
           .select()
           .single();

         if (error) throw error;
         return data;

     } catch (error) {
        console.error("Error updating project member role:", error);
        throw error;
    }

}
