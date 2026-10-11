"use server";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/mongodb";

/**
 * Ensures user is authenticated and has the 'volunteer' role
 * 
 * @returns {Promise<Object>} session
 */
async function requireVolunteerSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Authentication required. Please log in.");
  }
  if (session.user.role !== "volunteer") {
    throw new Error("Unauthorized. Only volunteers can register for events.");
  }
  return session;
}

/**
 * Ensures user is authenticated and has the 'organizer' role
 * 
 * @returns {Promise<Object>} session
 */
async function requireOrganizerSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Authentication required. Please log in.");
  }
  if (session.user.role !== "organizer") {
    throw new Error("Unauthorized. Only organizers can perform this action.");
  }
  return session;
}

/**
 * Server Action: Register a volunteer for an event
 * 
 * @param {Object} payload
 * @param {string} payload.eventId
 * @param {string} payload.selectedSkill
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function registerForEventAction({ eventId, selectedSkill }) {
  try {
    const session = await requireVolunteerSession();

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { success: false, message: "Invalid event ID." };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");
    const registrationsCollection = db.collection("registrations");

    // 1. Verify event exists
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return { success: false, message: "Event not found." };
    }

    // 2. Verify event status is published
    if (event.status !== "published") {
      return { success: false, message: "This event is not accepting registrations." };
    }

    // 3. Check registration deadline
    const now = new Date();
    if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
      return { success: false, message: "Registration deadline has passed" };
    }

    // 4. Count active registrations (only 'registered' and 'confirmed'; do NOT count 'cancelled')
    const activeCount = await registrationsCollection.countDocuments({
      eventId: new ObjectId(eventId),
      status: { $in: ["registered", "confirmed"] },
    });

    // 5. Compare against capacity
    if (activeCount >= event.maxVolunteerCapacity) {
      return { success: false, message: "Volunteer capacity is full" };
    }

    // 6. Check duplicate registration
    const existingRegistration = await registrationsCollection.findOne({
      eventId: new ObjectId(eventId),
      volunteerId: new ObjectId(session.user.id),
    });

    if (existingRegistration) {
      if (existingRegistration.status !== "cancelled") {
        return { success: false, message: "You already registered for this event" };
      }

      // If previously cancelled, reactivate registration to preserve the unique index
      await registrationsCollection.updateOne(
        { _id: existingRegistration._id },
        {
          $set: {
            status: "registered",
            selectedSkill: selectedSkill || "General Volunteer",
            registrationDate: now,
            updatedAt: now,
          },
        }
      );
    } else {
      // Insert new registration document
      const newDoc = {
        eventId: new ObjectId(eventId),
        volunteerId: new ObjectId(session.user.id),
        selectedSkill: selectedSkill || "General Volunteer",
        status: "registered", // Default initial status
        registrationDate: now,
        createdAt: now,
      };

      await registrationsCollection.insertOne(newDoc);
    }

    // Revalidate affected pages
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/dashboard/volunteer");
    revalidatePath("/dashboard/volunteer/events");
    revalidatePath(`/dashboard/organizer/events/${eventId}/registrations`);

    return {
      success: true,
      message: "Successfully registered",
    };
  } catch (error) {
    console.error("registerForEventAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to complete registration.",
    };
  }
}

/**
 * Server Action: Cancel a volunteer's registration
 * 
 * @param {string} registrationId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function cancelRegistrationAction(registrationId) {
  try {
    const session = await requireVolunteerSession();

    if (!registrationId || !ObjectId.isValid(registrationId)) {
      return { success: false, message: "Invalid registration ID." };
    }

    const db = await getDatabase();
    const registrationsCollection = db.collection("registrations");

    // Find registration
    const registration = await registrationsCollection.findOne({
      _id: new ObjectId(registrationId),
    });

    if (!registration) {
      return { success: false, message: "Registration not found." };
    }

    // Security check: only the owning volunteer can cancel
    if (registration.volunteerId.toString() !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You can only cancel your own registrations.",
      };
    }

    // Update status to 'cancelled'
    await registrationsCollection.updateOne(
      { _id: new ObjectId(registrationId) },
      { $set: { status: "cancelled", updatedAt: new Date() } }
    );

    const eventIdStr = registration.eventId.toString();

    // Revalidate paths so available slots increase immediately
    revalidatePath("/events");
    revalidatePath(`/events/${eventIdStr}`);
    revalidatePath("/dashboard/volunteer");
    revalidatePath("/dashboard/volunteer/events");
    revalidatePath(`/dashboard/organizer/events/${eventIdStr}/registrations`);

    return {
      success: true,
      message: "Registration cancelled successfully.",
    };
  } catch (error) {
    console.error("cancelRegistrationAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to cancel registration.",
    };
  }
}

/**
 * Server Action: Update registration status (Organizer only)
 * 
 * @param {Object} payload
 * @param {string} payload.registrationId
 * @param {string} payload.status ("registered" | "confirmed" | "attended" | "cancelled")
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function updateRegistrationStatusAction({ registrationId, status }) {
  try {
    const session = await requireOrganizerSession();

    const validStatuses = ["registered", "confirmed", "attended", "cancelled"];
    if (!validStatuses.includes(status)) {
      return { success: false, message: "Invalid status value provided." };
    }

    if (!registrationId || !ObjectId.isValid(registrationId)) {
      return { success: false, message: "Invalid registration ID." };
    }

    const db = await getDatabase();
    const registrationsCollection = db.collection("registrations");
    const eventsCollection = db.collection("events");

    const registration = await registrationsCollection.findOne({
      _id: new ObjectId(registrationId),
    });

    if (!registration) {
      return { success: false, message: "Registration not found." };
    }

    // Verify organizer owns the event
    const event = await eventsCollection.findOne({ _id: registration.eventId });
    if (!event) {
      return { success: false, message: "Associated event not found." };
    }

    if (event.organizerId.toString() !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You cannot modify volunteer records for events you do not organize.",
      };
    }

    // Update status
    await registrationsCollection.updateOne(
      { _id: new ObjectId(registrationId) },
      { $set: { status, updatedAt: new Date() } }
    );

    const eventIdStr = registration.eventId.toString();
    revalidatePath(`/dashboard/organizer/events/${eventIdStr}/registrations`);
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/volunteer");
    revalidatePath(`/events/${eventIdStr}`);

    return {
      success: true,
      message: `Volunteer status updated to ${status}.`,
    };
  } catch (error) {
    console.error("updateRegistrationStatusAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to update volunteer status.",
    };
  }
}

/**
 * Retrieves all registrations for the logged-in volunteer with populated event details
 * 
 * @returns {Promise<Array>}
 */
export async function getVolunteerRegistrations() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "volunteer") {
      return [];
    }

    const db = await getDatabase();

    const pipeline = [
      {
        $match: {
          volunteerId: new ObjectId(session.user.id),
        },
      },
      {
        $sort: { registrationDate: -1 },
      },
      // Join event details
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
    ];

    const results = await db.collection("registrations").aggregate(pipeline).toArray();

    return results.map((item) => ({
      _id: item._id.toString(),
      eventId: item.eventId.toString(),
      volunteerId: item.volunteerId.toString(),
      selectedSkill: item.selectedSkill || "General Volunteer",
      status: item.status,
      registrationDate:
        item.registrationDate instanceof Date
          ? item.registrationDate.toISOString()
          : item.registrationDate,
      event: {
        _id: item.event._id.toString(),
        title: item.event.title,
        description: item.event.description,
        eventDate:
          item.event.eventDate instanceof Date
            ? item.event.eventDate.toISOString()
            : item.event.eventDate,
        location: item.event.location,
        category: item.event.category,
        maxVolunteerCapacity: item.event.maxVolunteerCapacity,
        registrationDeadline:
          item.event.registrationDeadline instanceof Date
            ? item.event.registrationDeadline.toISOString()
            : item.event.registrationDeadline,
        status: item.event.status,
      },
    }));
  } catch (error) {
    console.error("getVolunteerRegistrations error:", error);
    return [];
  }
}

/**
 * Retrieves all registrations for an organizer's specific event
 * 
 * @param {string} eventId
 * @returns {Promise<{ event: Object|null, registrations: Array }>}
 */
export async function getEventRegistrations(eventId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "organizer") {
      return { event: null, registrations: [] };
    }

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { event: null, registrations: [] };
    }

    const db = await getDatabase();

    // 1. Verify event ownership
    const event = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
      organizerId: new ObjectId(session.user.id),
    });

    if (!event) {
      return { event: null, registrations: [] };
    }

    // 2. Fetch registrations and populate volunteer user information
    const pipeline = [
      {
        $match: {
          eventId: new ObjectId(eventId),
        },
      },
      {
        $sort: { registrationDate: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "volunteerId",
          foreignField: "_id",
          as: "volunteer",
        },
      },
      {
        $unwind: "$volunteer",
      },
      {
        $project: {
          _id: 1,
          eventId: 1,
          volunteerId: 1,
          selectedSkill: 1,
          status: 1,
          registrationDate: 1,
          volunteerName: "$volunteer.name",
          volunteerEmail: "$volunteer.email",
        },
      },
    ];

    const results = await db.collection("registrations").aggregate(pipeline).toArray();

    return {
      event: {
        _id: event._id.toString(),
        title: event.title,
        eventDate:
          event.eventDate instanceof Date ? event.eventDate.toISOString() : event.eventDate,
        maxVolunteerCapacity: event.maxVolunteerCapacity,
        status: event.status,
      },
      registrations: results.map((r) => ({
        _id: r._id.toString(),
        eventId: r.eventId.toString(),
        volunteerId: r.volunteerId.toString(),
        selectedSkill: r.selectedSkill || "General Volunteer",
        status: r.status,
        registrationDate:
          r.registrationDate instanceof Date
            ? r.registrationDate.toISOString()
            : r.registrationDate,
        volunteerName: r.volunteerName,
        volunteerEmail: r.volunteerEmail,
      })),
    };
  } catch (error) {
    console.error("getEventRegistrations error:", error);
    return { event: null, registrations: [] };
  }
}
