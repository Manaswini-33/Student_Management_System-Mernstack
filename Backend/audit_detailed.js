const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
require("dotenv").config();

async function runAudit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--- STARTING DETAILED AUDIT ---\n");

        const allUsers = await User.find({});
        const allStudents = await Student.find({});
        const allFaculty = await Faculty.find({});

        console.log(`Summary: ${allUsers.length} Users, ${allStudents.length} Students, ${allFaculty.length} Faculty.\n`);

        const issues = [];

        // 1. Password Hash Check
        for (const user of allUsers) {
            const isHash = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
            if (!isHash) {
                issues.push({ type: "INVALID_HASH", email: user.email, role: user.role, detail: "Password is not a bcrypt hash" });
            }
        }

        // 2. Email Consistency Check (User <-> Student/Faculty)
        for (const user of allUsers) {
            if (user.role === 'student') {
                const s = await Student.findOne({ email: user.email });
                if (!s) {
                    // Try case-insensitive search to see if it's a case mismatch
                    const s_ci = await Student.findOne({ email: { $regex: new RegExp(`^${user.email}$`, "i") } });
                    if (s_ci) {
                        issues.push({ type: "EMAIL_CASE_MISMATCH", userEmail: user.email, studentEmail: s_ci.email, role: "student" });
                    } else {
                        issues.push({ type: "ORPHAN_USER", email: user.email, role: "student", detail: "No Student record found for this User email" });
                    }
                }
            } else if (user.role === 'faculty') {
                const f = await Faculty.findOne({ email: user.email });
                if (!f) {
                    const f_ci = await Faculty.findOne({ email: { $regex: new RegExp(`^${user.email}$`, "i") } });
                    if (f_ci) {
                        issues.push({ type: "EMAIL_CASE_MISMATCH", userEmail: user.email, facultyEmail: f_ci.email, role: "faculty" });
                    } else {
                        issues.push({ type: "ORPHAN_USER", email: user.email, role: "faculty", detail: "No Faculty record found for this User email" });
                    }
                }
            }
        }

        // 3. Reverse Check: Students/Faculty who don't have a User record
        for (const s of allStudents) {
            const u = await User.findOne({ email: s.email });
            if (!u) {
                issues.push({ type: "MISSING_USER", email: s.email, role: "student", rollNumber: s.rollNumber });
            }
        }
        for (const f of allFaculty) {
            const u = await User.findOne({ email: f.email });
            if (!u) {
                issues.push({ type: "MISSING_USER", email: f.email, role: "faculty", rollNumber: f.rollNumber });
            }
        }

        // 4. Admin Check
        const admins = allUsers.filter(u => u.role === 'admin');
        if (admins.length === 0) {
            issues.push({ type: "NO_ADMIN", detail: "No user with 'admin' role found" });
        } else {
            console.log(`Found ${admins.length} admins.`);
        }

        // Output Results
        if (issues.length === 0) {
            console.log("✅ No issues found! Project data looks consistent.");
        } else {
            console.log(`❌ Found ${issues.length} issues:\n`);
            issues.forEach((iss, idx) => {
                console.log(`${idx + 1}. [${iss.type}] ${JSON.stringify(iss)}`);
            });
        }

        console.log("\n--- AUDIT COMPLETE ---");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Audit failed:", err);
    }
}

runAudit();
