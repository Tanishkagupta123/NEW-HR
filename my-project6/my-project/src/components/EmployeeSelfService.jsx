import React from 'react';

export default function EmployeeSelfService() {
  return (
    <div className="bg-white p-8 rounded-3xl border shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-violet-950 mb-2">Employee Self Service</h1>
        <p className="text-slate-600">Allow employees to manage profile changes, leave requests, payslips, and attendance review.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Profile Update</h2>
          <p className="text-slate-600">Employees can update their own profile information and contact details.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Leave Apply</h2>
          <p className="text-slate-600">Self-service leave application interface for employees.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Salary Slip Download</h2>
          <p className="text-slate-600">Download monthly salary slips directly from the portal.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Attendance Check</h2>
          <p className="text-slate-600">View personal attendance status and history.</p>
        </section>
      </div>
    </div>
  );
}
