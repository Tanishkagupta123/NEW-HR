import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  ArrowUpCircle,
  Award,
  Calendar,
  Plus,
} from "lucide-react";

export default function PromotionTracking() {
  const [promotionList, setPromotionList] = useState([]);
  const [showNewPromotionForm, setShowNewPromotionForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    employee: '',
    currentRole: '',
    nextRole: '',
    readiness: 0,
    cycle: '',
    status: 'Eligible',
    department: '',
    reviewer_id: 1,
    comments: '',
    review_date: '',
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const handleChange = (field, value) => {
    if (field === 'employee') {
      const emp = employees.find((e) => String(e.id) === String(value));
      if (emp) {
        setNewPromotion((prev) => ({
          ...prev,
          employee: value,
          currentRole: emp.position || prev.currentRole,
          department: emp.department || prev.department,
        }));
        return;
      }
    }

    setNewPromotion((prev) => ({ ...prev, [field]: value }));
  };

  const normalizePromotion = (item) => {
    const commentText = item.comments || '';
    const parts = commentText.split('|').map((part) => part.trim()).filter(Boolean);
    const currentRole = parts[0] || 'Current Role';
    const nextRole = parts[1] || 'Next Role';

    return {
      id: item.id,
      employee: item.employee_name || `Employee ${item.employee_id}`,
      currentRole,
      nextRole,
      readiness: Number(item.rating) || 0,
      cycle: item.review_date || 'Q4 2026',
      status: item.review_date ? 'Eligible' : 'Under Review',
      department: item.department || '',
    };
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/performance-management/reviews`);
      const data = await res.json();
      setPromotionList((data || []).map(normalizePromotion));
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setPromotionList([]);
    }
  };

  const addPromotion = async () => {
    const empObj = employees.find((e) => String(e.id) === String(newPromotion.employee));
    const payload = {
      employee_id: newPromotion.employee || null,
      reviewer_id: newPromotion.reviewer_id || 1,
      rating: Number(newPromotion.readiness) || 0,
      comments: `${newPromotion.currentRole || 'Current Role'} | ${newPromotion.nextRole || 'Next Role'}`,
      review_date: newPromotion.review_date || new Date().toISOString().split('T')[0],
      department: newPromotion.department || (empObj && empObj.department) || null,
    };

    try {
      await fetch(`${API_BASE_URL}/admin/performance-management/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setNewPromotion({ employee: '', currentRole: '', nextRole: '', readiness: 0, cycle: '', status: 'Eligible', department: '' });
      setShowNewPromotionForm(false);
      fetchPromotions();
    } catch (err) {
      console.error('Error saving promotion:', err);
      setNewPromotion({ employee: '', currentRole: '', nextRole: '', readiness: 0, cycle: '', status: 'Eligible', department: '' });
      setShowNewPromotionForm(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/employees`)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data || []);
        const deps = Array.from(new Set((data || []).map((e) => e.department).filter(Boolean)));
        setDepartments(deps);
      })
      .catch(() => {
        setEmployees([]);
        setDepartments([]);
      });

    fetchPromotions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Promotion Tracking
          </h1>

          <p className="text-gray-500 mt-2">
            Track promotion cycles and candidate readiness at a glance.
          </p>
        </div>

        <button
          onClick={() => setShowNewPromotionForm((prev) => !prev)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Promotion Cycle
        </button>

      </div>

      {showNewPromotionForm ? (
        <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-violet-950 mb-4">Add Promotion</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <select
              value={newPromotion.employee}
              onChange={(e) => handleChange('employee', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}{emp.department ? ` - ${emp.department}` : ''}</option>
              ))}
            </select>
            <input
              value={newPromotion.currentRole}
              onChange={(e) => handleChange('currentRole', e.target.value)}
              placeholder="Current Role"
              className="border rounded-2xl p-4"
            />
            <input
              value={newPromotion.nextRole}
              onChange={(e) => handleChange('nextRole', e.target.value)}
              placeholder="Next Role"
              className="border rounded-2xl p-4"
            />
            <input
              value={newPromotion.readiness}
              onChange={(e) => handleChange('readiness', e.target.value)}
              type="number"
              min="0"
              max="100"
              placeholder="Readiness (%)"
              className="border rounded-2xl p-4"
            />
            <input
              value={newPromotion.cycle}
              onChange={(e) => handleChange('cycle', e.target.value)}
              placeholder="Cycle"
              className="border rounded-2xl p-4"
            />
            <select
              value={newPromotion.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={newPromotion.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option>Eligible</option>
              <option>Under Review</option>
              <option>Promoted</option>
              <option>Not Ready</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={addPromotion}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              Save Promotion
            </button>
            <button
              onClick={() => setShowNewPromotionForm(false)}
              className="border rounded-xl px-6 py-3"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Summary Cards */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">

        <div className="bg-white rounded-2xl shadow p-5">
          <Users size={34} className="text-indigo-600 mb-4" />
          <p className="text-gray-500">Candidates</p>
          <h2 className="text-4xl font-bold mt-2">34</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Award size={34} className="text-green-600 mb-4" />
          <p className="text-gray-500">Eligible</p>
          <h2 className="text-4xl font-bold mt-2">18</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <ArrowUpCircle size={34} className="text-blue-600 mb-4" />
          <p className="text-gray-500">Promoted</p>
          <h2 className="text-4xl font-bold mt-2">9</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Calendar size={34} className="text-orange-500 mb-4" />
          <p className="text-gray-500">Upcoming Cycle</p>
          <h2 className="text-4xl font-bold mt-2">Q4</h2>
        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl shadow">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-xl font-semibold">
            Promotion Candidates
          </h2>

          <div className="flex gap-3">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search Employee"
                className="border rounded-xl pl-10 pr-4 py-2"
              />

            </div>

            <button className="border rounded-xl px-4 flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>

          </div>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left">

              <th className="p-4">Employee</th>
              <th>Current Role</th>
              <th>Next Role</th>
              <th>Readiness</th>
              <th>Cycle</th>
              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {promotionList.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {item.employee}
                </td>

                <td>{item.currentRole}</td>

                <td>{item.nextRole}</td>

                <td className="w-72">

                  <div className="bg-gray-200 rounded-full h-3">

                    <div
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{
                        width: `${item.readiness}%`,
                      }}
                    />

                  </div>

                  <span className="text-sm text-gray-500">
                    {item.readiness}%
                  </span>

                </td>

                <td>{item.cycle}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      item.status === "Promoted"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Eligible"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "Under Review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}