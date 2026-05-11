"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

const ROOM_TYPES = ["single", "double", "twin", "suite", "deluxe", "family"];
const STATUS_OPTIONS = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
  "out_of_service",
];

const statusColors = {
  available: "bg-green-100 text-green-700",
  occupied: "bg-orange-100 text-orange-700",
  cleaning: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-red-100 text-red-700",
  out_of_service: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  roomNumber: "",
  type: "single",
  floor: "",
  capacity: "",
  pricePerNight: "",
  status: "available",
  amenities: "",
  description: "",
};

export default function RoomsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", floor: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.floor) params.floor = filters.floor;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get("/rooms", { params });
      setRooms(data);
    } catch {
      toast.error("Failed to load rooms");
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      status: room.status,
      amenities: room.amenities?.join(", ") || "",
      description: room.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
        pricePerNight: Number(form.pricePerNight),
        amenities: form.amenities
          ? form.amenities
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
      };

      if (editing) {
        await api.put(`/rooms/${editing._id}`, payload);
        toast.success("Room updated");
      } else {
        await api.post("/rooms", payload);
        toast.success("Room created");
      }
      setModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save room");
    }
    setSaving(false);
  };

  const handleDelete = async (room) => {
    if (!confirm(`Remove room ${room.roomNumber}?`)) return;
    try {
      await api.delete(`/rooms/${room._id}`);
      toast.success("Room removed");
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove room");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rooms.length} room{rooms.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isManager && (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Room
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <select
          className="input w-auto"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Floor"
          className="input w-24"
          value={filters.floor}
          onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
        />
        <select
          className="input w-auto"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          onClick={() => setFilters({ type: "", floor: "", status: "" })}
          className="btn-secondary text-sm"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price/Night
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {isManager && (
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No rooms found
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      #{room.roomNumber}
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-700">
                      {room.type}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Floor {room.floor}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {room.capacity} guest{room.capacity !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      ${room.pricePerNight}/night
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${statusColors[room.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {room.status.replace("_", " ")}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(room)}
                            className="text-brand-600 hover:text-brand-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Room" : "Add New Room"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                className="input"
                value={form.roomNumber}
                onChange={(e) =>
                  setForm({ ...form, roomNumber: e.target.value })
                }
                required
                disabled={!!editing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                className="input"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                className="input"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price/Night ($) *
              </label>
              <input
                type="number"
                className="input"
                value={form.pricePerNight}
                onChange={(e) =>
                  setForm({ ...form, pricePerNight: e.target.value })
                }
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities (comma-separated)
            </label>
            <input
              className="input"
              placeholder="WiFi, TV, AC, Mini Bar"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={saving}
            >
              {saving ? "Saving..." : editing ? "Update Room" : "Create Room"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
