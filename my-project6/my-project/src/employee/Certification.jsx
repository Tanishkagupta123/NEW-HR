export default function Certification() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Certification</h1>
      <p className="text-slate-600 mb-6">Review your certifications and any upcoming certification exams.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Certification Status</h2>
          <p className="text-slate-600">View completed certifications and progress toward new ones.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Upcoming Exams</h2>
          <p className="text-slate-600">Prepare for scheduled certification opportunities.</p>
        </div>
      </div>
    </div>
  );
}
