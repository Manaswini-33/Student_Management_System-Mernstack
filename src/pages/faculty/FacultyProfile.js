import React, { useEffect, useState } from "react";
import API from "../../services/api";
import {
  Typography, Card, CardContent, CircularProgress, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableRow, Paper,
  TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";

const FacultyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    API.get("/profile/me")
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMsg({ type: "error", text: "New passwords do not match" });
    }
    try {
      const res = await API.post("/profile/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setMsg({ type: "success", text: res.data.message });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setOpenPasswordDialog(false);
        setMsg({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Error changing password" });
    }
  };

  const handleCloseDialog = () => {
    setOpenPasswordDialog(false);
    setMsg({ type: "", text: "" });
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <Box sx={{ width: "100%", typography: 'body1' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a237e" }}>My Profile</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : profile ? (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
                    <PersonIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">{profile.name}</Typography>
                    <Typography variant="body1" color="textSecondary">{profile.department} Department</Typography>
                  </Box>
                </Box>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2, mb: 2, fontWeight: 'bold', borderBottom: '2px solid #1a237e', pb: 1 }}>
                  Personal Information
                </Typography>
                <TableContainer component={Paper} elevation={1} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                  <Table>
                    <TableBody>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', width: '40%', bgcolor: '#f5f5f5' }}>Full Name</TableCell><TableCell>{profile.name}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Age</TableCell><TableCell>{profile.age || "Not Provided"}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Phone</TableCell><TableCell>{profile.phoneNumber || "Not Provided"}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email ID</TableCell><TableCell sx={{ wordBreak: 'break-all' }}>{profile.email}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" color="secondary" gutterBottom sx={{ mt: 1, mb: 3, fontWeight: 'bold', borderBottom: '2px solid #7b1fa2', pb: 1 }}>
                  Professional Information
                </Typography>
                <TableContainer component={Paper} elevation={1} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                  <Table>
                    <TableBody>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', width: '35%', bgcolor: '#fafafa' }}>Employee ID</TableCell><TableCell>{profile.rollNumber}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Department</TableCell><TableCell>{profile.department}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Designation</TableCell><TableCell>Assistant Professor</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>Specialization</TableCell><TableCell>{profile.department} Systems</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', pt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<VpnKeyIcon />}
                    onClick={() => setOpenPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography color="error">Failed to load profile data.</Typography>
      )}

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon /> Change Password
        </DialogTitle>
        <DialogContent dividers>
          {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
          <form id="password-form" onSubmit={handlePasswordChange}>
            <TextField
              fullWidth type="password" label="Current Password" variant="outlined" size="medium" sx={{ mb: 2, mt: 1 }} required
              value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
            <TextField
              fullWidth type="password" label="New Password" variant="outlined" size="medium" sx={{ mb: 2 }} required
              value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
            <TextField
              fullWidth type="password" label="Confirm New Password" variant="outlined" size="medium" sx={{ mb: 1 }} required
              value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button type="submit" form="password-form" variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default FacultyProfile;