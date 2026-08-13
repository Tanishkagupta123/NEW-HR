import React, { useState } from "react";

export default function PFESITaxManagement() {
  const [form, setForm] = useState({
    basicSalary: 15000,
    pfPercent: 12,
    esiPercent: 0.75,
    professionalTax: 200,
    tds: 2050,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  const pfAmount = (
    (form.basicSalary * form.pfPercent) /
    100
  ).toFixed(2);

  const esiAmount = (
    (form.basicSalary * form.esiPercent) /
    100
  ).toFixed(2);

  const totalDeduction = (
    Number(pfAmount) +
    Number(esiAmount) +
    Number(form.professionalTax) +
    Number(form.tds)
  ).toFixed(2);

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-8">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-violet-950">
          PF / ESI / Tax Management
        </h2>
        <p className="text-slate-500 mt-2">
          Configure employee statutory deductions including PF, ESI,
          Professional Tax and TDS.
        </p>
      </div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Basic Salary */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            Basic Salary
          </label>
          <input
            type="number"
            name="basicSalary"
            value={form.basicSalary}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* PF */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            PF (%)
          </label>
          <input
            type="number"
            name="pfPercent"
            value={form.pfPercent}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* ESI */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            ESI (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="esiPercent"
            value={form.esiPercent}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* Professional Tax */}
        <div>
          <label className="block mb-2 font-semibold text-slate-700">
            Professional Tax (₹)
          </label>
          <input
            type="number"
            name="professionalTax"
            value={form.professionalTax}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* TDS */}
        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold text-slate-700">
            TDS (₹)
          </label>
          <input
            type="number"
            name="tds"
            value={form.tds}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

      </div>

      {/* Summary */}
      <div className="mt-10 bg-slate-50 rounded-2xl border p-6">

        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Deduction Summary
        </h3>

        <div className="space-y-4">

          <div className="flex justify-between">
            <span className="text-slate-600">PF Amount</span>
            <span className="font-semibold text-violet-700">
              ₹{pfAmount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">ESI Amount</span>
            <span className="font-semibold text-violet-700">
              ₹{esiAmount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">
              Professional Tax
            </span>
            <span className="font-semibold text-violet-700">
              ₹{form.professionalTax}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">TDS</span>
            <span className="font-semibold text-violet-700">
              ₹{form.tds}
            </span>
          </div>

          <hr />

          <div className="flex justify-between text-lg">
            <span className="font-bold text-slate-800">
              Total Deduction
            </span>
            <span className="font-bold text-red-600">
              ₹{totalDeduction}
            </span>
          </div>

        </div>

      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button className="bg-violet-700 hover:bg-violet-800 text-white px-8 py-3 rounded-xl font-semibold transition">
          Save
        </button>
      </div>

    </div>
  );
}