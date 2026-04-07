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

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "", // Can serve as Employee ID
    department: "",
    email: "",
    phoneNumber: "",
    age: "",
    password: ""
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await API.get("/faculty");
      setFaculty(res.data);
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/faculty/${editId}`, formData);
      } else {
        await API.post("/faculty", formData);
      }
      setEditId(null);
      resetForm();
      fetchFaculty();
    } catch (err) {
      console.error("Error saving faculty:", err);
      alert(err.response?.data?.message || "Error saving faculty");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rollNumber: "",
      department: "",
      email: "",
      phoneNumber: "",
      age: "",
      password: ""
    });
    setEditId(null);
  };

  const handleEdit = (fac) => {
    setFormData({
      name: fac.name || "",
      rollNumber: fac.rollNumber || "",
      department: fac.department || "",
      email: fac.email || "",
      phoneNumber: fac.phoneNumber || "",
      age: fac.age || "",
      password: "" // Hide password securely on edit load
    });
    setEditId(fac._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await API.delete(`/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      console.error("Error deleting faculty:", err);
    }
  };

  return (
    <Box sx={{ width: "100%", typography: 'body1' }}>
      <Typography variant="h4" fontWeight="bold" color="#1a237e" sx={{ mb: 3 }}>
        Faculty Management
      </Typography>

      {/* Forms Section */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3, background: "rgba(255,255,255,0.95)" }}>
        <CardContent>
          <Typography variant="h6" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {editId ? <EditIcon /> : <PersonAddIcon />}
            {editId ? "Update Faculty Record" : "Add New Faculty"}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleAddOrUpdateFaculty}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Employee ID" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} required variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Age" type="number" name="age" value={formData.age} onChange={handleChange} variant="outlined" size="small" />
              </Grid>

              <Grid item xs={12} sm={6} md={9}>
                {!editId && <TextField fullWidth type="password" label="Password (for login)" name="password" value={formData.password} onChange={handleChange} required variant="outlined" size="small" />}
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                {editId && (
                  <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={resetForm}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary" startIcon={editId ? <SaveIcon /> : <PersonAddIcon />}>
                  {editId ? "Save Changes" : "Add Faculty"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" color="textSecondary">Faculty Directory</Typography>
        <Typography variant="subtitle1" fontWeight="bold">Total Faculty: {faculty.length}</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, background: "rgba(255,255,255,0.95)" }}>
        <Table aria-label="faculty table">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Emp ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dept</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculty.length > 0 ? faculty.map((f) => (
              <TableRow key={f._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{f.name}</TableCell>
                <TableCell>{f.rollNumber}</TableCell>
                <TableCell>{f.department}</TableCell>
                <TableCell>{f.phoneNumber || "N/A"}</TableCell>
                <TableCell>{f.age || "N/A"}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Faculty">
                    <IconButton color="primary" onClick={() => handleEdit(f)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Faculty">
                    <IconButton color="error" onClick={() => handleDelete(f._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" padding="normal">
                  <Typography color="textSecondary">No faculty members found. Add one above!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default FacultyManagement;