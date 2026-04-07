import React, { useState } from "react";
import axios from "axios";

function AddStudent() {
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    department: "",
    section: "",
    year: "",
    email: "",
    password: "",
    phoneNumber: "",
    leetcodeUsername: "",
    hackerrankUsername: "",
    codechefUsername: "",
    gfgUsername: "",
    totalSolved: 0
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/students", form);

    alert("Student Added Successfully");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="rollNumber" placeholder="Roll Number" onChange={handleChange} />
      <input name="department" placeholder="Department" onChange={handleChange} />
      <input name="section" placeholder="Section (e.g., AIML-1)" onChange={handleChange} />
      <input name="year" placeholder="Year" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" placeholder="Password" onChange={handleChange} />
      <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
      <input name="leetcodeUsername" placeholder="LeetCode Username" onChange={handleChange} />
      <input name="hackerrankUsername" placeholder="HackerRank Username" onChange={handleChange} />
      <input name="codechefUsername" placeholder="CodeChef Username" onChange={handleChange} />
      <input name="gfgUsername" placeholder="GeeksForGeeks Username" onChange={handleChange} />
      <input name="totalSolved" type="number" placeholder="Total Solved Problems" onChange={handleChange} />
      <button type="submit">Add Student</button>
    </form>
  );
}

export default AddStudent;