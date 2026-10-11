"use server";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/mongodb";
import { validateEventForm } from "@/validators/event.validator";

/**
 * Helper to authenticate and verify that the user has the 'organizer' role.
 * 
 * @returns {Promise<{ user: Object }>}
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
 * Normalizes input whether provided as plain object or FormData
 * 
 * @param {Object|FormData} input
 * @returns {Object}
 */
function parseEventInput(input) {
  if (input instanceof FormData) {
    const rawSkills = input.get("requiredSkills");
    let skills = [];
    if (typeof rawSkills === "string") {
      skills = rawSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return {
      title: input.get("title") || "",
      description: input.get("description") || "",
      eventDate: input.get("eventDate") || "",
      location: input.get("location") || "",
      category: input.get("category") || "",
      maxVolunteerCapacity: input.get("maxVolunteerCapacity") || "",
      requiredSkills: skills,
      registrationDeadline: input.get("registrationDeadline") || "",
    };
  }

  let skills = [];
  if (Array.isArray(input?.requiredSkills)) {
    skills = input.requiredSkills.map((s) => (s || "").trim()).filter(Boolean);
  } else if (typeof input?.requiredSkills === "string") {
    skills = input.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return {
    title: input?.title || "",
    description: input?.description || "",
    eventDate: input?.eventDate || "",
    location: input?.location || "",
    category: input?.category || "",
    maxVolunteerCapacity: input?.maxVolunteerCapacity || "",
    requiredSkills: skills,
    registrationDeadline: input?.registrationDeadline || "",
  };
}

/**
 * Server Action: Create a new event (default status: 'draft')
 * 
 * @param {Object|FormData} inputData
 * @returns {Promise<{ success: boolean, message: string, eventId?: string, errors?: Object }>}
 */
export async function createEventAction(inputData) {
  try {
    const session = await requireOrganizerSession();
    const parsedData = parseEventInput(inputData);

    // 1. Validate form fields
    const validation = validateEventForm(parsedData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: "Please fix the validation errors before creating the event.",
      };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");

    // 2. Prepare event document
    const newEvent = {
      title: parsedData.title.trim(),
      description: parsedData.description.trim(),
      eventDate: new Date(parsedData.eventDate),
      location: parsedData.location.trim(),
      category: parsedData.category.trim(),
      maxVolunteerCapacity: Number(parsedData.maxVolunteerCapacity),
      requiredSkills: parsedData.requiredSkills,
      registrationDeadline: new Date(parsedData.registrationDeadline),
      organizerId: new ObjectId(session.user.id),
      status: "draft", // Default status
      createdAt: new Date(),
    };

    const result = await eventsCollection.insertOne(newEvent);

    // Revalidate relevant pages
    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return {
      success: true,
      message: "Event created successfully as a draft!",
      eventId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("createEventAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to create event. Please try again.",
    };
  }
}

/**
 * Server Action: Update an existing event (organizer can update only their own events)
 * 
 * @param {string} eventId
 * @param {Object|FormData} inputData
 * @returns {Promise<{ success: boolean, message: string, errors?: Object }>}
 */
export async function updateEventAction(eventId, inputData) {
  try {
    const session = await requireOrganizerSession();

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { success: false, message: "Invalid event ID provided." };
    }

    const parsedData = parseEventInput(inputData);

    // 1. Validate form fields
    const validation = validateEventForm(parsedData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: "Please fix the validation errors before updating.",
      };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");

    // 2. Verify event existence and ownership
    const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!existingEvent) {
      return { success: false, message: "Event not found." };
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You can only update events you organized.",
      };
    }

    // 3. Update the event document
    const updatedFields = {
      title: parsedData.title.trim(),
      description: parsedData.description.trim(),
      eventDate: new Date(parsedData.eventDate),
      location: parsedData.location.trim(),
      category: parsedData.category.trim(),
      maxVolunteerCapacity: Number(parsedData.maxVolunteerCapacity),
      requiredSkills: parsedData.requiredSkills,
      registrationDeadline: new Date(parsedData.registrationDeadline),
      updatedAt: new Date(),
    };

    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updatedFields }
    );

    revalidatePath("/dashboard/organizer");
    revalidatePath(`/dashboard/organizer/events/edit/${eventId}`);
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);

    return {
      success: true,
      message: "Event updated successfully!",
    };
  } catch (error) {
    console.error("updateEventAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to update event.",
    };
  }
}

/**
 * Server Action: Delete an event (organizer can delete only their own events)
 * 
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteEventAction(eventId) {
  try {
    const session = await requireOrganizerSession();

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { success: false, message: "Invalid event ID." };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");

    const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!existingEvent) {
      return { success: false, message: "Event not found." };
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You cannot delete an event organized by someone else.",
      };
    }

    // Delete event and any related registrations
    await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });
    await db.collection("registrations").deleteMany({ eventId: new ObjectId(eventId) });

    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return {
      success: true,
      message: "Event deleted successfully.",
    };
  } catch (error) {
    console.error("deleteEventAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete event.",
    };
  }
}

/**
 * Server Action: Publish an event (status: draft -> published)
 * 
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function publishEventAction(eventId) {
  try {
    const session = await requireOrganizerSession();

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { success: false, message: "Invalid event ID." };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");

    const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!existingEvent) {
      return { success: false, message: "Event not found." };
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return { success: false, message: "Unauthorized." };
    }

    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { status: "published", updatedAt: new Date() } }
    );

    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return {
      success: true,
      message: "Event published successfully! Volunteers can now discover and register for it.",
    };
  } catch (error) {
    console.error("publishEventAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to publish event.",
    };
  }
}

/**
 * Server Action: Close an event's registration (status: published -> closed)
 * 
 * @param {string} eventId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function closeRegistrationAction(eventId) {
  try {
    const session = await requireOrganizerSession();

    if (!eventId || !ObjectId.isValid(eventId)) {
      return { success: false, message: "Invalid event ID." };
    }

    const db = await getDatabase();
    const eventsCollection = db.collection("events");

    const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!existingEvent) {
      return { success: false, message: "Event not found." };
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return { success: false, message: "Unauthorized." };
    }

    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { status: "closed", updatedAt: new Date() } }
    );

    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return {
      success: true,
      message: "Event registration closed successfully.",
    };
  } catch (error) {
    console.error("closeRegistrationAction error:", error);
    return {
      success: false,
      message: error.message || "Failed to close registration.",
    };
  }
}

/**
 * Helper: Retrieve all events created by the logged in organizer
 * 
 * @returns {Promise<Array>}
 */
export async function getOrganizerEvents() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "organizer") {
      return [];
    }

    const db = await getDatabase();
    const events = await db
      .collection("events")
      .find({ organizerId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize ObjectIds and Dates for Client Components / RSC
    return events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      organizerId: event.organizerId.toString(),
      eventDate: event.eventDate instanceof Date ? event.eventDate.toISOString() : event.eventDate,
      registrationDeadline:
        event.registrationDeadline instanceof Date
          ? event.registrationDeadline.toISOString()
          : event.registrationDeadline,
      createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
      updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
    }));
  } catch (error) {
    console.error("getOrganizerEvents error:", error);
    return [];
  }
}

/**
 * Helper: Retrieve a single event by ID (with ownership verification for editing)
 * 
 * @param {string} eventId
 * @returns {Promise<Object|null>}
 */
export async function getOrganizerEventById(eventId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "organizer") {
      return null;
    }

    if (!eventId || !ObjectId.isValid(eventId)) {
      return null;
    }

    const db = await getDatabase();
    const event = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
      organizerId: new ObjectId(session.user.id),
    });

    if (!event) return null;

    return {
      ...event,
      _id: event._id.toString(),
      organizerId: event.organizerId.toString(),
      eventDate: event.eventDate instanceof Date ? event.eventDate.toISOString() : event.eventDate,
      registrationDeadline:
        event.registrationDeadline instanceof Date
          ? event.registrationDeadline.toISOString()
          : event.registrationDeadline,
      createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
      updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
    };
  } catch (error) {
    console.error("getOrganizerEventById error:", error);
    return null;
  }
}
