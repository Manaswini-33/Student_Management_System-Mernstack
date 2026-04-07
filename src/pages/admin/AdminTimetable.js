import React, { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Card, CardContent, CircularProgress, Alert,
    Button, Select, MenuItem, FormControl, Grid
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import API from "../../services/api";

const AdminTimetable = () => {
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");

    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
        { time: "09:30 AM - 10:20 AM", index: 0 },
        { time: "10:20 AM - 11:10 AM", index: 1 },
        { time: "11:10 AM - 12:00 PM", index: 2 },
        { time: "12:00 PM - 12:50 PM", index: 3 },
        { time: "12:50 PM - 01:40 PM", index: 4, isBreak: true, label: "LUNCH" },
        { time: "01:40 PM - 02:30 PM", index: 5 },
        { time: "02:30 PM - 03:20 PM", index: 6 },
        { time: "03:20 PM - 04:10 PM", index: 7 }
    ];

    const sections = ["AIML-1", "AIML-2", "CSE-1", "CSE-2", "CSD", "IT-1", "IT-2"];
    const subjects = ["Data Structures", "Operating Systems", "Computer Networks", "DBMS", "Java Programming", "Python", "Machine Learning"];

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const { data } = await API.get("/faculty");
            setFaculties(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load faculties.");
            setLoading(false);
        }
    };

    const fetchTimetable = async (fId) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const { data } = await API.get(`/timetable/${fId}`);
            const matrix = {};
            days.forEach(d => matrix[d] = {});

            data.forEach(slot => {
                if (matrix[slot.day]) {
                    matrix[slot.day][slot.timeSlotIndex] = {
                        section: slot.targetClass,
                        subject: slot.subject
                    };
                }
            });
            setScheduleData(matrix);
        } catch (err) {
            console.error(err);
            setError("Failed to load timetable for selected faculty.");
        } finally {
            setLoading(false);
        }
    };

    const handleFacultyChange = (e) => {
        const val = e.target.value;
        setSelectedFaculty(val);
        if (val) {
            fetchTimetable(val);
        } else {
            setScheduleData({});
        }
    };

    const handleCellChange = (day, slotIndex, field, value) => {
        const newData = { ...scheduleData };
        if (!newData[day][slotIndex]) {
            newData[day][slotIndex] = { section: "", subject: "" };
        }
        newData[day][slotIndex][field] = value;
        setScheduleData(newData);
    };

    const handleSave = async () => {
        if (!selectedFaculty) return;
        setSaveLoading(true);
        setError("");
        setSuccess("");
        try {
            const scheduleArray = [];
            Object.keys(scheduleData).forEach(day => {
                Object.keys(scheduleData[day]).forEach(slotIndex => {
                    const slot = scheduleData[day][slotIndex];
                    if (slot.section && slot.subject) {
                        scheduleArray.push({
                            day,
                            timeSlotIndex: parseInt(slotIndex),
                            targetClass: slot.section,
                            subject: slot.subject
                        });
                    }
                });
            });

            await API.post("/timetable/upsert", {
                facultyId: selectedFaculty,
                scheduleData: scheduleArray
            });

            setSuccess("Timetable saved successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to save changes.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading && !faculties.length) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ flexGrow: 1, typography: 'body1', px: { xs: 2, md: 4 }, pb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="#1a237e">
                    Master Timetable Management
                </Typography>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Select Faculty
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    value={selectedFaculty}
                                    onChange={handleFacultyChange}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select a Faculty Member</MenuItem>
                                    {faculties.map(f => (
                                        <MenuItem key={f._id} value={f._id}>{f.name} ({f.department})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saveLoading || !selectedFaculty}
                                sx={{ height: 50, px: 4, fontWeight: "bold" }}
                            >
                                {saveLoading ? "Saving..." : "Save Timetable"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {selectedFaculty && (
                <Card sx={{ borderRadius: 2, boxShadow: 4, background: "rgba(255,255,255,0.95)" }}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                            <Table aria-label="admin timetable mapping">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#1565c0" }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)', width: '120px', textAlign: 'center' }}>
                                            Day / Time
                                        </TableCell>
                                        {timeSlots.map((slot) => (
                                            <TableCell key={slot.index} sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: 150 }}>
                                                {slot.time}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {days.map((day) => (
                                        <TableRow key={day} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #ddd', backgroundColor: "#fafafa" }}>
                                                {day}
                                            </TableCell>

                                            {timeSlots.map((slot) => {
                                                if (slot.isBreak) {
                                                    return (
                                                        <TableCell key={`${day}-${slot.index}`} sx={{ fontWeight: '900', letterSpacing: 2, textAlign: 'center', color: '#1565c0', backgroundColor: "#e3f2fd", borderRight: '1px solid #ddd' }}>
                                                            {slot.label}
                                                        </TableCell>
                                                    );
                                                }

                                                const currentDisplay = scheduleData[day] ? scheduleData[day][slot.index] : null;

                                                return (
                                                    <TableCell
                                                        key={`${day}-${slot.index}`}
                                                        sx={{ textAlign: 'center', borderRight: '1px solid #ddd', minWidth: '150px' }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <FormControl size="small" fullWidth>
                                                                <Select
                                                                    value={currentDisplay?.section || ""}
                                                                    displayEmpty
                                                                    onChange={(e) => handleCellChange(day, slot.index, "section", e.target.value)}
                                                                >
                                                                    <MenuItem value=""><em>No class</em></MenuItem>
                                                                    {sections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                                                </Select>
                                                            </FormControl>
                                                            <FormControl size="small" fullWidth>
                                                                <Select
                                                                    value={currentDisplay?.subject || ""}
                                                                    displayEmpty
                                                                    onChange={(e) => handleCellChange(day, slot.index, "subject", e.target.value)}
                                                                >
                                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                                    {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default AdminTimetable;
