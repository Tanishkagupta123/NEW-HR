export default function TrainingSettings() {
  return (
    <div>
      <h1 className="text-3xl font-black text-violet-950 mb-4">Settings</h1>
      <p className="text-slate-600 mb-6">Configure your training preferences, notifications, and course settings.</p>
      <div className="space-y-4">
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Course Preferences</h2>
          <p className="text-slate-600">Manage default settings for your training and learning experience.</p>
        </div>
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-violet-950 mb-2">Notification Settings</h2>
          <p className="text-slate-600">Choose how you receive training reminders and completion alerts.</p>
        </div>
      </div>
    </div>
  );
}
