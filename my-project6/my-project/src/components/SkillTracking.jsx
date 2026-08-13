export default function SkillTracking() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Skill Tracking</h1>
      <p className="text-slate-600 mb-6">Monitor employee skills, skill gaps, and growth opportunities.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Skills Matrix</h2>
          <p className="text-slate-600">See which skills are strongest in your team and where training is needed.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Employee Progress</h2>
          <p className="text-slate-600">Track progress against target skill levels for each employee.</p>
        </div>
      </div>
    </div>
  );
}
