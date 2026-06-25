"use client";

import { useState, useEffect } from "react";
import { getAffiliations, addAffiliation, updateAffiliation, deleteAffiliation, Affiliation } from "@/lib/firebase-affiliations";
import { Trash2, Plus, Loader2, Edit, X } from "lucide-react";

export default function ManageAffiliationsPage() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", logoUrl: "", websiteLink: "", isFeatured: false });

  useEffect(() => {
    loadAffiliations();
  }, []);

  const loadAffiliations = async () => {
    setIsLoading(true);
    const data = await getAffiliations();
    setAffiliations(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingId) {
      const res = await updateAffiliation(editingId, formData);
      if (res.success) {
        setFormData({ name: "", description: "", logoUrl: "", websiteLink: "", isFeatured: false });
        setEditingId(null);
        await loadAffiliations();
      } else {
        alert("Error updating affiliation: " + res.error);
      }
    } else {
      const res = await addAffiliation(formData);
      if (res.success) {
        setFormData({ name: "", description: "", logoUrl: "", websiteLink: "", isFeatured: false });
        await loadAffiliations();
      } else {
        alert("Error adding affiliation: " + res.error);
      }
    }

    setIsSubmitting(false);
  };

  const handleEdit = (aff: Affiliation) => {
    setFormData({
      name: aff.name,
      description: aff.description,
      logoUrl: aff.logoUrl,
      websiteLink: aff.websiteLink,
      isFeatured: aff.isFeatured || false
    });
    setEditingId(aff.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", description: "", logoUrl: "", websiteLink: "", isFeatured: false });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this affiliation?")) return;
    const res = await deleteAffiliation(id);
    if (res.success) {
      await loadAffiliations();
    } else {
      alert("Error deleting affiliation: " + res.error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Affiliations</h1>
        <p className="text-gray-500 mt-2">Add, edit, or remove partner affiliations shown on the public website.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
          {editingId ? "Edit Affiliation" : "Add New Affiliation"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company / Partner Name</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website Link</label>
            <input required type="url" placeholder="https://" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.websiteLink} onChange={e => setFormData({ ...formData, websiteLink: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image URL</label>
            <input required type="url" placeholder="https://" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2 mt-2">
            <input type="checkbox" id="isFeatured" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
            <label htmlFor="isFeatured" className="block text-sm font-medium text-gray-700">Featured Affiliation (shows at the top with special styling)</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea required rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button disabled={isSubmitting} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Affiliation" : "Save Affiliation")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500 w-5/12">Partner</th>
              <th className="px-6 py-4 font-medium text-gray-500 w-3/12">Website</th>
              <th className="px-6 py-4 font-medium text-gray-500 w-2/12">Added</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Loading...</td></tr>
            ) : affiliations.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No affiliations found. Add one above!</td></tr>
            ) : (
              affiliations.map(aff => (
                <tr key={aff.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 overflow-hidden">
                    <div className="flex items-center gap-4">
                      {aff.logoUrl && <img src={aff.logoUrl} alt={aff.name} className="w-10 h-10 object-contain rounded bg-white border shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2 truncate">
                          <span className="truncate">{aff.name}</span>
                          {aff.isFeatured && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">Featured</span>}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{aff.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 overflow-hidden">
                    <a href={aff.websiteLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate block">{aff.websiteLink}</a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(aff.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(aff)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition mr-2" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(aff.id!)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition" title="Delete">
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
