import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Container
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { Snackbar, Alert } from "@mui/material";

function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const handleLogin = async (e, selectedRole) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { loginId, password });
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRoleInDB = payload.role.toLowerCase();

      if (userRoleInDB !== selectedRole.toLowerCase()) {
        setSeverity("error");
        setMessage(`Access Denied! You are registered as ${userRoleInDB.toUpperCase()}.`);
        setOpen(true);
        return;
      }

      setSeverity("success");
      setMessage("Login Successful!");
      setOpen(true);

      setTimeout(() => {
        login(token, userRoleInDB);
        navigate(`/${userRoleInDB}`);
      }, 1500);
    } catch (error) {
      setSeverity("error");
      setMessage(error.response?.data?.message || "Login Failed! Please check your credentials.");
      setOpen(true);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>

      {/* 🖼️ Background Image Restore */}
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

      {/* 🌫️ Slight Dark Overlay for contrast */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.3)",
          zIndex: -1
        }}
      />

      {/* 🏛️ University Branding */}
      <Box sx={{ position: "absolute", top: 30, left: 40, display: "flex", alignItems: "center", zIndex: 1 }}>
        <img src="/logo.png" alt="Logo" width="60" height="60" style={{ objectFit: "contain" }} />
        <Typography variant="h5" sx={{ ml: 1.5, fontWeight: "bold", color: "white", textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>
          ADITYA UNIVERSITY
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ zIndex: 1 }}>
        <Grid container spacing={3} justifyContent="center">
          {["student", "faculty", "admin"].map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role}>
              <Card sx={{
                borderRadius: 3,
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                textAlign: "center",
                maxWidth: 350,
                margin: "auto"
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: "#1763f1c8" }}>
                    {role.toUpperCase()}
                  </Typography>

                  <form onSubmit={(e) => handleLogin(e, role)}>
                    <TextField
                      label={role === "admin" ? "Username" : "Roll Number"}
                      fullWidth
                      margin="dense"
                      size="small"
                      autoComplete="off"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      fullWidth
                      margin="dense"
                      size="small"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LoginIcon />}
                      sx={{ mt: 2, textTransform: "none", fontWeight: "bold" }}
                      type="submit"
                    >
                      Login
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 📅 Center Bottom Copyright */}
      <Box sx={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center", zIndex: 1 }}>
        <Typography variant="caption" sx={{ color: "white", fontWeight: "bold" }}>
          © {new Date().getFullYear()} Aditya University. All Rights Reserved.
        </Typography>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;