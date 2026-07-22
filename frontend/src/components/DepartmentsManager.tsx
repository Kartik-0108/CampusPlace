import React, { useState, useEffect } from 'react';
import { Department } from '../types.ts';
import { api } from '../api.ts';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments();
      setDepartments(res.departments);
    } catch (err: any) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setAdding(true);
    try {
      const res = await api.createDepartment({ name, code });
      setDepartments([...departments, res.department]);
      setName('');
      setCode('');
    } catch (err: any) {
      alert(err.message || 'Failed to add department');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete department');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Department</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Data Science"
              className="w-full border-slate-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AI&DS"
              className="w-full border-slate-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {adding ? 'Adding...' : 'Add Department'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department Name</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {departments.map((dept) => (
              <motion.tr key={dept.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{dept.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
