"use client";

import { useState, useEffect } from "react";
import { servicesCMS, ServiceItem } from "@/lib/firebase-cms";
import { Trash2, Plus, Loader2, Edit, X } from "lucide-react";

export default function ManageServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", iconName: "", category: "Clients" });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await servicesCMS.getAll();
    setItems(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingId) {
      const res = await servicesCMS.update(editingId, formData);
      if (res.success) {
        setFormData({ title: "", description: "", iconName: "", category: "Clients" });
        setEditingId(null);
        await loadItems();
      } else {
        alert("Error updating service: " + res.error);
      }
    } else {
      const res = await servicesCMS.add(formData);
      if (res.success) {
        setFormData({ title: "", description: "", iconName: "", category: "Clients" });
        await loadItems();
      } else {
        alert("Error adding service: " + res.error);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleEdit = (item: ServiceItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      iconName: item.iconName || "",
      category: item.category || "Clients"
    });
    setEditingId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", description: "", iconName: "", category: "Clients" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await servicesCMS.remove(id);
    if (res.success) {
      await loadItems();
    } else {
      alert("Error deleting service: " + res.error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
        <p className="text-gray-500 mt-2">Add, edit, or remove services offered by CLNS.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-green-600" />}
          {editingId ? "Edit Service" : "Add New Service"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="Clients">Clients</option>
              <option value="Students">Students</option>
              <option value="Advocates">Advocates</option>
              <option value="Startups">Startups</option>
              <option value="MSME">MSME</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (optional, e.g. "Briefcase")</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.iconName} onChange={e => setFormData({ ...formData, iconName: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
          <div className="md:col-span-3 flex justify-end gap-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button disabled={isSubmitting} type="submit" className={`${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2`}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Service" : "Save Service")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Service Info</th>
              <th className="px-6 py-4 font-medium text-gray-500">Category</th>
              <th className="px-6 py-4 font-medium text-gray-500">Added</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No services found. Add one above!</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 max-w-lg">{item.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category || "Clients"}
                    </span>
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
