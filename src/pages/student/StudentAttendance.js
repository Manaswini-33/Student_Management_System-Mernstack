import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Grid
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import API from "../../services/api";

const CHART_COLORS = ["#1565c0", "#2e7d32", "#f9a825", "#c62828", "#6a1b9a", "#00838f", "#ef6c00"];
const TIME_SLOTS = [
  { time: "9:30 - 10:20", index: 0 }, { time: "10:20 - 11:10", index: 1 },
  { time: "11:10 - 12:00", index: 2 }, { time: "12:00 - 12:50", index: 3 },
  { time: "12:50 - 13:40", index: 4 }, { time: "13:40 - 14:30", index: 5 },
  { time: "14:30 - 15:20", index: 6 }, { time: "15:20 - 16:10", index: 7 }
];

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const attendanceRes = await API.get("/attendance/my");
      setAttendance(attendanceRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance data", err);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const getPercentage = (present, total) => {
    if (total === 0) return 0;
    return ((present / total) * 100).toFixed(2);
  };

  const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });

  const renderDailySchedule = () => {
    // Filter attendance for the selected date
    const dailyAttendance = attendance.filter(item =>
      new Date(item.date).toISOString().split('T')[0] === selectedDate
    );

    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Select Date"
              type="date"
              fullWidth
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" color="textSecondary">
              Schedule for {dayName}, {new Date(selectedDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={1} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: "#1565c0" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Period</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subject</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Faculty</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Attendance Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyAttendance.length > 0 ? dailyAttendance.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{TIME_SLOTS.find(s => s.index === item.timetableSlotId?.timeSlotIndex)?.time || (item.timetableSlotId?.timeSlotIndex != null ? `Hour ${item.timetableSlotId.timeSlotIndex}` : "-")}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{item.subject || item.timetableSlotId?.subject || "N/A"}</TableCell>
                  <TableCell>{item.faculty?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Box sx={{
                      px: 2, py: 0.5, borderRadius: 1, display: 'inline-block',
                      bgcolor: item.status === "Present" ? '#e8f5e9' : '#ffebee',
                      color: item.status === "Present" ? '#2e7d32' : '#c62828',
                      fontWeight: 'bold'
                    }}>
                      {item.status}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No classes recorded for this date.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderMonthly = () => {
    const grouped = {};
    attendance.forEach(item => {
      const recDate = new Date(item.date);
      const monthStr = recDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      const subj = item.subject || item.timetableSlotId?.subject || "Unknown";

      if (!grouped[monthStr]) grouped[monthStr] = {};
      if (!grouped[monthStr][subj]) grouped[monthStr][subj] = { present: 0, total: 0 };

      grouped[monthStr][subj].total += 1;
      if (item.status === "Present") grouped[monthStr][subj].present += 1;
    });

    return (
      <Box sx={{ mt: 3 }}>
        {Object.keys(grouped).length > 0 ? Object.keys(grouped).map(month => (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography variant="h6" color="secondary" gutterBottom sx={{ fontWeight: 'bold' }}>{month}</Typography>
            <TableContainer component={Paper} elevation={1} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#eceff1" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Classes Attended</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Classes</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(grouped[month]).map(subj => {
                    const data = grouped[month][subj];
                    const pct = getPercentage(data.present, data.total);
                    return (
                      <TableRow key={subj}>
                        <TableCell>{subj}</TableCell>
                        <TableCell>{data.present}</TableCell>
                        <TableCell>{data.total}</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: pct >= 75 ? "#2e7d32" : "#c62828" }}>
                          {pct}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )) : <Typography>No monthly records found.</Typography>}
      </Box>
    );
  };

  const getSubjectWiseData = () => {
    const grouped = {};
    attendance.forEach(item => {
      const subj = item.subject || item.timetableSlotId?.subject || "Unknown";
      if (!grouped[subj]) grouped[subj] = { present: 0, total: 0, subject: subj };
      grouped[subj].total += 1;
      if (item.status === "Present") grouped[subj].present += 1;
    });
    return Object.values(grouped).map(g => ({
      ...g,
      percentage: getPercentage(g.present, g.total),
      name: g.subject
    }));
  };

  const subjectData = getSubjectWiseData();

  const renderCharts = () => {
    if (subjectData.length === 0) return null;
    const pieData = subjectData.map((d, i) => ({ name: d.subject, value: d.present, color: CHART_COLORS[i % CHART_COLORS.length] }));
    const barData = subjectData.map((d, i) => ({ ...d, fill: CHART_COLORS[i % CHART_COLORS.length] }));

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#1a237e" }}>
          Attendance by Subject (Courses)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2, height: 340 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Pie Chart - Classes Attended</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} classes`, "Attended"]} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2, height: 340 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Bar Chart - Attendance % per Subject</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} labelFormatter={(label) => `Subject: ${label}`} />
                  <Bar dataKey="percentage" fill="#1565c0" name="Attendance %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderOverall = () => {
    const grouped = {};
    attendance.forEach(item => {
      const subj = item.subject || item.timetableSlotId?.subject || "Unknown";
      if (!grouped[subj]) grouped[subj] = { present: 0, total: 0 };
      grouped[subj].total += 1;
      if (item.status === "Present") grouped[subj].present += 1;
    });

    return (
      <TableContainer component={Paper} elevation={1} sx={{ mt: 3 }} variant="outlined">
        <Table>
          <TableHead sx={{ backgroundColor: "#1565c0" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subject</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Classes Attended</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Classes</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", align: "right" }}>Overall Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(grouped).length > 0 ? Object.keys(grouped).map(subj => {
              const data = grouped[subj];
              const pct = getPercentage(data.present, data.total);
              return (
                <TableRow key={subj}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{subj}</TableCell>
                  <TableCell>{data.present}</TableCell>
                  <TableCell>{data.total}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", fontSize: '1.1rem', color: pct >= 75 ? "#2e7d32" : "#c62828" }}>
                    {pct}%
                  </TableCell>
                </TableRow>
              );
            }) : <TableRow><TableCell colSpan={4} align="center">No overall records found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ width: "100%", typography: 'body1' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1a237e" }}>
        Attendance Dashboard
      </Typography>

      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Box>
              <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="Daily View" sx={{ fontWeight: 'bold' }} />
                <Tab label="Monthly Analytics" sx={{ fontWeight: 'bold' }} />
                <Tab label="Cumulative Performance" sx={{ fontWeight: 'bold' }} />
              </Tabs>

              {renderCharts()}

              {tabIndex === 0 && renderDailySchedule()}
              {tabIndex === 1 && renderMonthly()}
              {tabIndex === 2 && renderOverall()}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAttendance;