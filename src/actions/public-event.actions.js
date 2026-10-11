"use server";

import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

/**
 * Serializes MongoDB document fields (ObjectIds and Dates) for Next.js Client Components
 * 
 * @param {Object} doc
 * @returns {Object}
 */
function serializeEventDoc(doc) {
  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id?.toString(),
    organizerId: doc.organizerId?.toString(),
    eventDate: doc.eventDate instanceof Date ? doc.eventDate.toISOString() : doc.eventDate,
    registrationDeadline:
      doc.registrationDeadline instanceof Date
        ? doc.registrationDeadline.toISOString()
        : doc.registrationDeadline,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    organizerName: doc.organizerInfo?.name || "Community Organizer",
    organizerEmail: doc.organizerInfo?.email || "",
    registeredCount: doc.registeredCount || 0,
    availableSlots: Math.max(0, (doc.maxVolunteerCapacity || 0) - (doc.registeredCount || 0)),
  };
}

/**
 * Retrieves public published events matching filter criteria
 * 
 * Filters:
 * - search: Keyword matching event title
 * - category: Category filter (e.g., Environment, Education)
 * - location: Location keyword
 * - timeframe: "upcoming" (default), "past", or "all"
 * 
 * @param {Object} [filters={}]
 * @returns {Promise<Array>}
 */
export async function getPublishedEvents(filters = {}) {
  try {
    const db = await getDatabase();
    const now = new Date();

    // 1. Build MongoDB query: ONLY published events
    const query = { status: "published" };

    // Search by title
    if (filters.search && filters.search.trim()) {
      query.title = { $regex: filters.search.trim(), $options: "i" };
    }

    // Category filter
    if (filters.category && filters.category.trim() && filters.category.toLowerCase() !== "all") {
      query.category = { $regex: `^${filters.category.trim()}$`, $options: "i" };
    }

    // Location filter
    if (filters.location && filters.location.trim()) {
      query.location = { $regex: filters.location.trim(), $options: "i" };
    }

    // Date / Timeframe filter
    const timeframe = (filters.timeframe || "upcoming").toLowerCase();
    if (timeframe === "upcoming") {
      query.eventDate = { $gte: now };
    } else if (timeframe === "past") {
      query.eventDate = { $lt: now };
    }

    // 2. Aggregation pipeline to calculate available capacity & organizer details
    const pipeline = [
      { $match: query },
      { $sort: { eventDate: timeframe === "past" ? -1 : 1 } },
      // Lookup confirmed registrations count
      {
        $lookup: {
          from: "registrations",
          let: { evId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$eventId", "$$evId"] },
                    { $in: ["$status", ["registered", "confirmed"]] },
                  ],
                },
              },
            },
          ],
          as: "confirmedRegistrations",
        },
      },
      // Lookup organizer details
      {
        $lookup: {
          from: "users",
          localField: "organizerId",
          foreignField: "_id",
          as: "organizers",
        },
      },
      {
        $addFields: {
          registeredCount: { $size: "$confirmedRegistrations" },
          organizerInfo: { $arrayElemAt: ["$organizers", 0] },
        },
      },
      {
        $project: {
          confirmedRegistrations: 0,
          organizers: 0,
          "organizerInfo.passwordHash": 0,
        },
      },
    ];

    const events = await db.collection("events").aggregate(pipeline).toArray();

    return events.map(serializeEventDoc);
  } catch (error) {
    console.error("getPublishedEvents error:", error);
    return [];
  }
}

/**
 * Retrieves a single published event by ID (including organizer and registration counts)
 * 
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getPublishedEventById(id) {
  try {
    if (!id || !ObjectId.isValid(id)) {
      return null;
    }

    const db = await getDatabase();

    const pipeline = [
      {
        $match: {
          _id: new ObjectId(id),
          status: "published", // Only published events are visible publicly
        },
      },
      // Lookup confirmed registrations
      {
        $lookup: {
          from: "registrations",
          let: { evId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$eventId", "$$evId"] },
                    { $in: ["$status", ["registered", "confirmed"]] },
                  ],
                },
              },
            },
          ],
          as: "confirmedRegistrations",
        },
      },
      // Lookup organizer
      {
        $lookup: {
          from: "users",
          localField: "organizerId",
          foreignField: "_id",
          as: "organizers",
        },
      },
      {
        $addFields: {
          registeredCount: { $size: "$confirmedRegistrations" },
          organizerInfo: { $arrayElemAt: ["$organizers", 0] },
        },
      },
      {
        $project: {
          confirmedRegistrations: 0,
          organizers: 0,
          "organizerInfo.passwordHash": 0,
        },
      },
    ];

    const results = await db.collection("events").aggregate(pipeline).toArray();
    if (!results || results.length === 0) {
      return null;
    }

    return serializeEventDoc(results[0]);
  } catch (error) {
    console.error("getPublishedEventById error:", error);
    return null;
  }
}
