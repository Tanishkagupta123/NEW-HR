export default function SkillTracking() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Skill Tracking</h1>
      <p className="text-slate-600 mb-6">Track your skill development and identify areas for improvement.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Skill Progress</h2>
          <p className="text-slate-600">Monitor skill growth across your recent training activities.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Development Goals</h2>
          <p className="text-slate-600">See recommended skills to improve based on your role.</p>
        </div>
      </div>
    </div>
  );
}
