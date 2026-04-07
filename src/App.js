import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useContext } from "react";

import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import FacultyManagement from "./pages/admin/FacultyManagement";
import CodingAnalytics from "./pages/admin/CodingAnalytics";
import AdminCodingManager from "./pages/admin/AdminCodingManager";
import AdminStudentAnalytics from "./pages/admin/AdminStudentAnalytics";
import Requests from "./pages/admin/Requests";
import AddStudent from "./pages/admin/AddStudent";
import AddFaculty from "./pages/admin/AddFaculty";
import AdminTimetable from "./pages/admin/AdminTimetable";


// Faculty Pages
import FacultyProfile from "./pages/faculty/FacultyProfile";
import FacultyTimetable from "./pages/faculty/FacultyTimetable.js";
import PostAttendance from "./pages/faculty/PostAttendance";
import FacultyRequests from "./pages/faculty/FacultyRequests";
import FacultyCoding from "./pages/faculty/FacultyCoding";

// Student Pages
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentRequests from "./pages/student/StudentRequests";
import StudentCoding from "./pages/student/StudentCoding";

function App() {
  const { darkMode } = useContext(AuthContext);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <Layout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="faculty" element={<FacultyManagement />} />
            <Route path="add-faculty" element={<AddFaculty />} />
            <Route path="coding-analytics" element={<CodingAnalytics />} />
            <Route path="coding-analytics/:rollNumber" element={<AdminStudentAnalytics />} />
            <Route path="manage-coding" element={<AdminCodingManager />} />
            <Route path="requests" element={<Requests />} />
            <Route path="manage-timetable" element={<AdminTimetable />} />
          </Route>

          {/* ================= FACULTY ================= */}
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute role="faculty">
                <Layout role="faculty" />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<FacultyProfile />} />
            <Route path="timetable" element={<FacultyTimetable />} />
            <Route path="mark-attendance" element={<PostAttendance />} />
            <Route path="requests" element={<FacultyRequests />} />
            <Route path="coding-view" element={<FacultyCoding />} />
            <Route path="coding-view/:rollNumber" element={<AdminStudentAnalytics basePath="/faculty/coding-view" hideManage={true} />} />
          </Route>

          {/* ================= STUDENT ================= */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute role="student">
                <Layout role="student" />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="coding" element={<StudentCoding />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;