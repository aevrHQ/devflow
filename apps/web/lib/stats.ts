import connectToDatabase from "@/lib/mongodb";
import NotificationLog from "@/models/NotificationLog";
import { Types } from "mongoose";

export interface DashboardStats {
  totalEvents: number;
  successRate: number;
  failedEvents: number;
  eventsLast24Hours: number;
  topRepositories: { name: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

export async function getUserStats(userId: string): Promise<DashboardStats> {
  await connectToDatabase();
  const userObjectId = new Types.ObjectId(userId);

  // Base match for all queries (by userId)
  const baseMatch = { userId: userObjectId };

  // 3. Aggregate stats
  const [totalCount, failedCount, last24HoursCount, topRepos, dailyActivity] =
    await Promise.all([
      // Total Events (Notifications)
      NotificationLog.countDocuments(baseMatch),

      // Failed Events (Notifications)
      NotificationLog.countDocuments({ ...baseMatch, status: "failure" }),

      // Events Last 24 Hours
      NotificationLog.countDocuments({
        ...baseMatch,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),

      // Top Repositories (Derived from source or metadata)
      // Note: Source might be "github", metadata might contain repo info via payload
      // But NotificationLog metadata structure varies.
      // For now, let's group by 'source' as a proxy, or try to extract repo from metadata if structure known.
      // Since metadata is Mixed, we might just group by 'channelName' or 'source' for now.
      // Let's group by "source" to show where events come from.
      NotificationLog.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]),

      // Daily Activity (Last 7 Days)
      NotificationLog.aggregate([
        {
          $match: {
            ...baseMatch,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

  const successRate =
    totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;

  return {
    totalEvents: totalCount,
    successRate: Math.round(successRate * 10) / 10,
    failedEvents: failedCount,
    eventsLast24Hours: last24HoursCount,
    topRepositories: topRepos, // Actually top sources now
    dailyActivity: dailyActivity,
  };
}
