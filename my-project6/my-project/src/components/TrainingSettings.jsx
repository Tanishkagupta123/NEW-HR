export default function TrainingSettings() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Training Settings</h1>
      <p className="text-slate-600 mb-6">Configure training rules, course categories, access settings, and notifications.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Course Settings</h2>
          <p className="text-slate-600">Set default rules for training assignment and course availability.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Notification Preferences</h2>
          <p className="text-slate-600">Manage email alerts and reminders for employee training activity.</p>
        </div>
      </div>
    </div>
  );
}
