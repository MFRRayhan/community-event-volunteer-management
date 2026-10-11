/**
 * Event Validator
 * 
 * Validates event creation and update data without external libraries.
 * Returns: { isValid: boolean, errors: Record<string, string> }
 */

/**
 * Validates event form input
 * 
 * Rules:
 * - title: required, minimum 5 characters
 * - description: required, minimum 20 characters
 * - eventDate: required, must be in the future
 * - registrationDeadline: required, must be before eventDate
 * - maxVolunteerCapacity: required, positive integer (> 0)
 * - location: required
 * - category: required
 * - requiredSkills: array with at least 1 non-empty skill
 * 
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateEventForm(data = {}) {
  const errors = {};

  // 1. Title Validation
  const title = (data.title || "").trim();
  if (!title) {
    errors.title = "Event title is required.";
  } else if (title.length < 5) {
    errors.title = "Event title must be at least 5 characters long.";
  }

  // 2. Description Validation
  const description = (data.description || "").trim();
  if (!description) {
    errors.description = "Event description is required.";
  } else if (description.length < 20) {
    errors.description = "Event description must be at least 20 characters long.";
  }

  // 3. Location Validation
  const location = (data.location || "").trim();
  if (!location) {
    errors.location = "Event location (address or virtual link) is required.";
  }

  // 4. Category Validation
  const category = (data.category || "").trim();
  if (!category) {
    errors.category = "Please select an event category.";
  }

  // 5. Capacity Validation
  const capacityNumber = Number(data.maxVolunteerCapacity);
  if (!data.maxVolunteerCapacity && data.maxVolunteerCapacity !== 0) {
    errors.maxVolunteerCapacity = "Maximum volunteer capacity is required.";
  } else if (isNaN(capacityNumber) || !Number.isInteger(capacityNumber) || capacityNumber <= 0) {
    errors.maxVolunteerCapacity = "Volunteer capacity must be a positive whole number greater than 0.";
  }

  // 6. Dates Validation
  const now = new Date();
  let parsedEventDate = null;
  let parsedDeadline = null;

  if (!data.eventDate) {
    errors.eventDate = "Event date is required.";
  } else {
    parsedEventDate = new Date(data.eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      errors.eventDate = "Please provide a valid event date.";
    } else if (parsedEventDate <= now) {
      errors.eventDate = "Event date must be in the future.";
    }
  }

  if (!data.registrationDeadline) {
    errors.registrationDeadline = "Registration deadline is required.";
  } else {
    parsedDeadline = new Date(data.registrationDeadline);
    if (isNaN(parsedDeadline.getTime())) {
      errors.registrationDeadline = "Please provide a valid registration deadline.";
    } else if (parsedEventDate && parsedDeadline >= parsedEventDate) {
      errors.registrationDeadline = "Registration deadline must be before the event date.";
    }
  }

  // 7. Required Skills Validation
  let skills = [];
  if (Array.isArray(data.requiredSkills)) {
    skills = data.requiredSkills.map((s) => (s || "").trim()).filter(Boolean);
  } else if (typeof data.requiredSkills === "string") {
    skills = data.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (skills.length === 0) {
    errors.requiredSkills = "Please add at least one required skill for volunteers.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
