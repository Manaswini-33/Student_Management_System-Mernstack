import React, { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Card, CardContent, CircularProgress, Alert,
    Button, Select, MenuItem, FormControl
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import API from "../../services/api";

const FacultyTimetable = () => {
    const [scheduleData, setScheduleData] = useState({}); // { "Monday": { 0: { section: "AIML-1", subject: "DS" } } }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [facultyId, setFacultyId] = useState(null);

    // Weekly slots
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
        fetchTimetable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTimetable = async () => {
        try {
            const profileRes = await API.get("/profile/me");
            const fId = profileRes.data._id;
            setFacultyId(fId);

            const timetableRes = await API.get(`/timetable/${fId}`);
            const data = timetableRes.data;

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
            setLoading(false);
        } catch (err) {
            console.error("Failed to load timetable", err);
            setError("Failed to load timetable. Please ensure you are logged in as Faculty.");
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ flexGrow: 1, typography: 'body1' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="#1a237e">
                    Weekly Timetable (View Only)
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card sx={{ borderRadius: 2, boxShadow: 4, background: "rgba(255,255,255,0.95)" }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                        <Table aria-label="faculty timetable">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#1565c0" }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)', width: '120px', textAlign: 'center' }}>
                                        Day / Time
                                    </TableCell>
                                    {timeSlots.map((slot) => (
                                        <TableCell key={slot.index} sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
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
                                            const isLeisure = !currentDisplay || (!currentDisplay.section && !currentDisplay.subject);

                                            return (
                                                <TableCell
                                                    key={`${day}-${slot.index}`}
                                                    sx={{
                                                        textAlign: 'center',
                                                        borderRight: '1px solid #ddd',
                                                        backgroundColor: isLeisure ? 'transparent' : '#e8f5e9',
                                                        minWidth: '150px'
                                                    }}
                                                >
                                                    <Box sx={{ whiteSpace: 'pre-line' }}>
                                                        {isLeisure ? (
                                                            <Typography color="textSecondary" variant="body2">Leisure</Typography>
                                                        ) : (
                                                            <>
                                                                <Typography variant="body1" fontWeight="bold" color="#1b5e20">{currentDisplay.section}</Typography>
                                                                <Typography variant="caption" color="textSecondary">({currentDisplay.subject})</Typography>
                                                            </>
                                                        )}
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
        </Box>
    );
};

export default FacultyTimetable;