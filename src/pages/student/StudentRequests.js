import React, { useEffect, useState } from "react";
import API from "../../services/api";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, CircularProgress, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";

function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({ field: "name", value: "" });
  const [requestMsg, setRequestMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/profile/my-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/profile/submit", {
        requestedData: { [requestData.field]: requestData.value },
        proofDocument: "Offline Proof Submitted"
      });
      setRequestMsg({ type: "success", text: res.data.message });
      setTimeout(() => {
        setOpenRequestDialog(false);
        setRequestMsg({ type: "", text: "" });
        setRequestData({ field: "name", value: "" });
        fetchRequests();
      }, 2000);
    } catch (err) {
      setRequestMsg({ type: "error", text: err.response?.data?.error || "Failed to submit request" });
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" color="white">
          My Profile Update Requests
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => setOpenRequestDialog(true)}>
          New Request
        </Button>
      </Box>

      <Paper sx={paperStyle}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: "center", color: "white" }}>
            You haven't submitted any update requests.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Requested Changes</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell sx={{ color: "white" }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {Object.entries(req.requestedData || {}).map(([key, val]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {val}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell sx={{ 
                    color: req.status === "Approved" ? "lightgreen" : 
                           req.status === "Rejected" ? "salmon" : "orange",
                    fontWeight: "bold" 
                  }}>
                    {req.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Profile Update Request Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1a237e' }}>Request Profile Edit</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Select the field you want to update. Note: You must provide valid proof offline to the admin.
          </Typography>
          {requestMsg.text && <Alert severity={requestMsg.type} sx={{ mb: 2 }}>{requestMsg.text}</Alert>}
          <form id="profile-request-form" onSubmit={handleSubmitRequest}>
            <TextField
              select
              fullWidth
              label="Field to Update"
              value={requestData.field}
              onChange={(e) => setRequestData({ ...requestData, field: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ mb: 2, mt: 1 }}
            >
              <option value="name">Name</option>
              <option value="phoneNumber">Phone Number</option>
              <option value="section">Section</option>
              <option value="year">Year</option>
            </TextField>
            <TextField
              fullWidth
              label="New Value"
              variant="outlined"
              required
              value={requestData.value}
              onChange={(e) => setRequestData({ ...requestData, value: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRequestDialog(false)} color="inherit">Cancel</Button>
          <Button type="submit" form="profile-request-form" variant="contained" color="secondary">Submit Request</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const paperStyle = {
  p: 3,
  borderRadius: 3,
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255,255,255,0.2)",
};

export default StudentRequests;
