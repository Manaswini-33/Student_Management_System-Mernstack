import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, CircularProgress, Grid,
  Button, Chip, LinearProgress, IconButton, Avatar, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, FormControl, Select, MenuItem, InputLabel, TextField
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LaunchIcon from "@mui/icons-material/Launch";
import SyncIcon from "@mui/icons-material/Sync";
import CancelIcon from "@mui/icons-material/Cancel";
import CodeIcon from "@mui/icons-material/Code";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import API from "../../services/api";

// Platform colors & info
const PLATFORM_INFO = {
  leetcode: { name: "LeetCode", color: "#FFA116", bg: "#FFA11620" },
  codechef: { name: "CodeChef", color: "#5B4638", bg: "#5B463820" },
  gfg: { name: "GeeksforGeeks", color: "#2E8B57", bg: "#2E8B5720" },
  hackerrank: { name: "HackerRank", color: "#2EC866", bg: "#2EC86620" }
};

const DIFFICULTY_COLORS = {
  easy: "#4CAF50",    // Eco Green Easy
  medium: "#8BC34A",  // Light Green Medium
  hard: "#2E7D32"     // Dark Forest Hard
};

const LEVEL_INFO = {
  "Beginner": { threshold: 0, next: 101, nextName: "Intermediate", color: "#81c784" },
  "Intermediate": { threshold: 101, next: 250, nextName: "Advanced", color: "#4caf50" },
  "Advanced": { threshold: 250, next: 500, nextName: "Expert", color: "#388e3c" },
  "Expert": { threshold: 500, next: 1000, nextName: "Master", color: "#1b5e20" }
};

const determineOverallLevel = (score) => {
  if (score >= 500) return "Expert";
  if (score >= 250) return "Advanced";
  if (score >= 101) return "Intermediate";
  return "Beginner";
};

const StudentCoding = () => {
  // Stats for each platform
  const [stats, setStats] = useState({
    leetcode: null, codechef: null, gfg: null, hackerrank: null
  });

  const [loading, setLoading] = useState({
    leetcode: false, codechef: false, gfg: false, hackerrank: false
  });
  const [usernames, setUsernames] = useState({});
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Leaderboard states
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterSection, setFilterSection] = useState("All");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get("/students");
        setAllStudents(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard students", err);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsernames({
          leetcode: data.leetcodeUsername || null,
          codechef: data.codechefUsername || null,
          gfg: data.gfgUsername || null,
          hackerrank: data.hackerrankUsername || null
        });
        setProfileLoaded(true);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;
    Object.keys(usernames).forEach(platform => {
      if (usernames[platform]) {
        fetchStats(platform, usernames[platform]);
      }
    });
    // eslint-disable-next-line
  }, [profileLoaded]);

  const fetchStats = async (platform, username) => {
    setLoading(prev => ({ ...prev, [platform]: true }));

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`http://localhost:5000/api/coding/${platform}-stats`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(prev => ({ ...prev, [platform]: data }));
    } catch (err) {
      console.error(`Error fetching ${platform}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Calculate Aggregated Data
  const aggregated = {
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    score: 0
  };

  Object.values(stats).forEach(stat => {
    if (stat) {
      aggregated.totalSolved += stat.totalSolved || 0;
      aggregated.easy += stat.easySolved || 0;
      aggregated.medium += stat.mediumSolved || 0;
      aggregated.hard += stat.hardSolved || 0;
      aggregated.score += stat.score || 0;
    }
  });

  const overallLevel = determineOverallLevel(aggregated.score);

  // Chart Data Formatter
  const difficultyPieData = [
    { name: 'Easy', value: aggregated.easy, color: DIFFICULTY_COLORS.easy },
    { name: 'Medium', value: aggregated.medium, color: DIFFICULTY_COLORS.medium },
    { name: 'Hard', value: aggregated.hard, color: DIFFICULTY_COLORS.hard }
  ].filter(d => d.value > 0);

  const platformPieData = Object.keys(PLATFORM_INFO).map(key => {
    if (stats[key] && stats[key].totalSolved > 0) {
      return { name: PLATFORM_INFO[key].name, value: stats[key].totalSolved, color: PLATFORM_INFO[key].color };
    }
    return null;
  }).filter(Boolean);

  // Fake daily activity for visual representation as requested 
  const generateActivityData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(d => ({
      name: d,
      solved: Math.floor(Math.random() * 5 * (aggregated.score > 0 ? 1 : 0)) // only show activity if they actually have a score
    }));
  };
  const activityData = generateActivityData();

  // Generate Last 6 Months Activity based on Current Date
  const generateMonthlyData = () => {
    const data = [];
    const date = new Date(2026, 2, 1); // March 2026 based on timestamp
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthText = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      // Simulating progressive learning curve logically
      const progressRatio = Math.max(0.05, (6 - i) / 10);
      data.push({ month: monthText, count: Math.floor(aggregated.totalSolved * progressRatio) });
    }
    return data;
  };
  const monthlyData = generateMonthlyData();

  const anyLoading = Object.values(loading).some(l => l);

  // Leaderboard Filtering
  const getUniqueDepartments = () => {
    const depts = new Set(allStudents.map(s => s.department));
    return ["All", ...Array.from(depts).filter(Boolean)];
  };

  const getUniqueSections = () => {
    let pool = allStudents;
    if (filterDept !== "All") {
      pool = allStudents.filter(s => s.department === filterDept);
    }
    const secs = new Set(pool.map(s => s.section));
    return ["All", ...Array.from(secs).filter(Boolean)];
  };

  const filteredStudents = allStudents.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "All" || s.department === filterDept;
    const matchesSection = filterSection === "All" || s.section === filterSection;
    return matchesSearch && matchesDept && matchesSection;
  });

  const getRankIcon = (index) => {
    if (index === 0) return <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 22 }} />;
    if (index === 1) return <EmojiEventsIcon sx={{ color: "#c0c0c0", fontSize: 22 }} />;
    if (index === 2) return <EmojiEventsIcon sx={{ color: "#cd7f32", fontSize: 22 }} />;
    return <Typography variant="body2" fontWeight="bold" color="textSecondary" sx={{ ml: 0.5 }}>{index + 1}</Typography>;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 4, gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2, color: "#1a237e" }}>
          Coding Analytics Dashboard
          {anyLoading && <CircularProgress size={24} />}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive overview of your coding progression across all platforms.
        </Typography>

        <Chip
          icon={<StarIcon sx={{ color: '#FFD700 !important' }} />}
          label={`Overall Level: ${overallLevel}`}
          sx={{ bgcolor: LEVEL_INFO[overallLevel].color, color: 'white', fontWeight: 'bold', px: 1, py: 2.5, fontSize: "1rem", mt: 2 }}
        />
      </Box>

      {/* Platform Profiles Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.keys(PLATFORM_INFO).map(platform => {
          const info = PLATFORM_INFO[platform];
          const username = usernames[platform];
          const stat = stats[platform];
          const isLoading = loading[platform];

          return (
            <Grid item xs={12} sm={6} md={3} key={platform}>
              <Card sx={{ borderRadius: 3, borderTop: `4px solid ${info.color}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: info.color }}>
                      {info.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Refresh Platform">
                        <IconButton size="small" onClick={() => username && fetchStats(platform, username)} disabled={!username || isLoading}>
                          {isLoading ? <CircularProgress size={16} /> : <SyncIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      {stat && stat.profileUrl && (
                        <Tooltip title="View Profile">
                          <IconButton size="small" component="a" href={stat.profileUrl} target="_blank">
                            <LaunchIcon fontSize="small" sx={{ color: info.color }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {username ? (
                    stat ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>@{username}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          <Chip size="small" label={stat.level} sx={{ bgcolor: info.bg, color: info.color, fontWeight: 'bold' }} />
                          {stat.globalRanking && <Chip size="small" icon={<EmojiEventsIcon />} label={`Rank: ${stat.globalRanking}`} variant="outlined" />}
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                          {stat.totalSolved} Problems Solved
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Fetching data...</Typography>
                    )
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: "text.disabled", mt: 1 }}>
                      <CancelIcon fontSize="small" />
                      <Typography variant="body2">Not Linked</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Aggregated Stat Cards (5 Cards) */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: "#1a237e" }}>Aggregated Statistics</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: "Total Solved", value: aggregated.totalSolved, color: "#2196f3" },
          { label: "Easy", value: aggregated.easy, color: DIFFICULTY_COLORS.easy },
          { label: "Medium", value: aggregated.medium, color: DIFFICULTY_COLORS.medium },
          { label: "Hard", value: aggregated.hard, color: DIFFICULTY_COLORS.hard },
          { label: "Total Score", value: aggregated.score, color: "#9c27b0" }
        ].map((s, i) => (
          <Grid item xs={12} sm={4} md={2.4} key={i}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: `${s.color}0A`, border: `1px solid ${s.color}30` }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 'bold', mb: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1 }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4}>
        {/* Platform Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Problems by Platform</Typography>
              {platformPieData.length > 0 ? (
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformPieData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                        {platformPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography color="text.secondary">No data to display</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Difficulty Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Difficulty Breakdown</Typography>
              {difficultyPieData.length > 0 ? (
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyPieData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {difficultyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography color="text.secondary">No data to display</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly/Daily Activity Simulation Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Monthly Solved Activity</Typography>
              {aggregated.totalSolved > 0 ? (
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" stroke="#4CAF50" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography color="text.secondary">No activity to track</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Leaderboard Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: "#1a237e" }}>Student Leaderboard</Typography>
        
        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, background: "rgba(255,255,255,0.95)" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6" color="textSecondary" fontWeight="bold">
                Rankings
                <Chip label={`${filteredStudents.length} students`} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filterDept}
                    label="Department"
                    onChange={(e) => { setFilterDept(e.target.value); setFilterSection("All"); }}
                  >
                    {getUniqueDepartments().map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={filterSection}
                    label="Section"
                    onChange={(e) => setFilterSection(e.target.value)}
                  >
                    {getUniqueSections().map(sec => (
                      <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search by Name or Roll No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 260 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 4, background: "rgba(255,255,255,0.97)" }}>
          <Table aria-label="coding leaderboard table">
            <TableHead sx={{ backgroundColor: "#1565c0" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold", width: 70 }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Roll ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Department</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Section</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Platforms</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Solved</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Score</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, index) => {
                  const level = determineOverallLevel(s.score || 0);
                  const levelStyle = LEVEL_INFO[level] || { color: "#000" };
                  const platformCount = [s.leetcodeUsername, s.codechefUsername, s.gfgUsername, s.hackerrankUsername].filter(Boolean).length;

                  return (
                    <TableRow
                      key={s._id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        ...(index < 3 ? { bgcolor: index === 0 ? "#fffde7" : index === 1 ? "#fafafa" : "#fff8f0" } : {})
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getRankIcon(index)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: "#1565c0", fontSize: 14, fontWeight: "bold" }}>
                            {s.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold">{s.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{s.rollNumber}</Typography>
                      </TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.section || "N/A"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                          {s.leetcodeUsername && <Chip label="LC" size="small" sx={{ bgcolor: "#FFA11620", color: "#FFA116", fontSize: "0.65rem", height: 20 }} />}
                          {s.codechefUsername && <Chip label="CC" size="small" sx={{ bgcolor: "#5B463820", color: "#5B4638", fontSize: "0.65rem", height: 20 }} />}
                          {s.gfgUsername && <Chip label="GFG" size="small" sx={{ bgcolor: "#2F8D4620", color: "#2F8D46", fontSize: "0.65rem", height: 20 }} />}
                          {s.hackerrankUsername && <Chip label="HR" size="small" sx={{ bgcolor: "#00EA6420", color: "#00a84f", fontSize: "0.65rem", height: 20 }} />}
                          {platformCount === 0 && <Typography variant="caption" color="textSecondary">None</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="#2e7d32">
                          {s.totalSolved || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="#1a237e">
                          {s.score || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={level}
                          size="small"
                          sx={{
                            bgcolor: levelStyle.color,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.7rem"
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No students found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
};

export default StudentCoding;
