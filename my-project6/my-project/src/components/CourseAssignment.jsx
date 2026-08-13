export default function CourseAssignment() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Course Assignment</h1>
      <p className="text-slate-600 mb-6">Assign training courses to employees and review active learning plans.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Assign New Course</h2>
          <p className="text-slate-600">Choose employees and courses to create tailored learning paths.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Assigned Courses</h2>
          <p className="text-slate-600">Review all courses currently assigned across the organization.</p>
        </div>
      </div>
    </div>
  );
}
