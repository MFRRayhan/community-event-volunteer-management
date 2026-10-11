/**
 * Domain Models & Constants
 * 
 * Provides centralized status enums and JSDoc documentation
 * for the 3 MongoDB collections.
 */

export const USER_ROLES = {
  ORGANIZER: "organizer",
  VOLUNTEER: "volunteer",
};

export const EVENT_STATUSES = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const REGISTRATION_STATUSES = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled",
};

/**
 * @typedef {Object} User
 * @property {string} [_id]
 * @property {string} name
 * @property {string} email
 * @property {string} [passwordHash]
 * @property {'organizer'|'volunteer'} role
 * @property {Date|string} createdAt
 */

/**
 * @typedef {Object} Event
 * @property {string} [_id]
 * @property {string} title
 * @property {string} description
 * @property {Date|string} eventDate
 * @property {string} location
 * @property {string} category
 * @property {number} maxVolunteerCapacity
 * @property {string[]} requiredSkills
 * @property {Date|string} registrationDeadline
 * @property {string} organizerId
 * @property {'upcoming'|'ongoing'|'completed'|'cancelled'} status
 * @property {Date|string} createdAt
 * @property {Date|string} [updatedAt]
 */

/**
 * @typedef {Object} Registration
 * @property {string} [_id]
 * @property {string} eventId
 * @property {string} volunteerId
 * @property {string} selectedSkill
 * @property {'confirmed'|'pending'|'cancelled'} status
 * @property {Date|string} registrationDate
 */
