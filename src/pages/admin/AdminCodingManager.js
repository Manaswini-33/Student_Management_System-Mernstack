import React, { useState, useEffect } from "react";
import {
    Box, Typography, TextField, Button, Card, CardContent, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Alert, IconButton, Tooltip
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import API from "../../services/api";

const AdminCodingManager = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [savingId, setSavingId] = useState(null);

    const fetchStudents = async () => {
        try {
            const res = await API.get("/students");
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            setMsg({ type: "error", text: "Failed to fetch student list." });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []); // fetchStudents is stable as it only uses state setters and external API

    const handleUsernameChange = (rollNumber, platform, value) => {
        setStudents(prev => prev.map(s => {
            if (s.rollNumber === rollNumber) {
                return { ...s, [`${platform}Username`]: value };
            }
            return s;
        }));
    };

    const handleSave = async (student) => {
        setSavingId(student.rollNumber);
        try {
            await API.post("/coding/update-usernames", {
                rollNumber: student.rollNumber,
                leetcode: student.leetcodeUsername,
                codechef: student.codechefUsername,
                gfg: student.geeksforgeeksUsername,
                hackerrank: student.hackerrankUsername
            });
            setMsg({ type: "success", text: `Usernames updated for ${student.name}` });
            setTimeout(() => setMsg({ type: "", text: "" }), 3000);
        } catch (err) {
            setMsg({ type: "error", text: "Failed to save usernames." });
        } finally {
            setSavingId(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="#1a237e" sx={{ mb: 3 }}>
                Coding Platform Management
            </Typography>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Search Student by Name or Roll Number"
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStudents} fullWidth sx={{ height: '56px' }}>
                                Refresh List
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#1565c0" }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Info</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>LeetCode</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>HackerRank</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CodeChef</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>GFG</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.rollNumber} hover>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="bold">{student.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">{student.rollNumber} | {student.department}</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        placeholder="Username"
                                        value={student.leetcodeUsername || ""}
                                        onChange={(e) => handleUsernameChange(student.rollNumber, "leetcode", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        placeholder="Username"
                                        value={student.hackerrankUsername || ""}
                                        onChange={(e) => handleUsernameChange(student.rollNumber, "hackerrank", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        placeholder="Username"
                                        value={student.codechefUsername || ""}
                                        onChange={(e) => handleUsernameChange(student.rollNumber, "codechef", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        placeholder="Username"
                                        value={student.geeksforgeeksUsername || ""}
                                        onChange={(e) => handleUsernameChange(student.rollNumber, "geeksforgeeks", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell textAlign="center">
                                    <Tooltip title="Save Usernames">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleSave(student)}
                                            disabled={savingId === student.rollNumber}
                                        >
                                            {savingId === student.rollNumber ? <CircularProgress size={24} /> : <SaveIcon />}
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminCodingManager;
