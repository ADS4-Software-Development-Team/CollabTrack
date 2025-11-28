//User register an account
//User create a workspace and become admin of it
//User add workspace members
//Workspace admin create a project
//Become an admin of that project
//Admin of that project add project members
import { supabase } from "../config/database.js";
 
export const createWorkspace = async (workspaceData) => {
    try {
        const { data, error } = await supabase
            .from("workspaces")
            .insert(workspaceData)
            .select()
            .single();
    
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error("Error creating workspace:", error);
        throw error;
    }
}

export const addWorkspaceMember = async ({ workspace_id, user_id, member_role }) => {
    try {
        const { data, error } = await supabase
            .from("workspace_members")
            .insert({ workspace_id, user_id, member_role })
            .select()
            .single();
    
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error("Error adding workspace member:", error);
        throw error;
    }

}
 
export const getWorkspaceMembers = async (workspace_id) => {
    try {
        const{data,error} = await supabase
            .from("workspace_members")
            .select("*")
            .eq("workspace_id", workspace_id)
        if(error) throw error;
        return data;
     }catch (error) {
        console.error("Error fetching workspace members:", error);
        throw error;
    }

}
