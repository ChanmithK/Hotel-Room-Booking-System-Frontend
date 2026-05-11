'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-brand-100 text-brand-700',
  receptionist: 'bg-teal-100 text-teal-700',
};

const emptyForm = { name: '', email: '', password: '', role: 'receptionist' };

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      if (editing) {
        await api.put(`/users/${editing._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
    setSaving(false);
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} account{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Staff
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className={`hover:bg-gray-50/50 ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                        {u._id === user._id && <span className="text-xs text-gray-400">(you)</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-brand-600 hover:text-brand-800 text-sm font-medium">Edit</button>
                        {u._id !== user._id && (
                          <>
                            <button onClick={() => handleToggleActive(u)} className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleDelete(u)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                          </>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input className="input" placeholder="John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input" placeholder="john@hotel.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editing ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Staff' : 'Create Staff'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
