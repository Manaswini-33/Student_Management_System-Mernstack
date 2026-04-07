import React from "react";
import { Box, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ role }) => {
  const location = useLocation();

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "block",
      padding: "12px 15px",
      marginBottom: "8px",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: "bold",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      color: "#ffffff",
      transition: "0.3s",
      backdropFilter: "blur(5px)",
      boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.2)" : "none",
    };
  };

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        padding: 3,
        // Glassy blur mode with the login page background
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px)",
          zIndex: -2,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          zIndex: -1,
        },
        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 1
      }}
    >
      <Typography variant="h6" color="white" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        MENU
      </Typography>

      {/* ================= ADMIN ================= */}
      {role === "admin" && (
        <>
          <Link to="/admin" style={getLinkStyle("/admin")}>Admin Dashboard</Link>
          <Link to="/admin/students" style={getLinkStyle("/admin/students")}>Student Management</Link>
          <Link to="/admin/faculty" style={getLinkStyle("/admin/faculty")}>Faculty Management</Link>
          <Link to="/admin/manage-timetable" style={getLinkStyle("/admin/manage-timetable")}>Manage Timetable</Link>
          <Link to="/admin/coding-analytics" style={getLinkStyle("/admin/coding-analytics")}>Coding Analytics</Link>
          <Link to="/admin/requests" style={getLinkStyle("/admin/requests")}>Requests</Link>
        </>
      )}

      {/* ================= FACULTY ================= */}
      {role === "faculty" && (
        <>
          <Link to="/faculty/profile" style={getLinkStyle("/faculty/profile")}>View Profile</Link>
          <Link to="/faculty/timetable" style={getLinkStyle("/faculty/timetable")}>View Timetable</Link>
          <Link to="/faculty/mark-attendance" style={getLinkStyle("/faculty/mark-attendance")}>Mark Attendance</Link>
          <Link to="/faculty/requests" style={getLinkStyle("/faculty/requests")}>Requests</Link>
          <Link to="/faculty/coding-view" style={getLinkStyle("/faculty/coding-view")}>View Coding Performance</Link>
        </>
      )}

      {/* ================= STUDENT ================= */}
      {role === "student" && (
        <>
          <Link to="/student/profile" style={getLinkStyle("/student/profile")}>View Profile</Link>
          <Link to="/student/attendance" style={getLinkStyle("/student/attendance")}>View Attendance</Link>
          <Link to="/student/requests" style={getLinkStyle("/student/requests")}>Requests</Link>
          <Link to="/student/coding" style={getLinkStyle("/student/coding")}>Coding Analytics</Link>
        </>
      )}

    </Box>
  );
};

export default Sidebar;