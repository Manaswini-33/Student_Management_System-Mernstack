const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
require("dotenv").config();

async function repairDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--- REPAIRING DATABASE ---");

        // 1. Ensure Admin is correct
        // In the user's DB, admin email was "admin". We should probably keep it consistent with seedAll or handle it.
        // Let's set it to "admin@system.com" for consistency, but also allow login via "admin" keyword.
        const adminEmail = "admin@system.com";
        const adminPass = "admin123";
        const hashedAdminPass = await bcrypt.hash(adminPass, 10);

        await User.findOneAndUpdate(
            { role: "admin" },
            { 
                name: "System Admin", 
                email: adminEmail, 
                password: hashedAdminPass,
                role: "admin" 
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Admin updated: ${adminEmail} (Pwd: ${adminPass})`);

        // 2. Add Test Student
        const studentEmail = "student@test.com";
        const studentPass = "student123";
        const hashedStudentPass = await bcrypt.hash(studentPass, 10);

        await Student.findOneAndUpdate(
            { rollNumber: "S1001" },
            {
                name: "John Doe",
                rollNumber: "S1001",
                department: "CSE",
                section: "A",
                year: "3",
                email: studentEmail,
                password: studentPass // raw as per existing pattern
            },
            { upsert: true }
        );

        await User.findOneAndUpdate(
            { email: studentEmail },
            {
                name: "John Doe",
                email: studentEmail,
                password: hashedStudentPass,
                role: "student",
                department: "CSE"
            },
            { upsert: true }
        );
        console.log(`✅ Student S1001 created/updated (Pwd: ${studentPass})`);

        // 3. Add Test Faculty
        const facultyEmail = "faculty@test.com";
        const facultyPass = "faculty123";
        const hashedFacultyPass = await bcrypt.hash(facultyPass, 10);

        await Faculty.findOneAndUpdate(
            { rollNumber: "F1001" },
            {
                name: "Dr. Smith",
                rollNumber: "F1001",
                department: "CSE",
                email: facultyEmail,
                password: facultyPass // raw as per existing pattern
            },
            { upsert: true }
        );

        await User.findOneAndUpdate(
            { email: facultyEmail },
            {
                name: "Dr. Smith",
                email: facultyEmail,
                password: hashedFacultyPass,
                role: "faculty",
                department: "CSE"
            },
            { upsert: true }
        );
        console.log(`✅ Faculty F1001 created/updated (Pwd: ${facultyPass})`);

        console.log("--- REPAIR COMPLETE ---");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Repair failed:", err);
    }
}

repairDB();
