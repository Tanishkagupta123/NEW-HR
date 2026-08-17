import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './pages/AdminHome';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeAttendance from './employee/EmployeeAttendance';
import EmployeeDocumentsRequest from './employee/EmployeeDocumentsRequest';

// Admin Components
import AddEmployee from './components/AddEmployee';
import AllEmployees from './components/AllEmployees';
import Attendance from './components/Attendance';
import LeaveManagement from './components/LeaveManagement';
import PayrollManagement from './components/PayrollManagement';
import PayrollManagement1 from './components/PayrollManagement1';
import PerformanceManagement from './components/PerformanceManagement';
import KPITracking from './components/KPITracking';
import EmployeeReviews from './components/EmployeeReviews';
import GoalSetting from './components/GoalSetting';
import PromotionTracking from './components/PromotionTracking';
import EmployeeSelfService from './components/EmployeeSelfService';
import TaskWorkflowManagement from './components/TaskWorkflowManagement';
import TeamCollaboration from './components/TeamCollaboration';
import Updates from './pages/Updates';
import HRAssistant from './components/HRAssistant';
import Communication from './components/communication';
import AddTask from './components/AddTask';
import DataOfTasks from './components/DataOfTasks';
import TrainingOverview from './components/TrainingOverview';
import CourseAssignment from './components/CourseAssignment';
import SkillTracking from './components/SkillTracking';
import Certification from './components/Certification';
import TrainingReports from './components/TrainingReports';
import TrainingSettings from './components/TrainingSettings';
import AdminHiring from './pages/AdminHiring';
import CertificateManagement from './components/CertificateManagement';
import EmployeeDocuments, { EmployeeDocumentPage } from './components/EmployeeDocuments';

// Employee Components
import EmployeeProfile from './employee/EmployeeProfile';
import EmployeeTasks from './employee/EmployeeTasks';
import EmployeeLeave from './employee/EmployeeLeave';
import EmployeeTraining from './employee/EmployeeTraining';
import EmployeeCourseAssignment from './employee/CourseAssignment';
import EmployeeSkillTracking from './employee/SkillTracking';
import EmployeeCertification from './employee/Certification';
import EmployeeTrainingReports from './employee/TrainingReports';
import EmployeeTrainingSettings from './employee/TrainingSettings';
import PayslipGeneration from './components/PayslipGeneration';
import PFESITaxManagement from './components/PFESITaxManagement';

function clearSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('loggedInUser');
}

function getSessionUser() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    const encodedPayload = token.split('.')[1];
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalizedPayload + '='.repeat((4 - normalizedPayload.length % 4) % 4)));
    const role = user?.role?.toLowerCase();

    if (!role || !payload?.exp || payload.exp * 1000 <= Date.now()) {
      clearSession();
      return null;
    }

    return { ...user, role };
  } catch {
    clearSession();
    return null;
  }
}

function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRole === 'employee' && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}





import GlobalPopup from './components/GlobalPopup';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalPopup />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard: Saare Admin ke kaam yahan nested hain */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="all-employees" element={<AllEmployees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave-management" element={<LeaveManagement />} />
            <Route path="payroll-management" element={<PayrollManagement />} />
            <Route path="payroll-management1" element={<PayrollManagement1 />} />
            <Route path="payslip-generation" element={<PayslipGeneration />} />
            <Route path="pf-esi-tax-management" element={<PFESITaxManagement />} />
            <Route path="performance-management" element={<PerformanceManagement />} />
            <Route path="performance-management/kpi" element={<KPITracking />} />
            <Route path="performance-management/reviews" element={<EmployeeReviews />} />
            <Route path="performance-management/goal" element={<GoalSetting />} />
            <Route path="performance-management/promotion" element={<PromotionTracking />} />
            <Route path="performance-management/feedback" element={<EmployeeReviews />} />
            <Route path="ess" element={<EmployeeSelfService />} />
            <Route path="task-workflow-management" element={<TaskWorkflowManagement />} />
            <Route path="communication-system" element={<Communication />} />
            <Route path="communication-system/notice" element={<Communication defaultPanel="notice" />} />
            <Route path="communication-system/announcement" element={<Communication defaultPanel="announcement" />} />
            <Route path="communication-system/email" element={<Communication defaultPanel="email" />} />
            <Route path="team-collaboration" element={<TeamCollaboration />} />
            <Route path="updates" element={<Updates />} />
            <Route path="add-task" element={<AddTask />} />
            <Route path="data-tasks" element={<DataOfTasks />} />
            <Route path="certificate-management" element={<CertificateManagement />} />
            <Route path="employee-documents" element={<EmployeeDocuments />} />
            <Route path="employee-documents/offer-letter" element={<EmployeeDocumentPage type="offer" />} />
            <Route path="employee-documents/joining-letter" element={<EmployeeDocumentPage type="joining" />} />
            <Route path="employee-documents/internship-offer-letter" element={<EmployeeDocumentPage type="internship" />} />
            <Route path="employee-documents/experience-letter" element={<EmployeeDocumentPage type="experience" />} />
            <Route path="employee-documents/notice-period-letter" element={<EmployeeDocumentPage type="notice" />} />
            <Route path="employee-documents/receipt" element={<EmployeeDocumentPage type="receipt" />} />
            <Route path="hiring/training" element={<EmployeeTraining />} />
            <Route path="hiring" element={<AdminHiring />} />
          </Route>
        </Route>

        {/* Employee Dashboard: Yahan nested routes ka use hoga */}
        <Route element={<ProtectedRoute allowedRole="employee" />}>
          <Route path="/dashboard" element={<EmployeeDashboard />}>
            <Route index element={<EmployeeProfile />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="apply-leave" element={<EmployeeLeave />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="employee-documents" element={<EmployeeDocumentsRequest />} />
            <Route path="employee-training" element={<EmployeeTraining />} />
            <Route path="communication-system" element={<TeamCollaboration />} />
            <Route path="team-collaboration" element={<TeamCollaboration />} />
            <Route path="updates" element={<Updates />} />
            <Route path="system" element={<HRAssistant />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
