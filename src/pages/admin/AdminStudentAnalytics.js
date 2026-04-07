import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Chip,
  CircularProgress, Divider, LinearProgress, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Alert, Tooltip
} from "@mui/material";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";

const PLATFORM_COLORS = {
  LeetCode: "#FFA116",
  CodeChef: "#5B4638",
  GeeksForGeeks: "#2F8D46",
  HackerRank: "#00EA64",
};

const DIFFICULTY_COLORS = ["#4caf50", "#ff9800", "#f44336"];

const LEVEL_CONFIG = {
  Beginner: { color: "#78909c", bg: "#eceff1", icon: "🌱" },
  Intermediate: { color: "#1565c0", bg: "#e3f2fd", icon: "⚡" },
  Advanced: { color: "#6a1b9a", bg: "#f3e5f5", icon: "🔥" },
  Expert: { color: "#b71c1c", bg: "#ffebee", icon: "🏆" },
};

const ScoreCard = ({ title, value, subtitle, color, icon }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%", borderTop: `4px solid ${color}` }}>
    <CardContent sx={{ textAlign: "center", py: 3 }}>
      <Box sx={{ fontSize: 36, mb: 1 }}>{icon}</Box>
      <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="bold" sx={{ color, my: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary">{subtitle}</Typography>
      )}
    </CardContent>
  </Card>
);

const PlatformCard = ({ platform, data }) => {
  const color = PLATFORM_COLORS[platform] || "#1565c0";
  const isLinked = data.status === "Linked";

  return (
    <Card sx={{
      borderRadius: 3, boxShadow: 3, height: "100%",
      border: `2px solid ${isLinked ? color : "#e0e0e0"}`,
      opacity: isLinked ? 1 : 0.6,
      transition: "transform 0.2s",
      "&:hover": { transform: isLinked ? "translateY(-4px)" : "none" }
    }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>
            {platform}
          </Typography>
          <Chip
            label={isLinked ? "Linked" : "Not Linked"}
            size="small"
            color={isLinked ? "success" : "default"}
            variant={isLinked ? "filled" : "outlined"}
          />
        </Box>

        {isLinked ? (
          <>
            {data.username && (
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 1 }}>
                @{data.username}
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Problems Solved</Typography>
              <Typography variant="body2" fontWeight="bold">
                {platform === "HackerRank" ? `${data.problemsSolved} Badges` : data.problemsSolved}
              </Typography>
            </Box>

            {(platform === "LeetCode" || platform === "GeeksForGeeks") && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#4caf50" }}>Easy</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "#4caf50" }}>{data.easySolved}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#ff9800" }}>Medium</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "#ff9800" }}>{data.mediumSolved}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" sx={{ color: "#f44336" }}>Hard</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: "#f44336" }}>{data.hardSolved}</Typography>
                </Box>
              </>
            )}

            {data.rating > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Rating</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color }}>{data.rating}</Typography>
              </Box>
            )}

            {data.contestsAttended > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">Contests</Typography>
                <Typography variant="body2" fontWeight="bold">{data.contestsAttended}</Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: "center" }}>
            Username not configured
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const AdminStudentAnalytics = ({ basePath = "/admin/coding-analytics", hideManage = false }) => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await API.get(`/coding/analytics/${rollNumber}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [rollNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 3 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary">Fetching live coding stats...</Typography>
        <Typography variant="caption" color="textSecondary">Connecting to LeetCode, CodeChef, GFG, HackerRank...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(basePath)} sx={{ mb: 2 }}>
          Back to Leaderboard
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  const levelConfig = LEVEL_CONFIG[data.codingLevel] || LEVEL_CONFIG.Beginner;

  const difficultyData = [
    { name: "Easy", value: data.difficultyDistribution?.easy || 0, color: "#4caf50" },
    { name: "Medium", value: data.difficultyDistribution?.medium || 0, color: "#ff9800" },
    { name: "Hard", value: data.difficultyDistribution?.hard || 0, color: "#f44336" },
  ].filter(d => d.value > 0);

  const platformPieData = (data.platforms || [])
    .filter(p => p.status === "Linked" && p.problemsSolved > 0)
    .map(p => ({
      name: p.platform,
      value: p.problemsSolved,
      color: PLATFORM_COLORS[p.platform] || "#1565c0"
    }));

  const platformBarData = (data.platforms || []).map(p => ({
    platform: p.platform,
    Solved: p.problemsSolved || 0,
    Rating: p.rating || 0,
    Contests: p.contestsAttended || 0,
  }));

  const radarData = [
    { subject: "LeetCode", value: 0 },
    { subject: "CodeChef", value: 0 },
    { subject: "GFG", value: 0 },
    { subject: "HackerRank", value: 0 },
    { subject: "Contests", value: 0 },
    { subject: "Attendance", value: 0 },
  ];
  (data.platforms || []).forEach(p => {
    if (p.platform === "LeetCode") radarData[0].value = Math.min(100, (p.problemsSolved / 5));
    if (p.platform === "CodeChef") radarData[1].value = Math.min(100, (p.problemsSolved / 3));
    if (p.platform === "GeeksForGeeks") radarData[2].value = Math.min(100, (p.problemsSolved / 3));
    if (p.platform === "HackerRank") radarData[3].value = Math.min(100, p.problemsSolved * 10);
  });
  radarData[4].value = Math.min(100, (data.totalContests || 0) * 5);
  radarData[5].value = parseFloat(data.attendance?.percentage || 0);

  const scoringBreakdown = (data.platforms || [])
    .filter(p => p.status === "Linked")
    .map(p => {
      let pts = 0;
      let breakdown = "";
      if (p.platform === "LeetCode" || p.platform === "GeeksForGeeks") {
        pts = (p.easySolved * 1) + (p.mediumSolved * 3) + (p.hardSolved * 5);
        breakdown = `${p.easySolved}×1 + ${p.mediumSolved}×3 + ${p.hardSolved}×5`;
      } else if (p.platform === "CodeChef") {
        pts = p.problemsSolved;
        breakdown = `${p.problemsSolved}×1`;
      } else if (p.platform === "HackerRank") {
        pts = p.problemsSolved * 10;
        breakdown = `${p.problemsSolved} badges × 10`;
      }
      return { platform: p.platform, points: pts, breakdown };
    });

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(basePath)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Back to Leaderboard
        </Button>
        <Button
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          {refreshing ? "Refreshing..." : "Refresh Live Stats"}
        </Button>
      </Box>

      {/* Student Profile Banner */}
      <Card sx={{
        mb: 4, borderRadius: 3, boxShadow: 6,
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
        color: "white"
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{
                width: 80, height: 80, bgcolor: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.5)", fontSize: 32, fontWeight: "bold"
              }}>
                {data.studentName?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold">{data.studentName}</Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                <Chip label={`ID: ${data.rollNumber}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label={data.department} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label={`Year ${data.year}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label={data.email} size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }} />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{
                textAlign: "center", bgcolor: "rgba(255,255,255,0.15)",
                borderRadius: 3, p: 2, backdropFilter: "blur(10px)"
              }}>
                <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>CODING LEVEL</Typography>
                <Typography variant="h5" fontWeight="bold">{levelConfig.icon} {data.codingLevel}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Score Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ScoreCard
            title="Overall Score"
            value={data.overallScore}
            subtitle="Weighted across all platforms"
            color="#1a237e"
            icon="🏆"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ScoreCard
            title="Problems Solved"
            value={data.totalProblems}
            subtitle="Across all platforms"
            color="#2e7d32"
            icon="✅"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ScoreCard
            title="Contests"
            value={data.totalContests}
            subtitle="Competitive programming"
            color="#e65100"
            icon="⚔️"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ScoreCard
            title="Avg Rating"
            value={data.averageRating || "N/A"}
            subtitle="Across linked platforms"
            color="#6a1b9a"
            icon="⭐"
          />
        </Grid>
      </Grid>

      {/* Platform Cards */}
      <Typography variant="h5" fontWeight="bold" color="#1a237e" sx={{ mb: 2 }}>
        <CodeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        Platform-wise Breakdown
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(data.platforms || []).map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.platform}>
            <PlatformCard platform={p.platform} data={p} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Difficulty Distribution Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Difficulty Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {difficultyData.length > 0 ? (
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <Typography color="textSecondary">No difficulty data available</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
                {DIFFICULTY_COLORS.map((c, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c }} />
                    <Typography variant="caption">{["Easy", "Medium", "Hard"][i]}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Distribution Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Platform Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {platformPieData.length > 0 ? (
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={platformPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {platformPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <Typography color="textSecondary">No platform data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Skill Radar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Skill Radar
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#1a237e"
                      fill="#1a237e"
                      fillOpacity={0.4}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Problems Solved Bar Chart */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Platform Comparison — Problems Solved
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={platformBarData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Solved" fill="#1565c0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Contests" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Score Breakdown + Attendance Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Score Breakdown */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <EmojiEventsIcon sx={{ verticalAlign: "middle", mr: 1, color: "#ffd700" }} />
                Score Calculation Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Platform</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Formula</TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scoringBreakdown.map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: "bold", color: PLATFORM_COLORS[row.platform] || "#1565c0" }}>
                          {row.platform}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{row.breakdown}</TableCell>
                        <TableCell sx={{ fontWeight: "bold", textAlign: "right", color: "#2e7d32" }}>{row.points}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "#e8f5e9" }}>
                      <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        Total Score
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right", fontSize: "1.2rem", color: "#1a237e" }}>
                        {data.overallScore}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  <strong>Scoring Rules:</strong> LeetCode/GFG: Easy=1pt, Medium=3pts, Hard=5pts &nbsp;|&nbsp;
                  CodeChef: 1pt per problem &nbsp;|&nbsp; HackerRank: 10pts per badge
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <SchoolIcon sx={{ verticalAlign: "middle", mr: 1, color: "#1565c0" }} />
                Attendance Overview
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={parseFloat(data.attendance?.percentage || 0)}
                    size={120}
                    thickness={6}
                    sx={{
                      color: parseFloat(data.attendance?.percentage || 0) >= 75 ? "#4caf50" : "#f44336"
                    }}
                  />
                  <Box sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: "absolute", display: "flex",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <Typography variant="h5" fontWeight="bold">
                      {data.attendance?.percentage || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "#e8f5e9", borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                      {data.attendance?.present || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">Classes Present</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "#f3f4f6", borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="#555">
                      {data.attendance?.total || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">Total Classes</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(data.attendance?.percentage || 0)}
                  sx={{
                    height: 10, borderRadius: 5,
                    bgcolor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: parseFloat(data.attendance?.percentage || 0) >= 75 ? "#4caf50" : "#f44336",
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: "block" }}>
                  {parseFloat(data.attendance?.percentage || 0) >= 75
                    ? "✅ Attendance is satisfactory (≥75%)"
                    : "⚠️ Attendance is below 75% threshold"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Usernames */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            <TrendingUpIcon sx={{ verticalAlign: "middle", mr: 1, color: "#1565c0" }} />
            Linked Platform Usernames
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {(data.platforms || []).map(p => (
              <Grid item xs={12} sm={6} md={3} key={p.platform}>
                <Box sx={{
                  p: 2, borderRadius: 2,
                  border: `1px solid ${p.status === "Linked" ? PLATFORM_COLORS[p.platform] || "#1565c0" : "#e0e0e0"}`,
                  bgcolor: p.status === "Linked" ? "#fafafa" : "#f5f5f5"
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: PLATFORM_COLORS[p.platform] || "#555" }}>
                    {p.platform}
                  </Typography>
                  {p.username ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: "#4caf50" }} />
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>@{p.username}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>Not configured</Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          {!hideManage && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/admin/manage-coding")}
                sx={{ borderRadius: 2 }}
              >
                Manage Usernames
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminStudentAnalytics;
