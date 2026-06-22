"use client";

import { useState, useEffect } from "react";
import { careersCMS, CareerItem } from "@/lib/firebase-cms";
import { Trash2, Plus, Loader2, Edit, X } from "lucide-react";

export default function ManageCareersPage() {
  const [items, setItems] = useState<CareerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", department: "", location: "", description: "", applyLink: "" });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await careersCMS.getAll();
    setItems(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingId) {
      const res = await careersCMS.update(editingId, formData);
      if (res.success) {
        setFormData({ title: "", department: "", location: "", description: "", applyLink: "" });
        setEditingId(null);
        await loadItems();
      } else {
        alert("Error updating career: " + res.error);
      }
    } else {
      const res = await careersCMS.add(formData);
      if (res.success) {
        setFormData({ title: "", department: "", location: "", description: "", applyLink: "" });
        await loadItems();
      } else {
        alert("Error adding career: " + res.error);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (item: CareerItem) => {
    setFormData({
      title: item.title,
      department: item.department,
      location: item.location,
      description: item.description,
      applyLink: item.applyLink
    });
    setEditingId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", department: "", location: "", description: "", applyLink: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    const res = await careersCMS.remove(id);
    if (res.success) {
      await loadItems();
    } else {
      alert("Error deleting career: " + res.error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Careers</h1>
        <p className="text-gray-500 mt-2">Add, edit, or remove job postings.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-orange-600" />}
          {editingId ? "Edit Job Posting" : "Add New Job Posting"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input required type="text" placeholder="e.g. Remote, Hyderabad" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apply Link</label>
            <input required type="url" placeholder="https://" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.applyLink} onChange={e => setFormData({ ...formData, applyLink: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button disabled={isSubmitting} type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Job" : "Save Job")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Job Details</th>
              <th className="px-6 py-4 font-medium text-gray-500">Department & Location</th>
              <th className="px-6 py-4 font-medium text-gray-500">Added</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No careers found. Add one above!</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.department}</div>
                    <div className="text-xs text-gray-500">{item.location}</div>
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
