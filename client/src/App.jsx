import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages (to be created)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
// import NotFound from './pages/NotFound';

import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentProfile from './pages/students/StudentProfile';

import TeacherList from './pages/teachers/TeacherList';
import TeacherForm from './pages/teachers/TeacherForm';
import TeacherProfile from './pages/teachers/TeacherProfile';

import UserList from './pages/users/UserList';

import Attendance from './pages/attendance/Attendance';

import FeeList from './pages/fees/FeeList';
import FeeDetail from './pages/fees/FeeDetail';
import FeeDefaulters from './pages/fees/FeeDefaulters';
import ExpenseList from './pages/expenses/ExpenseList';
import SalaryList from './pages/salary/SalaryList';
import FinanceDashboard from './pages/finance/FinanceDashboard';

import ExamList from './pages/exams/ExamList';
import MarksEntry from './pages/exams/MarksEntry';
import ResultView from './pages/exams/ResultView';

import AIInsights from './pages/ai/AIInsights';
import StudentDashboard from './pages/student/StudentDashboard';
import MyResults from './pages/student/MyResults';
import MyAttendance from './pages/student/MyAttendance';

import DocumentVault from './pages/documents/DocumentVault';
import ReportsCenter from './pages/reports/ReportsCenter';
import Settings from './pages/settings/Settings';

// Temporary placeholders for pages until built
// const Login = () => <div className="glass p-8 rounded-xl w-full"><h1 className="text-2xl font-bold mb-4">Login to Suncity ERP</h1><button className="btn-primary w-full">Mock Login Action</button></div>;
// const Dashboard = () => <div><h1 className="text-3xl font-bold text-primary-600 mb-4">Suncity ERP Dashboard</h1><div className="glass p-6 rounded-xl"><p>Welcome back!</p></div></div>;
const NotFound = () => <div className="text-center mt-20"><h1 className="text-4xl font-bold mb-4">404</h1><p>Page not found</p></div>;

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          {/* forgot password, reset password will go here */}
        </Route>

        {/* Protected App Routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Students Module */}
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/students/:id/edit" element={<StudentForm />} />
          {/* Teachers Module */}
          <Route path="/teachers" element={<TeacherList />} />
          <Route path="/teachers/new" element={<TeacherForm />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/teachers/:id/edit" element={<TeacherForm />} />
          
          {/* Settings & Admin Module */}
          <Route path="/users" element={<UserList />} />
          
          {/* Attendance Module */}
          <Route path="/attendance" element={<Attendance />} />

          {/* Finance Module */}
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/fees" element={<FeeList />} />
          <Route path="/fees/defaulters" element={<FeeDefaulters />} />
          <Route path="/fees/:id" element={<FeeDetail />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/salary" element={<SalaryList />} />

          {/* Exam & Results Module */}
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/:id/marks" element={<MarksEntry />} />
          <Route path="/exams/:id/results" element={<ResultView />} />

          {/* AI Insights */}
          <Route path="/ai" element={<AIInsights />} />

          {/* Student Portal */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/my-results" element={<MyResults />} />
          <Route path="/my-attendance" element={<MyAttendance />} />

          {/* Compliance & Settings */}
          <Route path="/documents" element={<DocumentVault />} />
          <Route path="/reports" element={<ReportsCenter />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Other modules will be added here */}
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
