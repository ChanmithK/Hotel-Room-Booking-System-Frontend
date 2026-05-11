"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-600", "-100")}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isStaff = ["manager", "receptionist"].includes(user?.role);
        if (!isStaff) {
          setLoading(false);
          return;
        }

        const [roomsRes, bookingsRes] = await Promise.all([
          api.get("/rooms"),
          api.get("/bookings"),
        ]);

        const rooms = roomsRes.data;
        const bookings = bookingsRes.data;

        setStats({
          totalRooms: rooms.length,
          available: rooms.filter((r) => r.status === "available").length,
          occupied: rooms.filter((r) => r.status === "occupied").length,
          confirmed: bookings.filter((b) => b.status === "confirmed").length,
        });

        setRecentBookings(bookings.slice(0, 5));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const statusBadge = (status) => {
    const map = {
      confirmed: "bg-blue-100 text-blue-700",
      checked_in: "bg-green-100 text-green-700",
      checked_out: "bg-gray-100 text-gray-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return (
      <span className={`badge ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1 capitalize">
          Role: <span className="font-medium text-brand-600">{user?.role}</span>
        </p>
      </div>

      {user?.role === "admin" && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-gray-500 mt-2">
            Manage staff accounts and roles from the Users section.
          </p>
        </div>
      )}

      {(user?.role === "manager" || user?.role === "receptionist") && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  label="Total Rooms"
                  value={stats?.totalRooms ?? "—"}
                  color="text-gray-700"
                  icon={
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Available"
                  value={stats?.available ?? "—"}
                  color="text-green-600"
                  icon={
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Occupied"
                  value={stats?.occupied ?? "—"}
                  color="text-orange-600"
                  icon={
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  label="Confirmed Bookings"
                  value={stats?.confirmed ?? "—"}
                  color="text-brand-600"
                  icon={
                    <svg
                      className="w-6 h-6 text-brand-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="card">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">
                    Recent Bookings
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Check In
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Check Out
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentBookings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-gray-400"
                          >
                            No bookings yet
                          </td>
                        </tr>
                      ) : (
                        recentBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">
                                {b.guestName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {b.guestEmail}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {b.room?.roomNumber}{" "}
                              <span className="text-gray-400 capitalize">
                                ({b.room?.type})
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(b.checkIn).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(b.checkOut).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {statusBadge(b.status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
