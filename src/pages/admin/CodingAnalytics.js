import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Box, Typography, TextField, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, Avatar, FormControl, Select, MenuItem, InputLabel,
  Chip, Tooltip, CircularProgress, Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CodeIcon from "@mui/icons-material/Code";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const LEVEL_COLORS = {
  Expert: { bg: "#ffebee", color: "#b71c1c", label: "Expert" },
  Advanced: { bg: "#f3e5f5", color: "#6a1b9a", label: "Advanced" },
  Intermediate: { bg: "#e3f2fd", color: "#1565c0", label: "Intermediate" },
  Beginner: { bg: "#eceff1", color: "#546e7a", label: "Beginner" },
};

const getCodingLevel = (totalSolved) => {
  if (totalSolved > 300) return "Expert";
  if (totalSolved > 150) return "Advanced";
  if (totalSolved > 50) return "Intermediate";
  return "Beginner";
};

const SummaryCard = ({ icon, title, value, color }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3, borderTop: `4px solid ${color}` }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
      <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1.5, display: "flex" }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight="bold" sx={{ color }}>{value}</Typography>
        <Typography variant="caption" color="textSecondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const CodingAnalytics = ({ basePath = "/admin/coding-analytics" }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/students");
      const sortedStudents = res.data.sort((a, b) => b.score - a.score);
      setStudents(sortedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueDepartments = () => {
    const depts = new Set(students.map(s => s.department));
    return ["All", ...Array.from(depts).filter(Boolean)];
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "All" || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const totalSolvedAll = students.reduce((sum, s) => sum + (s.totalSolved || 0), 0);
  const avgScore = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.score || 0), 0) / students.length)
    : 0;
  const topScorer = students.length > 0 ? students[0] : null;
  const linkedCount = students.filter(
    s => s.leetcodeUsername || s.codechefUsername || s.gfgUsername || s.hackerrankUsername
  ).length;

  const getRankIcon = (index) => {
    if (index === 0) return <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 22 }} />;
    if (index === 1) return <EmojiEventsIcon sx={{ color: "#c0c0c0", fontSize: 22 }} />;
    if (index === 2) return <EmojiEventsIcon sx={{ color: "#cd7f32", fontSize: 22 }} />;
    return <Typography variant="body2" fontWeight="bold" color="textSecondary" sx={{ ml: 0.5 }}>{index + 1}</Typography>;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: "#1a237e", width: 48, height: 48 }}>
          <CodeIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1a237e">
            Coding Analytics
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Track and compare student coding performance across all platforms
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<PeopleIcon />}
            title="Total Students"
            value={students.length}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CodeIcon />}
            title="Total Problems Solved"
            value={totalSolvedAll.toLocaleString()}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<TrendingUpIcon />}
            title="Average Score"
            value={avgScore}
            color="#e65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<StarIcon />}
            title="Profiles Linked"
            value={`${linkedCount}/${students.length}`}
            color="#6a1b9a"
          />
        </Grid>
      </Grid>

      {/* Top Performer Banner */}
      {topScorer && topScorer.score > 0 && (
        <Card sx={{
          mb: 4, borderRadius: 3, boxShadow: 4,
          background: "linear-gradient(135deg, #f57f17 0%, #ff8f00 100%)",
          color: "white", cursor: "pointer",
          transition: "transform 0.2s",
          "&:hover": { transform: "translateY(-2px)" }
        }}
          onClick={() => navigate(`${basePath}/${topScorer.rollNumber}`)}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, py: 2.5 }}>
            <EmojiEventsIcon sx={{ fontSize: 48, color: "#ffd700" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.85, textTransform: "uppercase", letterSpacing: 1 }}>
                Top Performer
              </Typography>
              <Typography variant="h5" fontWeight="bold">{topScorer.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {topScorer.rollNumber} &nbsp;·&nbsp; {topScorer.department} &nbsp;·&nbsp; Score: {topScorer.score} &nbsp;·&nbsp; Solved: {topScorer.totalSolved}
              </Typography>
            </Box>
            <Chip
              label="View Analytics →"
              sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "white", fontWeight: "bold", cursor: "pointer" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, background: "rgba(255,255,255,0.95)" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" color="textSecondary" fontWeight="bold">
              Student Leaderboard
              <Chip label={`${filteredStudents.length} students`} size="small" sx={{ ml: 1 }} />
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDept}
                  label="Department"
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  {getUniqueDepartments().map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
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
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Platforms</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Solved</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Score</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Level</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, index) => {
                const level = getCodingLevel(s.totalSolved || 0);
                const levelStyle = LEVEL_COLORS[level];
                const platformCount = [s.leetcodeUsername, s.codechefUsername, s.geeksforgeeksUsername, s.hackerrankUsername].filter(Boolean).length;

                return (
                  <TableRow
                    key={s._id}
                    hover
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                      "&:hover": { bgcolor: "#e3f2fd" },
                      "&:last-child td, &:last-child th": { border: 0 },
                      ...(index < 3 ? { bgcolor: index === 0 ? "#fffde7" : index === 1 ? "#fafafa" : "#fff8f0" } : {})
                    }}
                    onClick={() => navigate(`${basePath}/${s.rollNumber}`)}
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
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
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
                          bgcolor: levelStyle.bg,
                          color: levelStyle.color,
                          fontWeight: "bold",
                          fontSize: "0.7rem"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Tooltip title="View Full Analytics">
                        <OpenInNewIcon sx={{ color: "#1565c0", fontSize: 20, cursor: "pointer" }} />
                      </Tooltip>
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

      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
        Click any row to view detailed coding analytics for that student
      </Typography>
    </Box>
  );
};

export default CodingAnalytics;
