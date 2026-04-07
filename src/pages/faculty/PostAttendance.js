import React, { useEffect, useState } from "react";
import {
    Box, Typography, Card, CardContent, CircularProgress, Alert, Button, Grid,
    FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, RadioGroup, FormControlLabel, Radio, TextField
} from "@mui/material";
import API from "../../services/api";

const PostAttendance = () => {
    const [timetable, setTimetable] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedHour, setSelectedHour] = useState("");
    const [attendanceData, setAttendanceData] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AIML", "IT"];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedHour || students.length === 0) return;
        const dayName = getDayName(selectedDate);
        const slot = timetable
            .filter(t => t.day === dayName && t.targetClass === selectedSection)
            .find(t => t.timeSlotIndex === Number(selectedHour));
        if (!slot) return;
        const loadExisting = async () => {
            try {
                const res = await API.get(`/attendance/existing?date=${selectedDate}&timetableSlotId=${slot._id}`);
                const existing = res.data || {};
                setAttendanceData(prev => {
                    const next = {};
                    students.forEach(s => {
                        next[s._id] = existing[s._id] ?? prev[s._id] ?? "Present";
                    });
                    return next;
                });
            } catch (err) {
                console.error("Failed to load existing attendance", err);
            }
        };
        loadExisting();
    }, [selectedHour, selectedDate, selectedSection, students, timetable]);

    const fetchInitialData = async () => {
        try {
            const profileRes = await API.get("/profile/me");
            const facultyId = profileRes.data._id;
            const timetableRes = await API.get(`/timetable/${facultyId}`);
            setTimetable(timetableRes.data);

            // Auto-fill dept if profile has it
            if (profileRes.data.department) {
                setSelectedDept(profileRes.data.department);
            }

            setLoading(false);
        } catch (err) {
            console.error("Failed to load initial data", err);
            setMsg({ type: "error", text: "Failed to load timetable." });
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        if (field === "date") setSelectedDate(value);
        if (field === "dept") setSelectedDept(value);
        if (field === "section") setSelectedSection(value);
        if (field === "hour") {
            setSelectedHour(value);
            setMsg({ type: "", text: "" });
        }
        if (field !== "hour") {
            setStudents([]);
            setAttendanceData({});
            setMsg({ type: "", text: "" });
        }
    };

    const fetchStudents = async () => {
        if (!selectedDept || !selectedSection) {
            setMsg({ type: "warning", text: "Please select department and section." });
            return;
        }

        setLoading(true);
        try {
            const stuRes = await API.get(`/attendance/students?department=${selectedDept}&targetClass=${selectedSection}`);
            setStudents(stuRes.data);

            const initData = {};
            stuRes.data.forEach(s => {
                initData[s._id] = "Present";
            });
            setAttendanceData(initData);
            setSelectedHour("");
            setLoading(false);
        } catch (error) {
            setMsg({ type: "error", text: "Failed to fetch student list." });
            setLoading(false);
        }
    };

    const getDayName = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const TIME_SLOTS = [
        { time: "9:30 - 10:20", index: 0 },
        { time: "10:20 - 11:10", index: 1 },
        { time: "11:10 - 12:00", index: 2 },
        { time: "12:00 - 12:50", index: 3 },
        { time: "12:50 - 13:40", index: 4, isBreak: true, label: "LUNCH" },
        { time: "13:40 - 14:30", index: 5 },
        { time: "14:30 - 15:20", index: 6 },
        { time: "15:20 - 16:10", index: 7 }
    ];
    const dayName = getDayName(selectedDate);
    const todaysTimetable = timetable.filter(t => t.day === dayName);
    // Only show slots matching selected section (dept+section) so only relevant class hours appear
    const filteredTimetable = selectedSection ? todaysTimetable.filter(t => t.targetClass === selectedSection) : todaysTimetable;
    const availableHours = filteredTimetable.map(t => {
        const slotInfo = TIME_SLOTS.find(s => s.index === t.timeSlotIndex) || { time: `Hour ${t.timeSlotIndex}` };
        return {
            index: t.timeSlotIndex,
            label: slotInfo.isBreak ? slotInfo.label : `${slotInfo.time} - ${t.subject}`,
            section: t.targetClass,
            subject: t.subject,
            id: t._id
        };
    }).filter(h => !TIME_SLOTS.find(s => s.index === h.index)?.isBreak);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHour) {
            setMsg({ type: "error", text: "Please select a timetable slot." });
            return;
        }

        const slot = availableHours.find(h => h.index === Number(selectedHour));
        if (!slot) return;

        setSubmitLoading(true);
        const records = students.map(s => ({
            student: s._id,
            timetableSlotId: slot.id,
            targetClass: slot.section,
            subject: slot.subject,
            date: selectedDate,
            status: attendanceData[s._id]
        }));

        try {
            const res = await API.post("/attendance/mark-attendance", { records });
            setMsg({ type: "success", text: res.data.message });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.error || "Error posting attendance." });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading && timetable.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ width: "100%", typography: 'body1' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>Faculty Attendance Portal</Typography>
                <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: 'bold', bgcolor: '#e3f2fd', px: 2, py: 0.5, borderRadius: 2 }}>
                    Selected Day: {dayName}
                </Typography>
            </Box>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 3 }}>{msg.text}</Alert>}

            <Card sx={{ boxShadow: 3, mb: 4, borderRadius: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                value={selectedDate}
                                onChange={(e) => handleFilterChange("date", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Department</InputLabel>
                                <Select value={selectedDept} label="Department" onChange={(e) => handleFilterChange("dept", e.target.value)}>
                                    {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Section</InputLabel>
                                <Select value={selectedSection} label="Section" onChange={(e) => handleFilterChange("section", e.target.value)}>
                                    {["AIML-1", "AIML-2", "CSE-1", "CSE-2", "CSD", "IT-1", "IT-2"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button fullWidth variant="contained" size="large" sx={{ height: '56px' }} onClick={fetchStudents} disabled={loading}>
                                {loading ? "Fetching..." : "Display Students"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                    <CardContent>
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">Timetable Matching</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Select Scheduled Class Slot</InputLabel>
                                <Select
                                    value={selectedHour}
                                    label="Select Scheduled Class Slot"
                                    onChange={(e) => handleFilterChange("hour", e.target.value)}
                                >
                                    {availableHours.length > 0 ? availableHours.map(h => (
                                        <MenuItem key={h.index} value={h.index}>{h.label}</MenuItem>
                                    )) : <MenuItem value="" disabled>No matching classes found in your timetable for this day.</MenuItem>}
                                </Select>
                            </FormControl>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'textSecondary' }}>
                                * Only slots from your weekly timetable on {dayName} are shown.
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                                If attendance was already posted, it will load for editing. Change status and click &quot;Post Attendance&quot; to update.
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mb: 3 }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#1565c0" }}>
                                        <TableRow>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Roll No</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student Name</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((s, idx) => (
                                            <TableRow key={s._id} hover>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{idx + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{s.rollNumber}</TableCell>
                                                <TableCell>{s.name}</TableCell>
                                                <TableCell>
                                                    <RadioGroup row value={attendanceData[s._id]} onChange={(e) => setAttendanceData({ ...attendanceData, [s._id]: e.target.value })}>
                                                        <FormControlLabel value="Present" control={<Radio color="success" />} label="Present" />
                                                        <FormControlLabel value="Absent" control={<Radio color="error" />} label="Absent" />
                                                    </RadioGroup>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button type="submit" variant="contained" color="primary" size="large" disabled={submitLoading || !selectedHour}>
                                    {submitLoading ? "Saving..." : "Post / Update Attendance"}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PostAttendance;
