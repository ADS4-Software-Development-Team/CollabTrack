import {
  addUser,
  getUser,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  deleteUser,
} from "../models/customerModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { username, email, first_name, last_name, hashedpassword,user_role } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

      const customer = await addUser(
          username,
          full_name,
          last_name,
          email,
          hashedPassword,
          user_role
    );
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Failed to create customer" });
  }
};

// Get all customers
export const fetchUsers = async (req, res) => {
  try {
    const customers = await getUsers();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID
export const fetchUserById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(cust);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
};

// Update customer
export const modifyCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, address } = req.body;
    const customer = await updateCustomer(
      req.params.id,
      full_name,
      email,
      phone,
      address
    );
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Failed to update customer" });
  }
};

// Delete customer
export const removeCustomer = async (req, res) => {
  try {
    const customer = await deleteCustomer(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res
      .status(200)
      .json({ message: "Customer deleted successfully", customer });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

// Login customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await getCustomerByEmail(email);

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // Compare password
    const match = await bcrypt.compare(password, customer.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: customer.customer_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Don't send the password back to the client
    const { password: _, ...customerInfo } = customer;

    res.json({ message: "Login successful", customer: customerInfo, token });
  } catch (error) {
    console.error("Error logging in customer:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
};
