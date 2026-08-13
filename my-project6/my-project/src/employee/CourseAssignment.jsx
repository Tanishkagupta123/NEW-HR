export default function CourseAssignment() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Course Assignment</h1>
      <p className="text-slate-600 mb-6">View the training courses assigned to you and their progress status.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Assigned Courses</h2>
          <p className="text-slate-600">See all courses currently assigned to you for completion.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Action Required</h2>
          <p className="text-slate-600">Complete pending modules and training tasks on time.</p>
        </div>
      </div>
    </div>
  );
}
