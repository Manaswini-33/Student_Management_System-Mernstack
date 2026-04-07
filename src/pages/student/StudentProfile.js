import { useEffect, useState } from "react";
import API from "../../services/api";
import {
  Typography, Card, CardContent, CircularProgress, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableRow, Paper,
  TextField, Button, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, InputAdornment, Tooltip, IconButton, Chip
} from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CodeIcon from "@mui/icons-material/Code";

const PLATFORMS = [
  { id: "leetcode", name: "LeetCode", color: "#FFA116", urlPattern: "https://leetcode.com/" },
  { id: "codechef", name: "CodeChef", color: "#5B4638", urlPattern: "https://www.codechef.com/users/" },
  { id: "gfg", name: "GeeksforGeeks", color: "#2E8B57", urlPattern: "https://auth.geeksforgeeks.org/user/" },
  { id: "hackerrank", name: "HackerRank", color: "#2EC866", urlPattern: "https://www.hackerrank.com/" }
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Coding Usernames State
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [inputs, setInputs] = useState({});
  const [savingPlatform, setSavingPlatform] = useState(null);
  const [codingMsg, setCodingMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    API.get("/profile/me")
      .then((res) => {
        setProfile(res.data);
        setInputs({
          leetcode: res.data.leetcodeUsername || "",
          codechef: res.data.codechefUsername || "",
          gfg: res.data.gfgUsername || "",
          hackerrank: res.data.hackerrankUsername || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, []);

  const handleSaveUsername = async (platformId) => {
    const val = inputs[platformId];
    if (!val || !val.trim()) return;

    setSavingPlatform(platformId);
    setCodingMsg({ type: "", text: "" });

    try {
      const res = await API.put(`/coding/save-${platformId}-username`, { username: val.trim() });

      setProfile(prev => ({
        ...prev,
        [`${platformId}Username`]: val.trim(),
        totalSolved: res.data.student?.totalSolved || prev.totalSolved,
        score: res.data.student?.score || prev.score
      }));

      setCodingMsg({ type: "success", text: `${PLATFORMS.find(p => p.id === platformId).name} username saved!` });
      setEditingPlatform(null);

      setTimeout(() => setCodingMsg({ type: "", text: "" }), 4000);
    } catch (err) {
      setCodingMsg({ type: "error", text: err.response?.data?.error || "Failed to save username." });
    } finally {
      setSavingPlatform(null);
    }
  };

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

  const renderPlatformRow = (platform) => {
    const { id, name, color, urlPattern } = platform;
    const isEditing = editingPlatform === id;
    const isSaving = savingPlatform === id;
    const savedUsername = profile[`${id}Username`];
    const inputValue = inputs[id] || "";

    return (
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, borderColor: `${color}40` }} key={id}>
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ color, minWidth: 100 }}>{name}</Typography>
              {savedUsername && !isEditing && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "#4caf50 !important" }} />}
                  label={`@${savedUsername}`}
                  size="small"
                  sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontFamily: "monospace" }}
                />
              )}
            </Box>

            {isEditing ? (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder={`Enter ${name} username`}
                  value={inputValue}
                  onChange={(e) => setInputs(prev => ({ ...prev, [id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveUsername(id)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography variant="caption" color="textSecondary">@</Typography></InputAdornment>
                  }}
                  sx={{ minWidth: 200 }}
                  autoFocus
                />
                <Button
                  size="small" variant="contained"
                  startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                  onClick={() => handleSaveUsername(id)}
                  disabled={isSaving || !inputValue.trim()}
                  sx={{ bgcolor: color, "&:hover": { bgcolor: color, filter: 'brightness(0.9)' } }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button size="small" onClick={() => {
                  setEditingPlatform(null);
                  setInputs(prev => ({ ...prev, [id]: savedUsername || "" }));
                }}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                {savedUsername && (
                  <Tooltip title={`Open ${name} profile`}>
                    <IconButton size="small" component="a" href={`${urlPattern}${savedUsername}`} target="_blank" rel="noopener noreferrer">
                      <OpenInNewIcon sx={{ fontSize: 16, color }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={`Edit ${name} username`}>
                  <IconButton size="small" onClick={() => setEditingPlatform(id)}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {!savedUsername && !isEditing && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: "block" }}>
              Not linked — click the edit icon to add your username
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: "100%", typography: 'body1', px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a237e" }}>My Profile</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : profile ? (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, mb: 4, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
                    <PersonIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">{profile.name}</Typography>
                    <Typography variant="body1" color="textSecondary">{profile.department} | Year: {profile.year}</Typography>
                  </Box>
                </Box>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2, mb: 2, fontWeight: 'bold', borderBottom: '2px solid #1a237e', pb: 1 }}>
                  Personal Information
                </Typography>
                <TableContainer component={Paper} elevation={1} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                  <Table>
                    <TableBody>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', width: '35%', bgcolor: '#f5f5f5' }}>Full Name</TableCell><TableCell>{profile.name}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Roll Number</TableCell><TableCell>{profile.rollNumber}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Department</TableCell><TableCell>{profile.department}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Section</TableCell><TableCell>{profile.section || "N/A"}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Year</TableCell><TableCell>{profile.year}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Phone</TableCell><TableCell>{profile.phoneNumber || "Not Provided"}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email ID</TableCell><TableCell sx={{ wordBreak: 'break-all' }}>{profile.email}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, mb: 4, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                  <Typography variant="h6" color="secondary" fontWeight="bold" sx={{ borderBottom: '2px solid #7b1fa2', pb: 1, flex: 1 }}>
                    <CodeIcon sx={{ verticalAlign: "middle", mr: 1, color: "#9c27b0" }} />
                    Coding Profile Links
                  </Typography>
                </Box>

                {codingMsg.text && (
                  <Alert severity={codingMsg.type} sx={{ mb: 3, borderRadius: 2 }}>{codingMsg.text}</Alert>
                )}

                {PLATFORMS.map(platform => renderPlatformRow(platform))}

                <Typography variant="h6" color="secondary" fontWeight="bold" sx={{ borderBottom: '2px solid #7b1fa2', pb: 1, mt: 4, mb: 2 }}>
                  Combined Stats
                </Typography>

                <TableContainer component={Paper} elevation={1} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <Table>
                    <TableBody>
                      <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32', width: '35%' }}>Total Solved</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{profile.totalSolved || 0} Problems</TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: '#fff3e0' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>Overall Score</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>{profile.score || 0} Points</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
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
          <form id="student-password-form" onSubmit={handlePasswordChange}>
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
          <Button type="submit" form="student-password-form" variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default Profile;