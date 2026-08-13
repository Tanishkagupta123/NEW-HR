export default function Certification() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Certification</h1>
      <p className="text-slate-600 mb-6">Manage employee certifications and view completion status.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Certification Status</h2>
          <p className="text-slate-600">Review which employees have completed certifications and which are pending.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Certification Library</h2>
          <p className="text-slate-600">List of available certification programs and training tracks.</p>
        </div>
      </div>
    </div>
  );
}
