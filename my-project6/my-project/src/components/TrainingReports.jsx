export default function TrainingReports() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Training Reports</h1>
      <p className="text-slate-600 mb-6">Explore training performance reports, completion analytics, and course outcomes.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Completion Analytics</h2>
          <p className="text-slate-600">Analyze training completion rates and employee participation.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Performance Reports</h2>
          <p className="text-slate-600">View which courses improved employee performance the most.</p>
        </div>
      </div>
    </div>
  );
}
