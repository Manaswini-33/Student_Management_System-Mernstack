const mongoose = require("mongoose");
const User = require("./models/User");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
require("dotenv").config();

async function auditDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log("\n--- USER AUDIT ---");
        for (const u of users) {
             console.log(`Email: ${u.email}, Role: ${u.role}, Pwd: ${u.password.substring(0, 10)}... (Len: ${u.password.length})`);
             if (u.role === 'student') {
                 const s = await Student.findOne({ email: u.email });
                 console.log(`  -> Student found: ${s ? s.rollNumber : 'NOT FOUND'}`);
             } else if (u.role === 'faculty') {
                 const f = await Faculty.findOne({ email: u.email });
                 console.log(`  -> Faculty found: ${f ? f.rollNumber : 'NOT FOUND'}`);
             }
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

auditDB();
