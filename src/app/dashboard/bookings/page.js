'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-green-100 text-green-700',
  checked_out: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const emptyForm = {
  roomId: '', guestName: '', guestEmail: '', guestPhone: '',
  checkIn: '', checkOut: '', specialRequests: '',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/bookings', { params });
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const fetchAvailableRooms = async () => {
    if (!form.checkIn || !form.checkOut) return;
    try {
      const { data } = await api.get('/rooms/available', {
        params: { checkIn: form.checkIn, checkOut: form.checkOut },
      });
      setAvailableRooms(data);
    } catch {
      setAvailableRooms([]);
    }
  };

  useEffect(() => {
    if (form.checkIn && form.checkOut) fetchAvailableRooms();
  }, [form.checkIn, form.checkOut]);

  const openCreate = () => {
    setForm(emptyForm);
    setAvailableRooms([]);
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/bookings', form);
      toast.success('Booking created successfully');
      setModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    try {
      await api.patch(`/bookings/${cancelModal._id}/cancel`, { cancellationReason });
      toast.success('Booking cancelled');
      setCancelModal(null);
      setCancellationReason('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleStatusUpdate = async (booking, status) => {
    try {
      await api.patch(`/bookings/${booking._id}/status`, { status });
      toast.success('Status updated');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const nights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex gap-3">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={() => setStatusFilter('')} className="btn-secondary text-sm">Clear</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{b.guestName}</p>
                      <p className="text-gray-400 text-xs">{b.guestEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">#{b.room?.roomNumber} <span className="text-gray-400 capitalize">({b.room?.type})</span></td>
                    <td className="px-6 py-4 text-gray-600">{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${b.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setDetailModal(b)} className="text-brand-600 hover:text-brand-800 text-sm font-medium">View</button>
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleStatusUpdate(b, 'checked_in')} className="text-green-600 hover:text-green-800 text-sm font-medium">Check In</button>
                        )}
                        {b.status === 'checked_in' && (
                          <button onClick={() => handleStatusUpdate(b, 'checked_out')} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Check Out</button>
                        )}
                        {['confirmed', 'checked_in'].includes(b.status) && (
                          <button onClick={() => { setCancelModal(b); setCancellationReason(''); }} className="text-red-500 hover:text-red-700 text-sm font-medium">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Booking Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Booking">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In *</label>
              <input type="date" className="input" value={form.checkIn} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, checkIn: e.target.value, roomId: '' })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out *</label>
              <input type="date" className="input" value={form.checkOut} min={form.checkIn || new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, checkOut: e.target.value, roomId: '' })} required />
            </div>
          </div>

          {form.checkIn && form.checkOut && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Room *</label>
              {availableRooms.length === 0 ? (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">No rooms available for selected dates</p>
              ) : (
                <select className="input" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required>
                  <option value="">Select a room</option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      #{r.roomNumber} — {r.type} · Floor {r.floor} · {r.capacity} guests · ${r.pricePerNight}/night
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
            <input className="input" placeholder="Full name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Email *</label>
              <input type="email" className="input" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="input" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea className="input resize-none" rows={2} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} />
          </div>

          {form.checkIn && form.checkOut && form.roomId && (
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-sm">
              <span className="text-brand-700 font-medium">
                {nights(form.checkIn, form.checkOut)} night(s) ·{' '}
                ${availableRooms.find((r) => r._id === form.roomId)?.pricePerNight * nights(form.checkIn, form.checkOut)} total
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving || availableRooms.length === 0}>
              {saving ? 'Creating...' : 'Create Booking'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel the booking for <span className="font-semibold">{cancelModal?.guestName}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea className="input resize-none" rows={2} value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} placeholder="Reason for cancellation..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCancel} className="btn-danger flex-1">Yes, Cancel Booking</button>
            <button onClick={() => setCancelModal(null)} className="btn-secondary flex-1">Keep Booking</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Booking Details">
        {detailModal && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-gray-500">Guest</p><p className="font-medium">{detailModal.guestName}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{detailModal.guestEmail}</p></div>
              <div><p className="text-gray-500">Phone</p><p className="font-medium">{detailModal.guestPhone || '—'}</p></div>
              <div><p className="text-gray-500">Room</p><p className="font-medium">#{detailModal.room?.roomNumber} ({detailModal.room?.type})</p></div>
              <div><p className="text-gray-500">Check In</p><p className="font-medium">{new Date(detailModal.checkIn).toLocaleDateString()}</p></div>
              <div><p className="text-gray-500">Check Out</p><p className="font-medium">{new Date(detailModal.checkOut).toLocaleDateString()}</p></div>
              <div><p className="text-gray-500">Nights</p><p className="font-medium">{nights(detailModal.checkIn, detailModal.checkOut)}</p></div>
              <div><p className="text-gray-500">Total Price</p><p className="font-medium">${detailModal.totalPrice}</p></div>
              <div><p className="text-gray-500">Status</p><span className={`badge ${statusColors[detailModal.status]}`}>{detailModal.status.replace('_', ' ')}</span></div>
              <div><p className="text-gray-500">Booked By</p><p className="font-medium">{detailModal.createdBy?.name}</p></div>
            </div>
            {detailModal.specialRequests && (
              <div><p className="text-gray-500">Special Requests</p><p className="font-medium">{detailModal.specialRequests}</p></div>
            )}
            {detailModal.status === 'cancelled' && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-700 font-medium text-xs">Cancelled by {detailModal.cancelledBy?.name} on {new Date(detailModal.cancelledAt).toLocaleDateString()}</p>
                {detailModal.cancellationReason && <p className="text-red-600 text-xs mt-1">{detailModal.cancellationReason}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
