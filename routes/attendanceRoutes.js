const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ================= FACULTY MARK ATTENDANCE =================

// Get existing attendance for a slot+date (for faculty edit mode)
router.get("/existing", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
    try {
        const { date, timetableSlotId } = req.query;
        if (!date || !timetableSlotId) {
            return res.status(400).json({ error: "date and timetableSlotId required" });
        }
        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));
        const records = await Attendance.find({
            timetableSlotId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate("student", "email");

        const result = {};
        for (const r of records) {
            const studentDoc = await Student.findOne({ email: r.student?.email });
            if (studentDoc) result[studentDoc._id.toString()] = r.status;
        }
        res.json(result);
    } catch (err) {
        console.error("Error fetching existing attendance", err);
        res.status(500).json({ error: "Failed to fetch existing attendance" });
    }
});

// Get students dynamically
router.get("/students", async (req, res) => {
    try {
        const department = req.query.department;
        const targetClass = req.query.targetClass;

        let filter = {};
        if (department) {
            filter.department = department;
        }
        if (targetClass) {
            // targetClass maps exactly to the student's section attribute (e.g., 'AIML-1')
            filter.section = targetClass;
        }

        const students = await Student.find(filter).sort({ rollNumber: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// Mark / Edit attendance
router.post("/mark-attendance", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
    try {
        const { records } = req.body; // Array of { student, timetableSlotId, targetClass, subject, date, status }

        const facultyId = req.user.id;

        let processedCount = 0;

        for (let record of records) {
            // Map Student ID to User ID (Attendance.student references User)
            const studentDoc = await Student.findById(record.student);
            if (!studentDoc || !studentDoc.email) continue;
            const userDoc = await User.findOne({ email: studentDoc.email });
            if (!userDoc) continue;
            const userId = userDoc._id;

            // Find if an attendance record already exists for this exact slot, date, and student
            let existingRecord = await Attendance.findOne({
                student: userId,
                timetableSlotId: record.timetableSlotId,
                date: {
                    $gte: new Date(new Date(record.date).setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date(record.date).setHours(23, 59, 59, 999))
                }
            });

            if (existingRecord) {
                // Update existing record (edit allowed anytime for wrongly posted attendance)
                existingRecord.status = record.status;
                await existingRecord.save();
                processedCount++;
            } else {
                // Create new - use User ID for student
                await Attendance.create({
                    student: userId,
                    timetableSlotId: record.timetableSlotId,
                    targetClass: record.targetClass,
                    subject: record.subject,
                    date: record.date,
                    status: record.status,
                    faculty: facultyId
                });
                processedCount++;
            }
        }

        res.json({ message: `Attendance saved successfully. ${processedCount} record(s) processed.` });
    } catch (err) {
        console.error("Error saving attendance", err);
        res.status(500).json({ error: "Server error saving attendance" });
    }
});


// ================= STUDENT VIEW OWN =================

router.get("/my",
    authMiddleware,
    async (req, res) => {

        const records = await Attendance.find({
            student: req.user.id
        })
            .populate("faculty", "name")
            .populate("timetableSlotId", "timeSlotIndex subject")
            .sort({ date: -1 });

        res.json(records);
    });


// ================= ADMIN ANALYTICS =================

router.get("/all",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        // We populate student to get their department to calculate department-wise attendance correctly
        const all = await Attendance.find().populate("student", "department");
        res.json(all);
    });

router.get("/daily-summary",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const todaysRecords = await Attendance.find({
                date: { $gte: todayStart, $lte: todayEnd }
            });

            const totalCount = todaysRecords.length;
            const presentCount = todaysRecords.filter(r => r.status === "Present").length;
            const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : 0;

            res.json({
                total: totalCount,
                present: presentCount,
                percentage: percentage
            });
        } catch (err) {
            console.error("Error fetching daily attendance summary", err);
            res.status(500).json({ error: "Server error" });
        }
    });
router.get("/trend", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const records = await Attendance.find({
            date: { $gte: sixtyDaysAgo }
        }).sort({ date: 1 });

        const trend = {};
        records.forEach(r => {
            const d = new Date(r.date);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!trend[dateStr]) trend[dateStr] = { date: dateStr, present: 0, total: 0, rawDate: d };
            trend[dateStr].total++;
            if (r.status === "Present") trend[dateStr].present++;
        });

        const data = Object.values(trend)
            .sort((a, b) => a.rawDate - b.rawDate)
            .map(d => ({
                date: d.date,
                percentage: parseFloat(((d.present / d.total) * 100).toFixed(1))
            }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;