import React, { useState, useEffect } from "react";
import API from "../../services/api";
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: "", rollNumber: "", department: "", section: "", year: "",
    email: "", password: "", phoneNumber: "", leetcodeUsername: "",
    hackerrankUsername: "", codechefUsername: "",
    gfgUsername: "", totalSolved: 0
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/students/${editId}`, formData);
      } else {
        await API.post("/students", formData);
      }
      setEditId(null);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error("Error saving student:", err);
      alert(err.response?.data?.message || "Error saving student");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", rollNumber: "", department: "", section: "", year: "",
      email: "", password: "", phoneNumber: "", leetcodeUsername: "",
      hackerrankUsername: "", codechefUsername: "",
      gfgUsername: "", totalSolved: 0
    });
    setEditId(null);
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      department: student.department || "",
      section: student.section || "",
      year: student.year || "",
      phoneNumber: student.phoneNumber || "",
      email: student.email || "",
      password: "", // Hide password
      leetcodeUsername: student.leetcodeUsername || "",
      hackerrankUsername: student.hackerrankUsername || "",
      codechefUsername: student.codechefUsername || "",
      gfgUsername: student.gfgUsername || "",
      totalSolved: student.totalSolved || 0
    });
    setEditId(student._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for editing
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  return (
    <Box sx={{ width: "100%", typography: 'body1' }}>
      <Typography variant="h4" fontWeight="bold" color="#1a237e" sx={{ mb: 3 }}>
        Student Management
      </Typography>

      {/* Forms Section */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3, background: "rgba(255,255,255,0.95)" }}>
        <CardContent>
          <Typography variant="h6" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {editId ? <EditIcon /> : <PersonAddIcon />}
            {editId ? "Update Student Record" : "Add New Student"}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleAddOrUpdateStudent}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Section" name="section" value={formData.section} onChange={handleChange} variant="outlined" size="small" placeholder="e.g., AIML-1" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Year" name="year" value={formData.year} onChange={handleChange} variant="outlined" size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                {!editId && <TextField fullWidth type="password" label="Password (for login)" name="password" value={formData.password} onChange={handleChange} required variant="outlined" size="small" />}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Coding Platform Usernames (Optional)</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="LeetCode" name="leetcodeUsername" value={formData.leetcodeUsername} onChange={handleChange} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="HackerRank" name="hackerrankUsername" value={formData.hackerrankUsername} onChange={handleChange} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="CodeChef" name="codechefUsername" value={formData.codechefUsername} onChange={handleChange} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="GeeksForGeeks" name="gfgUsername" value={formData.gfgUsername} onChange={handleChange} variant="outlined" size="small" />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                {editId && (
                  <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={resetForm}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary" startIcon={editId ? <SaveIcon /> : <PersonAddIcon />}>
                  {editId ? "Save Changes" : "Add Student"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, background: "rgba(255,255,255,0.95)" }}>
        <Table aria-label="students table">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Roll No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dept</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sec</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? students.map((s) => (
              <TableRow key={s._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{s.name}</TableCell>
                <TableCell>{s.rollNumber}</TableCell>
                <TableCell>{s.department}</TableCell>
                <TableCell>{s.section}</TableCell>
                <TableCell>{s.phoneNumber || "N/A"}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Student">
                    <IconButton color="primary" onClick={() => handleEdit(s)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Student">
                    <IconButton color="error" onClick={() => handleDelete(s._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" padding="normal">
                  <Typography color="textSecondary">No students found. Add one above!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default StudentManagement;