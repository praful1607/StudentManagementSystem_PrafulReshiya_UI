import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MasterPage from './pages/MasterPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes inside MasterPage Layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MasterPage />}>
          <Route index element={<Navigate to="/students" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="classes" element={<ClassesPage />} />
        </Route>
      </Route>
      
      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/students" replace />} />
    </Routes>
  );
}

export default App;
