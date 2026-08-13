import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Plus,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react";

export default function EmployeeReviews() {
  const [reviewsState, setReviewsState] = useState([]);
  const [showNewReviewForm, setShowNewReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    employee: '',
    department: '',
    reviewer: '',
    rating: 5,
    reviewDate: '',
    status: 'Pending',
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const handleChange = (field, value) => {
    if (field === 'employee') {
      const selected = employees.find((emp) => emp.name === value);
      if (selected) {
        setNewReview((prev) => ({
          ...prev,
          employee: selected.name,
          department: selected.department || prev.department,
        }));
        return;
      }
    }

    setNewReview((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeReview = (item) => ({
    id: item.id,
    employee: item.employee_name || `Employee ${item.employee_id}`,
    department: item.department || '',
    reviewer: item.reviewer_name || `Reviewer ${item.reviewer_id}`,
    rating: Number(item.rating) || 0,
    reviewDate: item.review_date
      ? new Date(item.review_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '',
    status: item.review_date ? 'Completed' : 'Pending',
  });

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/performance-management/reviews`);
      if (res && res.data) {
        setReviewsState(res.data.map(normalizeReview));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      if (res && res.data) {
        setEmployees(res.data);
        const uniqueDepartments = Array.from(
          new Set(res.data.map((emp) => emp.department).filter(Boolean))
        );
        setDepartments(uniqueDepartments);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchReviews();
  }, []);

  const addReview = async () => {
    const employeeSelected = employees.find((emp) => emp.name === newReview.employee);
    const reviewerSelected = employees.find((emp) => emp.name === newReview.reviewer);
    const employee_id = employeeSelected ? employeeSelected.id : null;
    const reviewer_id = reviewerSelected ? reviewerSelected.id : employee_id;

    if (!employee_id) {
      console.error('Employee selection required');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/admin/performance-management/reviews`, {
        employee_id,
        reviewer_id,
        rating: Number(newReview.rating) || 1,
        comments: null,
        review_date: newReview.reviewDate || null,
        department: newReview.department || '',
      });

      setNewReview({ employee: '', department: '', reviewer: '', rating: 5, reviewDate: '', status: 'Pending' });
      setShowNewReviewForm(false);
      fetchReviews();
    } catch (err) {
      console.error('Error saving review:', err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Employee Reviews
          </h1>

          <p className="text-gray-500 mt-2">
            Manage performance reviews, feedback sessions, and appraisal
            notes.
          </p>

        </div>

        <button
          onClick={() => setShowNewReviewForm((prev) => !prev)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          New Review
        </button>

      </div>

      {showNewReviewForm ? (
        <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-violet-950 mb-4">Create Review</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <select
              value={newReview.employee}
              onChange={(e) => handleChange('employee', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
            <select
              value={newReview.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <input
              value={newReview.reviewer}
              onChange={(e) => handleChange('reviewer', e.target.value)}
              placeholder="Reviewer"
              className="border rounded-2xl p-4"
            />
            <input
              value={newReview.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
              type="number"
              min="1"
              max="5"
              placeholder="Rating"
              className="border rounded-2xl p-4"
            />
            <input
              value={newReview.reviewDate}
              onChange={(e) => handleChange('reviewDate', e.target.value)}
              type="date"
              className="border rounded-2xl p-4"
            />
            <select
              value={newReview.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option>Pending</option>
              <option>In Review</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={addReview}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              Save Review
            </button>
            <button
              onClick={() => setShowNewReviewForm(false)}
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
          <MessageSquare size={35} className="text-indigo-600 mb-4" />
          <p className="text-gray-500">Total Reviews</p>
          <h2 className="text-4xl font-bold mt-2">124</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Star size={35} className="text-yellow-500 mb-4" />
          <p className="text-gray-500">Average Rating</p>
          <h2 className="text-4xl font-bold mt-2">4.6</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Calendar size={35} className="text-green-600 mb-4" />
          <p className="text-gray-500">Completed Reviews</p>
          <h2 className="text-4xl font-bold mt-2">98</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Calendar size={35} className="text-red-500 mb-4" />
          <p className="text-gray-500">Pending Reviews</p>
          <h2 className="text-4xl font-bold mt-2">26</h2>
        </div>

      </div>

      {/* Reviews Table */}

      <div className="bg-white rounded-2xl shadow">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-xl font-semibold">
            Employee Review List
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
              <th>Department</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Review Date</th>
              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {reviewsState.map((review) => (

              <tr
                key={review.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {review.employee}
                </td>

                <td>{review.department}</td>

                <td>{review.reviewer}</td>

                <td>

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <Star
                        key={star}
                        size={18}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />

                    ))}

                  </div>

                </td>

                <td>{review.reviewDate}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        review.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : review.status === "Pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {review.status}
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