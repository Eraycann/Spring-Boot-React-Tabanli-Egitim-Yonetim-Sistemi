import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import AddTeacherPage from './pages/AddTeacherPage';
import CreateCoursePage from './pages/CreateCoursePage';
import MyCoursesPage from './pages/MyCoursesPage';
import TeacherCoursesPage from './pages/TeacherCoursesPage';
import AllCoursesPage from './pages/AllCoursesPage'; // New import
import ExamSearchPage from './pages/ExamSearchPage';
import ExamDetailPage from './pages/ExamDetailPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ExamSubmissionsPage from './pages/ExamSubmissionsPage';
import ExamSubmissionDetailPage from './pages/ExamSubmissionDetailPage';
import StudentAnswersPage from './pages/StudentAnswersPage';
import TakeExamPage from './pages/TakeExamPage';
import Layout from './components/layout/Layout';
import { useAuthContext } from './contexts/AuthContext';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" />;
  }

  return children;
};

// Teacher Protected Route component
const TeacherProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ROLE_TEACHER') {
    return <Navigate to="/" />;
  }

  return children;
};

// Student Protected Route component
const StudentProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ROLE_STUDENT') {
    return <Navigate to="/" />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Router>
      <Routes>
        <Route
          path="/oauth2/callback"
          element={<OAuth2CallbackPage />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/add-teacher"
          element={
            <AdminProtectedRoute>
              <Layout>
                <AddTeacherPage />
              </Layout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/create-course"
          element={
            <TeacherProtectedRoute>
              <Layout>
                <CreateCoursePage />
              </Layout>
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <StudentProtectedRoute>
              <Layout>
                <MyCoursesPage />
              </Layout>
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/teacher-courses"
          element={
            <TeacherProtectedRoute>
              <Layout>
                <TeacherCoursesPage />
              </Layout>
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/all-courses"
          element={
            <ProtectedRoute>
              <Layout>
                <AllCoursesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-search"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamSearchPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-detail/:examId"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/question-detail/:questionId"
          element={
            <ProtectedRoute>
              <Layout>
                <QuestionDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-submissions"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamSubmissionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-submission-detail/:submissionId"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamSubmissionDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-answers/:examId"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentAnswersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-exam/:examId"
          element={
            <ProtectedRoute>
              <Layout>
                <TakeExamPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
