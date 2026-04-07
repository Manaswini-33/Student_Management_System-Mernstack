import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useEffect, useState } from "react";
import API from "../../services/api";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/profile/pending");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await API.put(`/profile/${action}/${id}`);
      setSnackbar({ open: true, message: res.data.message, severity: "success" });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Action failed", severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" color="white" mb={3}>
        Profile Update Requests
      </Typography>

      <Paper sx={paperStyle}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: "center", color: "white" }}>
            No pending requests.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Requested Changes</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Proof (Offline)</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell sx={{ color: "white" }}>
                    {req.user?.name} ({req.user?.email})
                  </TableCell>
                  <TableCell sx={{ color: "white", textTransform: "capitalize" }}>{req.user?.role}</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {Object.entries(req.requestedData || {}).map(([key, val]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {val}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>{req.proofDocument || "Manual Entry"}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() => handleAction(req._id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleAction(req._id, "reject")}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

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

export default Requests;