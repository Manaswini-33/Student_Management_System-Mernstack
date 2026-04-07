import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Divider, Paper } from "@mui/material";
import API from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    overallAttendance: 0,
    todayAttendance: 0,
    todayPresent: 0,
    todayTotal: 0,
    departmentAttendance: []
  });
  const [codingStats, setCodingStats] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, facultyRes, attendanceRes, dailyRes, trendRes] = await Promise.all([
        API.get("/students"),
        API.get("/faculty"),
        API.get("/attendance/all"),
        API.get("/attendance/daily-summary"),
        API.get("/attendance/trend")
      ]);
      setAttendanceTrend(trendRes.data);

      const students = studentsRes.data;
      const attendanceRecords = attendanceRes.data;

      // Grouping by department for charts
      const deptStats = {};
      attendanceRecords.forEach(record => {
        const dept = record.student?.department || "Unknown";
        if (!deptStats[dept]) deptStats[dept] = { name: dept, present: 0, total: 0 };
        deptStats[dept].total += 1;
        if (record.status === "Present") deptStats[dept].present += 1;
      });

      const departmentAttendanceData = Object.values(deptStats).map(d => ({
        name: d.name,
        percentage: parseFloat(((d.present / d.total) * 100).toFixed(1))
      }));

      // Coding distribution
      const codingDist = [
        { name: 'Expert (>300)', value: students.filter(s => s.totalSolved > 300).length },
        { name: 'Advanced (150-300)', value: students.filter(s => s.totalSolved > 150 && s.totalSolved <= 300).length },
        { name: 'Intermediate (50-150)', value: students.filter(s => s.totalSolved > 50 && s.totalSolved <= 150).length },
        { name: 'Beginner (<50)', value: students.filter(s => s.totalSolved <= 50).length },
      ].filter(d => d.value > 0);

      setCodingStats(codingDist);

      const totalPresents = attendanceRecords.filter(r => r.status === "Present").length;
      const overall = attendanceRecords.length > 0 ? ((totalPresents / attendanceRecords.length) * 100).toFixed(2) : 0;

      setStats({
        totalStudents: students.length,
        totalFaculty: facultyRes.data.length,
        overallAttendance: overall,
        todayAttendance: dailyRes.data.percentage,
        todayPresent: dailyRes.data.present,
        todayTotal: dailyRes.data.total,
        departmentAttendance: departmentAttendanceData
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="#1a237e" sx={{ mb: 4, letterSpacing: 1 }}>
        University Administration Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
      ) : (
        <React.Fragment>
          {/* ================= SECTION 1: ATTENDANCE ANALYTICS ================= */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight="bold" color="#1565c0" sx={{ mb: 3, borderLeft: '5px solid #1565c0', pl: 2 }}>
              Overview & Attendance Analytics
            </Typography>
            <Grid container spacing={3}>
              {/* Top Metrics */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid #2196f3', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Total Enrollment</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">{stats.totalStudents}</Typography>
                  <Typography variant="caption">Students Registered</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid #4caf50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Faculty Strength</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1e5128">{stats.totalFaculty}</Typography>
                  <Typography variant="caption">Active Instructors</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid #ff9800', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Cumulative Attendance</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#e65100">{stats.overallAttendance}%</Typography>
                  <Typography variant="caption">Academic Year 2024-25</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid #9c27b0', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Daily Reporting</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#4a148c">{stats.todayAttendance}%</Typography>
                  <Typography variant="caption">{stats.todayPresent} of {stats.todayTotal} Present today</Typography>
                </Paper>
              </Grid>

              {/* Advanced Attendance Charts */}
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a237e" fontWeight="bold" gutterBottom>
                      Day-to-Day Attendance Trend
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ height: 350, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={attendanceTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                          <Legend />
                          <Line type="monotone" dataKey="percentage" name="Attendance Rate" stroke="#d32f2f" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a237e" fontWeight="bold" gutterBottom>
                      Monthly Departmental Metrics
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ height: 350, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart data={stats.departmentAttendance}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                          <Legend />
                          <Bar dataKey="percentage" name="Attendance %" fill="#1565c0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ================= SECTION 2: CODING PERFORMANCE ================= */}
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#e65100" sx={{ mb: 3, borderLeft: '5px solid #e65100', pl: 2 }}>
              Student Coding Performance Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a237e" fontWeight="bold" gutterBottom>
                      Overall Competency Distribution
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ height: 350, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={codingStats}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {codingStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Could add another chart here in the future if needed, leaving it empty or adding a placeholder */}
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: 4, borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                      Detailed Bar Graphs (Coming Soon)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      More coding insights can be added to this section.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};

export default AdminDashboard;