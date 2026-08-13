import React, { useState } from "react";

export default function BonusIncentives() {
  const [form, setForm] = useState({
    employee: "",
    bonusType: "Performance",
    amount: "",
    reason: "",
  });

  const bonusList = [
    {
      employee: "Rahul",
      bonus: "₹5,000",
      month: "June",
    },
    {
      employee: "Priya",
      bonus: "₹8,000",
      month: "June",
    },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-8">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-violet-950">
          Bonus & Incentives
        </h2>
        <p className="text-slate-500 mt-2">
          Manage employee bonuses, incentives, rewards, and special payments.
        </p>
      </div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Employee */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            Employee
          </label>
          <select
            name="employee"
            value={form.employee}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="">Select Employee</option>
            <option>Rahul</option>
            <option>Priya</option>
            <option>Aman</option>
            <option>Neha</option>
          </select>
        </div>

        {/* Bonus Type */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            Bonus Type
          </label>
          <select
            name="bonusType"
            value={form.bonusType}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option>Performance</option>
            <option>Festival</option>
            <option>Referral</option>
            <option>Annual Bonus</option>
            <option>Special Reward</option>
          </select>
        </div>

        {/* Amount */}
        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold text-slate-700">
            Bonus Amount
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Enter bonus amount"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* Reason */}
        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold text-slate-700">
            Reason
          </label>

          <textarea
            rows="4"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Write reason for bonus..."
            className="w-full border rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* Button */}
        <div className="md:col-span-2">
          <button
            className="bg-violet-700 hover:bg-violet-800 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Save Bonus
          </button>
        </div>

      </div>

      {/* Table */}
      <div className="mt-10 overflow-x-auto">

        <h3 className="text-xl font-bold text-slate-800 mb-5">
          Bonus History
        </h3>

        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-4 font-semibold">Employee</th>
              <th className="p-4 font-semibold">Bonus</th>
              <th className="p-4 font-semibold">Month</th>
            </tr>
          </thead>

          <tbody>

            {bonusList.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-4">{item.employee}</td>
                <td className="p-4 font-semibold text-green-600">
                  {item.bonus}
                </td>
                <td className="p-4">{item.month}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}