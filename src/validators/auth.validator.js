/**
 * Authentication Validators
 * 
 * Simple, reusable validation functions without external libraries.
 * Returns: { isValid: boolean, errors: Record<string, string> }
 */

// Simple email regex for standard RFC-compliant format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates user registration data
 * 
 * Rules:
 * - name: minimum 2 characters
 * - email: valid email format
 * - password: minimum 6 characters
 * - role: must be 'organizer' or 'volunteer'
 * 
 * @param {Object} data
 * @param {string} [data.name]
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @param {string} [data.role]
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateRegister(data = {}) {
  const errors = {};

  // 1. Validate Name
  const trimmedName = (data.name || "").trim();
  if (!trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  }

  // 2. Validate Email
  const trimmedEmail = (data.email || "").trim();
  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Please provide a valid email address.";
  }

  // 3. Validate Password
  const password = data.password || "";
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  // 4. Validate Role
  const role = (data.role || "").trim().toLowerCase();
  if (!role) {
    errors.role = "Role is required.";
  } else if (role !== "organizer" && role !== "volunteer") {
    errors.role = "Role must be either 'organizer' or 'volunteer'.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates user login credentials
 * 
 * Rules:
 * - email: required
 * - password: required
 * 
 * @param {Object} data
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateLogin(data = {}) {
  const errors = {};

  // 1. Check Email
  const trimmedEmail = (data.email || "").trim();
  if (!trimmedEmail) {
    errors.email = "Email is required.";
  }

  // 2. Check Password
  const password = data.password || "";
  if (!password) {
    errors.password = "Password is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
