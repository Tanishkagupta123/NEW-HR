import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Plus,
  Target,
  Flag,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const goals = [
  {
    id: 1,
    employee: "John Smith",
    goal: "Complete HRMS Dashboard",
    priority: "High",
    deadline: "30 Jul 2026",
    progress: 80,
    status: "In Progress",
  },
  {
    id: 2,
    employee: "Emma Wilson",
    goal: "Reduce Recruitment Time",
    priority: "Medium",
    deadline: "15 Aug 2026",
    progress: 55,
    status: "In Progress",
  },
  {
    id: 3,
    employee: "Michael Lee",
    goal: "Increase Sales by 20%",
    priority: "High",
    deadline: "01 Sep 2026",
    progress: 100,
    status: "Completed",
  },
  {
    id: 4,
    employee: "Sophia Davis",
    goal: "Improve Customer Satisfaction",
    priority: "Low",
    deadline: "20 Sep 2026",
    progress: 35,
    status: "Pending",
  },
];

export default function GoalSetting() {
  const [goalsState, setGoalsState] = useState(goals);
  const [employees, setEmployees] = useState([]);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    employee: '',
    goal: '',
    priority: 'Medium',
    deadline: '',
    progress: 0,
    status: 'Pending',
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/employees`);
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (field, value) => {
    setNewGoal((prev) => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    const goalToAdd = {
      id: goalsState.length + 1,
      employee: newGoal.employee || 'New Employee',
      goal: newGoal.goal || 'New Goal',
      priority: newGoal.priority,
      deadline: newGoal.deadline || new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      progress: Number(newGoal.progress) || 0,
      status: newGoal.status,
    };

    setGoalsState([goalToAdd, ...goalsState]);
    setNewGoal({ employee: '', goal: '', priority: 'Medium', deadline: '', progress: 0, status: 'Pending' });
    setShowNewGoalForm(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Goal Setting
          </h1>

          <p className="text-gray-500 mt-2">
            Define objectives and goals for employees, teams, and departments.
          </p>
        </div>

        <button
          onClick={() => setShowNewGoalForm((prev) => !prev)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Add Goal
        </button>

      </div>

      {showNewGoalForm ? (
        <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-violet-950 mb-4">New Goal</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <select
              value={newGoal.employee}
              onChange={(e) => handleChange('employee', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
            <input
              value={newGoal.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              placeholder="Goal"
              className="border rounded-2xl p-4"
            />
            <select
              value={newGoal.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              value={newGoal.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              type="date"
              className="border rounded-2xl p-4"
            />
            <input
              value={newGoal.progress}
              onChange={(e) => handleChange('progress', e.target.value)}
              type="number"
              min="0"
              max="100"
              placeholder="Progress (%)"
              className="border rounded-2xl p-4"
            />
            <select
              value={newGoal.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="border rounded-2xl p-4"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={addGoal}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              Save Goal
            </button>
            <button
              onClick={() => setShowNewGoalForm(false)}
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
          <Target className="text-indigo-600 mb-4" size={34} />
          <p className="text-gray-500">Total Goals</p>
          <h2 className="text-4xl font-bold mt-2">68</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <CheckCircle2 className="text-green-600 mb-4" size={34} />
          <p className="text-gray-500">Completed</p>
          <h2 className="text-4xl font-bold mt-2">42</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Calendar className="text-orange-500 mb-4" size={34} />
          <p className="text-gray-500">Pending</p>
          <h2 className="text-4xl font-bold mt-2">18</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <Flag className="text-red-500 mb-4" size={34} />
          <p className="text-gray-500">High Priority</p>
          <h2 className="text-4xl font-bold mt-2">8</h2>
        </div>

      </div>

      {/* Goal Table */}

      <div className="bg-white rounded-2xl shadow">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-xl font-semibold">
            Employee Goals
          </h2>

          <div className="flex gap-3">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search Goal"
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
              <th>Goal</th>
              <th>Priority</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {goalsState.map((goal) => (

              <tr key={goal.id} className="border-b hover:bg-gray-50">

                <td className="p-4 font-medium">
                  {goal.employee}
                </td>

                <td>{goal.goal}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      goal.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : goal.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {goal.priority}
                  </span>

                </td>

                <td>{goal.deadline}</td>

                <td className="w-72">

                  <div className="bg-gray-200 rounded-full h-3">

                    <div
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />

                  </div>

                </td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      goal.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : goal.status === "Pending"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {goal.status}
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
