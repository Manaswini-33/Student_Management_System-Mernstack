import React, { useContext } from "react";
import { Box, Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Topbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        height: 70,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 4,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "top", // topbar part
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
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="white">
        ADITYA UNIVERSITY
      </Typography>

      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          backgroundColor: "#1565c0",
          "&:hover": {
            backgroundColor: "#0d47a1",
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Topbar;