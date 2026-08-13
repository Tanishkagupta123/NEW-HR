export default function TrainingOverview() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Employee Training</h1>
      <p className="text-slate-600 mb-6">This page shows employee training progress, assigned courses, and learning summaries.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Training Overview</h2>
          <p className="text-slate-600">Track course completion, training status, and upcoming learning sessions.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Top Courses</h2>
          <p className="text-slate-600">View most popular training modules assigned to employees.</p>
        </div>
      </div>
    </div>
  );
}
