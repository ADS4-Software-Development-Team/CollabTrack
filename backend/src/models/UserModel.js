// models/customerModel.js
import { supabase } from "../config/database.js";

//Add a new user
export const addUser = async (
    username,
    email,
    first_name,
    last_name,
    password_hash,
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
        password_hash,
        user_role,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding user:", error);
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
    console.error("Error fetching user:", error);
    throw error;
  }
};

//Get user by ID
export const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

//Get user by Email
export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
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
    console.error("Error updating user:", error);
    throw error;
  }
};

//Delete user
export const deleteUser = async (id) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};