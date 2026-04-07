const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--- TESTING LOGIN LOGIC ---");

        // Try Admin login (as in authRoutes.js)
        const loginId = "admin";
        const password = "admin123";

        const user = await User.findOne({ role: "admin" });
        if (!user) {
            console.log("❌ Admin not found in User collection!");
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Admin Check: Email: ${user.email}, Password Match: ${isMatch}`);
            if (!isMatch) {
               console.log(`Stored hash: ${user.password}`);
               const freshHash = await bcrypt.hash("admin123", 10);
               console.log(`Fresh hash for "admin123": ${freshHash}`);
            }
        }

        // Try a student login (seeded S1001 / student123)
        const studentId = "S1001";
        const studentPass = "student123";
        const Student = require("./models/Student");
        const person = await Student.findOne({ rollNumber: { $regex: new RegExp(`^${studentId}$`, "i") } });
        if (person) {
            const u = await User.findOne({ email: person.email });
            if (u) {
                const match = await bcrypt.compare(studentPass, u.password);
                console.log(`Student Check (S1001): Email: ${u.email}, Password Match: ${match}`);
            } else {
                console.log("❌ Student User not found by email!");
            }
        } else {
            console.log("❌ Student S1001 not found!");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testLogin();
