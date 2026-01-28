"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/aevr/button";
import ResponsiveDialog from "@/components/ui/aevr/responsive-dialog";
import {
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/components/ui/aevr/loader";

interface ActivityLog {
  _id: string;
  source: string;
  eventType: string;
  status: "success" | "failure" | "skipped";
  channelName?: string;
  channelType: string;
  createdAt: string;
  error?: string;
  metadata?: {
    title?: string;
    payloadUrl?: string;
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = async (currentPage: number, append = false) => {
    try {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `/api/user/activity?page=${currentPage}&limit=10`,
      );
      const data = await res.json();

      if (data.logs) {
        if (append) {
          setActivities((prev) => [...prev, ...data.logs]);
        } else {
          setActivities(data.logs);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to load activity:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failure":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "skipped":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Loader loading className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader
          loading={loading}
          className="w-6 h-6 animate-spin text-gray-400"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Recent Activity
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPage(1);
            fetchActivities(1);
          }}
          className="h-8 w-8 p-0 text-gray-500"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
          <p>No processed webhooks yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((log) => (
            <div
              key={log._id}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-100 transition-colors shadow-sm"
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="mt-1">{getStatusIcon(log.status)}</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {log.metadata?.title || log.eventType}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="capitalize">{log.source}</span> •{" "}
                    <span className="capitalize">{log.channelType}</span>
                    {log.channelName && ` (${log.channelName})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline-block">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                  })}
                </span>

                <ResponsiveDialog
                  trigger={
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  }
                  title="Event Details"
                  description={`Received ${formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}`}
                  drawerClose={<Button variant="secondary">Close</Button>}
                >
                  <div className="p-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Source
                        </h4>
                        <p className="text-sm font-semibold capitalize">
                          {log.source}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Event
                        </h4>
                        <p className="text-sm font-semibold">{log.eventType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Status
                        </h4>
                        <p
                          className={`text-sm font-semibold flex items-center gap-1 capitalize
                          ${
                            log.status === "success"
                              ? "text-green-600"
                              : log.status === "failure"
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {getStatusIcon(log.status)}
                          {log.status}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Channel
                        </h4>
                        <p className="text-sm">
                          {log.channelName || log.channelType}
                        </p>
                      </div>
                    </div>

                    {log.error && (
                      <div className="bg-red-50 p-3 rounded-md border border-red-100">
                        <h4 className="text-xs font-semibold text-red-700 uppercase mb-1">
                          Error
                        </h4>
                        <p className="text-sm text-red-600 font-mono break-all">
                          {log.error}
                        </p>
                      </div>
                    )}

                    {log.metadata?.payloadUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Payload
                        </h4>
                        <a
                          href={log.metadata.payloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View processed payload <Eye className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </ResponsiveDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full text-gray-500"
          >
            {loadingMore ? (
              <Loader loading={loadingMore} className="w-4 h-4 mr-2" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
