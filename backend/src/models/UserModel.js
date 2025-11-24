// models/customerModel.js
import { supabaseConnection } from "../config/db.js";

//Add a new user
export const addUser = async (
    username,
    email,
    first_name,
    last_name,
    hashedPassword,
    user_role,
  
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email,
        first_name,
        last_name,
        hashedPassword,
        user_role,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

//Get all users
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("username", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

//Get user by username
export const getUserByUsername = async (id) => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw error;
  }
};

//Get user by Email
export const getUseByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching customer by email:", error);
    throw error;
  }
};



// Update a user
export const updateUser = async (
  id,
  { full_name, email, user_role,}
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ full_name, email, role })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

//Delete user
export const deleteUser = async (id) => {
  try {
    const { data, error } = await supabase
      .from("user")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
