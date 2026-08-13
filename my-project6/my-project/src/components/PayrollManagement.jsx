import React from 'react';

export default function PayrollManagement() {
  return (
    <div className="bg-white p-8 rounded-3xl border shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-violet-950 mb-2">Payroll Management</h1>
        <p className="text-slate-600">Salary calculation, payslip generation, incentives, tax, reimbursement, and transfer reports.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Salary Calculation</h2>
          <p className="text-slate-600">Compute employee salaries using basic pay, allowances, deductions, leave adjustments, and overtime.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Payslip Generation</h2>
          <p className="text-slate-600">Generate monthly payslips for each employee with detailed breakdowns of earnings and deductions.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Bonus & Incentives</h2>
          <p className="text-slate-600">Manage performance bonuses, incentive plans, and reward payouts.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">PF / ESI / Tax</h2>
          <p className="text-slate-600">Handle statutory deductions like Provident Fund, ESI, and TDS tax calculations automatically.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Reimbursement</h2>
          <p className="text-slate-600">Track employee reimbursements and add them to salary processing.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-3">Salary Transfer Reports</h2>
          <p className="text-slate-600">View salary transfer status and reports for all payroll disbursements.</p>
        </section>
      </div>
    </div>
  );
}
