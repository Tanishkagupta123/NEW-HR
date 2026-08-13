import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TaskWorkflowManagement() {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-3xl border shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-violet-950 mb-2">Task & Workflow Management</h1>
        <p className="text-slate-600">Manage task assignments, project tracking, team collaboration, and approval workflows.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          role="button"
          onClick={() => navigate('/admin/add-task')}
          className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm cursor-pointer hover:border-violet-300 hover:bg-white transition"
        >
          <h2 className="text-xl font-bold text-violet-950 mb-3">Task Assign</h2>
          <p className="text-slate-600">Assign tasks to employees and monitor completion status.</p>
        </section>

        <section
          role="button"
          onClick={() => navigate('/admin/data-tasks')}
          className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm cursor-pointer hover:border-violet-300 hover:bg-white transition"
        >
          <h2 className="text-xl font-bold text-violet-950 mb-3">Project Tracking</h2>
          <p className="text-slate-600">Track project progress and delivery milestones.</p>
        </section>

        <section
          role="button"
          onClick={() => navigate('/admin/team-collaboration')}
          className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm cursor-pointer hover:border-violet-300 hover:bg-white transition"
        >
          <h2 className="text-xl font-bold text-violet-950 mb-3">Team Collaboration</h2>
          <p className="text-slate-600">Support team communication and collaborative task updates.</p>
        </section>

        <section
          role="button"
          onClick={() => navigate('/admin/leave-management')}
          className="rounded-3xl border border-slate-100 p-6 bg-slate-50 shadow-sm cursor-pointer hover:border-violet-300 hover:bg-white transition"
        >
          <h2 className="text-xl font-bold text-violet-950 mb-3">Approval Flow</h2>
          <p className="text-slate-600">Manage task and leave approvals with an audit-friendly workflow.</p>
        </section>
      </div>
    </div>
  );
}
