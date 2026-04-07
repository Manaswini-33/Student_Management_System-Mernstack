import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

function Layout({ role, children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Section */}
      <Box sx={{ flexGrow: 1, position: "relative", overflow: "hidden" }}>

        {/* Background Image (Same as Login Page) */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: "url('/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4, // Adjusted for visibility
            zIndex: -2
          }}
        />
        {/* Dark Overlay */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            zIndex: 1,
          }}
        />

        {/* Content Layer */}
        <Box sx={{ position: "relative", zIndex: 2 }}>

          {/* Top Navbar */}
          <Topbar />

          {/* Page Content */}
          <Box sx={{ p: 4, height: "calc(100vh - 64px)", overflowY: "auto" }}>
            {children || <Outlet />}
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

export default Layout;