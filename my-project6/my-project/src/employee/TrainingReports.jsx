export default function TrainingReports() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Reports</h1>
      <p className="text-slate-600 mb-6">See training reports and analytics for your completed and ongoing courses.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Completion Report</h2>
          <p className="text-slate-600">Track completion percentages and performance across your courses.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Performance Insights</h2>
          <p className="text-slate-600">Review analytics on training outcomes and certifications.</p>
        </div>
      </div>
    </div>
  );
}
