import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Box, Typography, TextField, Button, Card, CardContent, CircularProgress, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../../services/api";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GradeIcon from "@mui/icons-material/Grade";
import CodeIcon from "@mui/icons-material/Code";

const StudentDashboard = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async () => {
    if (!rollNumber.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setAnalyticsData(null);
    try {
      const res = await API.get(`/coding/analytics/${rollNumber.trim()}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error fetching student analytics.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ display: "flex" }}>

      <Sidebar role="student" />
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
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.85)",
            boxShadow: 4,
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="#1a237e">
            Welcome, Student
          </Typography>
        </Box>

        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4, background: "rgba(255,255,255,0.85)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
              Lookup Student Coding Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Student Roll Number"
                variant="outlined"
                size="small"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </Box>

            {errorMsg && (
              <Typography color="error" sx={{ mt: 2, fontWeight: "bold" }}>
                {errorMsg}
              </Typography>
            )}

            {loading && <CircularProgress sx={{ mt: 3, display: 'block' }} />}

            {analyticsData && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h5" fontWeight="bold" color="#1565c0" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="large" /> Analytics for {analyticsData.studentName}
                </Typography>

                <Grid container spacing={4}>
                  {/* Left Column: Profile & Academic */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 2, bgcolor: "#fafafa", height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon /> Profile Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1"><strong>Roll Number:</strong> {analyticsData.rollNumber}</Typography>
                        <Typography variant="body1"><strong>Department:</strong> {analyticsData.department}</Typography>
                        <Typography variant="body1"><strong>Year:</strong> {analyticsData.year || "N/A"}</Typography>
                        <Typography variant="body1"><strong>Email:</strong> {analyticsData.email || "N/A"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Middle Column: Attendance */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 2, bgcolor: "#f1f8e9", height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventAvailableIcon /> Attendance
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", mt: 2 }}>
                          <Typography variant="h3" fontWeight="bold" color={analyticsData.attendance?.percentage >= 75 ? "green" : "red"}>
                            {analyticsData.attendance?.percentage || 0}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {analyticsData.attendance?.present} / {analyticsData.attendance?.total} Classes Attended
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Column: Marks */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 2, bgcolor: "#fff8e1", height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GradeIcon /> Marks
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {analyticsData.marks && analyticsData.marks.length > 0 ? (
                          <Table size="small">
                            <TableBody>
                              {analyticsData.marks.map((m, idx) => (
                                <TableRow key={idx}>
                                  <TableCell sx={{ pl: 0 }}>{m.subject}</TableCell>
                                  <TableCell align="right" sx={{ pr: 0, fontWeight: "bold" }}>{m.score}/{m.max}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography variant="body2" color="textSecondary">No marks available.</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h5" color="#1565c0" sx={{ mt: 5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon fontSize="large" /> Coding Performance
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: "#e3f2fd", boxShadow: 2, textAlign: 'center', p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="primary">Coding Level</Typography>
                      <Typography variant="h4" fontWeight="bold" color="secondary.main">{analyticsData.codingLevel}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: "#e8f5e9", boxShadow: 2, textAlign: 'center', p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="success.main">Total Problems</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.dark">{analyticsData.totalProblems}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: "#fff3e0", boxShadow: 2, textAlign: 'center', p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="warning.main">Average Rating</Typography>
                      <Typography variant="h4" fontWeight="bold" color="warning.dark">{analyticsData.averageRating}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: "#f3e5f5", boxShadow: 2, textAlign: 'center', p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="secondary.main">Difficulty</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">Easy: {analyticsData.difficultyDistribution.easy}</Typography>
                      <Typography variant="body1" fontWeight="bold" color="warning.main">Med: {analyticsData.difficultyDistribution.medium}</Typography>
                      <Typography variant="body1" fontWeight="bold" color="error.main">Hard: {analyticsData.difficultyDistribution.hard}</Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>Platform Breakdown</Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#1565c0" }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Platform</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: "center" }}>Total</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: "center" }}>Easy/Med/Hard</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: "center" }}>Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.platforms.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{p.platform}</TableCell>
                          <TableCell align="center">{p.status === "Linked" ? p.problemsSolved : "—"}</TableCell>
                          <TableCell align="center" sx={{ color: "#666" }}>
                            {p.status === "Linked" ? `${p.easySolved} / ${p.mediumSolved} / ${p.hardSolved}` : "—"}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: p.status === "Linked" ? "#1565c0" : "inherit" }}>
                            {p.status === "Linked" ? p.rating : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              </Box>
            )}
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
};

export default StudentDashboard;