"use server";

import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getDatabase } from "@/lib/mongodb";

/**
 * Fetches real aggregation analytics data for the authenticated organizer
 * 
 * @returns {Promise<{
 *   hasData: boolean,
 *   summary: {
 *     totalEvents: number,
 *     publishedEvents: number,
 *     totalCapacity: number,
 *     activeRegistrations: number,
 *     utilizationRate: number
 *   },
 *   eventsByCategory: Array<{ category: string, count: number }>,
 *   registrationsPerEvent: Array<{
 *     title: string,
 *     active: number,
 *     capacity: number,
 *     attended: number,
 *     cancelled: number
 *   }>,
 *   statusBreakdown: Array<{ name: string, value: number, fill: string }>
 * }>}
 */
export async function getOrganizerAnalytics() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "organizer") {
      throw new Error("Unauthorized. Only organizers can access analytics.");
    }

    const db = await getDatabase();
    const organizerObjectId = new ObjectId(session.user.id);

    // 1. Fetch all events for this organizer
    const events = await db
      .collection("events")
      .find({ organizerId: organizerObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    if (events.length === 0) {
      return {
        hasData: false,
        summary: {
          totalEvents: 0,
          publishedEvents: 0,
          totalCapacity: 0,
          activeRegistrations: 0,
          utilizationRate: 0,
        },
        eventsByCategory: [],
        registrationsPerEvent: [],
        statusBreakdown: [],
      };
    }

    const eventIds = events.map((e) => e._id);

    // 2. Aggregate registrations across all organizer events
    const regAgg = await db
      .collection("registrations")
      .aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
          },
        },
        {
          $group: {
            _id: {
              eventId: "$eventId",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Map registrations by eventId and status
    const regMap = {};
    const overallStatusCount = {
      registered: 0,
      confirmed: 0,
      attended: 0,
      cancelled: 0,
    };

    for (const item of regAgg) {
      const eIdStr = item._id.eventId.toString();
      const status = item._id.status || "registered";
      if (!regMap[eIdStr]) {
        regMap[eIdStr] = { registered: 0, confirmed: 0, attended: 0, cancelled: 0 };
      }
      regMap[eIdStr][status] = (regMap[eIdStr][status] || 0) + item.count;
      if (overallStatusCount[status] !== undefined) {
        overallStatusCount[status] += item.count;
      }
    }

    // 3. Category grouping (Chart 1)
    const categoryCount = {};
    for (const event of events) {
      const cat = event.category || "General";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    const eventsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));

    // 4. Registration stats per event (Chart 2)
    let totalCapacity = 0;
    let totalActive = 0;
    const publishedEventsCount = events.filter((e) => e.status === "published").length;

    const registrationsPerEvent = events.map((event) => {
      const eIdStr = event._id.toString();
      const stats = regMap[eIdStr] || { registered: 0, confirmed: 0, attended: 0, cancelled: 0 };
      const active = (stats.registered || 0) + (stats.confirmed || 0);
      const capacity = Number(event.maxVolunteerCapacity) || 0;

      totalCapacity += capacity;
      totalActive += active;

      // Truncate long title for legible chart labels
      const shortTitle =
        event.title.length > 20 ? event.title.substring(0, 18) + "…" : event.title;

      return {
        title: shortTitle,
        fullTitle: event.title,
        active,
        capacity,
        attended: stats.attended || 0,
        cancelled: stats.cancelled || 0,
      };
    });

    const utilizationRate =
      totalCapacity > 0 ? Math.round((totalActive / totalCapacity) * 100) : 0;

    // 5. Status distribution
    const statusBreakdown = [
      { name: "Registered", value: overallStatusCount.registered, fill: "#3b82f6" },
      { name: "Confirmed", value: overallStatusCount.confirmed, fill: "#10b981" },
      { name: "Attended", value: overallStatusCount.attended, fill: "#8b5cf6" },
      { name: "Cancelled", value: overallStatusCount.cancelled, fill: "#ef4444" },
    ].filter((item) => item.value > 0);

    return {
      hasData: true,
      summary: {
        totalEvents: events.length,
        publishedEvents: publishedEventsCount,
        totalCapacity,
        activeRegistrations: totalActive,
        utilizationRate,
      },
      eventsByCategory,
      registrationsPerEvent,
      statusBreakdown,
    };
  } catch (error) {
    console.error("getOrganizerAnalytics error:", error);
    return {
      hasData: false,
      summary: {
        totalEvents: 0,
        publishedEvents: 0,
        totalCapacity: 0,
        activeRegistrations: 0,
        utilizationRate: 0,
      },
      eventsByCategory: [],
      registrationsPerEvent: [],
      statusBreakdown: [],
    };
  }
}
