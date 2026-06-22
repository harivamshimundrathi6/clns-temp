"use client";

import { useState, useEffect } from "react";
import { contactCMS, ContactItem } from "@/lib/firebase-cms";
import { Trash2, Plus, Loader2, Edit, X } from "lucide-react";

export default function ManageContactPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", email: "", phone: "" });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await contactCMS.getAll();
    setItems(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingId) {
      const res = await contactCMS.update(editingId, formData);
      if (res.success) {
        setFormData({ name: "", role: "", email: "", phone: "" });
        setEditingId(null);
        await loadItems();
      } else {
        alert("Error updating contact: " + res.error);
      }
    } else {
      const res = await contactCMS.add(formData);
      if (res.success) {
        setFormData({ name: "", role: "", email: "", phone: "" });
        await loadItems();
      } else {
        alert("Error adding contact: " + res.error);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (item: ContactItem) => {
    setFormData({
      name: item.name,
      role: item.role,
      email: item.email,
      phone: item.phone
    });
    setEditingId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", role: "", email: "", phone: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    const res = await contactCMS.remove(id);
    if (res.success) {
      await loadItems();
    } else {
      alert("Error deleting contact: " + res.error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Contacts</h1>
        <p className="text-gray-500 mt-2">Add, edit, or remove contact persons or office locations.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit className="w-5 h-5 text-red-600" /> : <Plus className="w-5 h-5 text-red-600" />}
          {editingId ? "Edit Contact" : "Add New Contact"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name / Office</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Designation</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input required type="email" placeholder="name@example.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input required type="text" placeholder="+1 234 567 8900" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2 gap-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button disabled={isSubmitting} type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Contact" : "Save Contact")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Contact Details</th>
              <th className="px-6 py-4 font-medium text-gray-500">Contact Info</th>
              <th className="px-6 py-4 font-medium text-gray-500">Added</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No contacts found. Add one above!</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900"><a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">{item.email}</a></div>
                    <div className="text-xs text-gray-500"><a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a></div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition mr-2" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
