"use server";

import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";
import { validateRegister } from "@/validators/auth.validator";

/**
 * Server Action: Registers a new user (Organizer or Volunteer)
 * 
 * Flow:
 * 1. Extract and validate fields
 * 2. Check for duplicate email in MongoDB
 * 3. Hash password using bcryptjs (salt rounds: 10)
 * 4. Insert user into users collection
 * 5. Return structured result { success, message, errors }
 * 
 * @param {Object|FormData} inputData
 * @returns {Promise<{ success: boolean, message: string, errors?: Object }>}
 */
export async function registerUserAction(inputData) {
  try {
    // Handle both plain objects and FormData
    let name, email, password, role;
    if (inputData instanceof FormData) {
      name = inputData.get("name");
      email = inputData.get("email");
      password = inputData.get("password");
      role = inputData.get("role");
    } else {
      ({ name, email, password, role } = inputData || {});
    }

    // 1. Validate fields using the pure JS validator
    const validation = validateRegister({ name, email, password, role });
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: "Please resolve the form errors before continuing.",
      };
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // 2. Check if a user with this email already exists
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return {
        success: false,
        errors: {
          email: "An account with this email address is already registered.",
        },
        message: "An account with this email address already exists.",
      };
    }

    // 3. Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert new user document into the users collection
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role.trim().toLowerCase(),
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return {
      success: true,
      message: "Registration successful! You can now log in to your account.",
      userId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("registerUserAction error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating your account. Please try again.",
    };
  }
}
