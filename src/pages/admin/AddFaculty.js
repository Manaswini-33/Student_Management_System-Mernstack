import React, { useState } from "react";
import axios from "axios";

function AddFaculty() {
    const [form, setForm] = useState({
        name: "",
        rollNumber: "",
        department: "",
        email: "",
        password: "",
        phoneNumber: "",
        age: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("http://localhost:5000/api/faculty", form);
        alert("Faculty Added Successfully");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="rollNumber" placeholder="Employee ID" onChange={handleChange} />
            <input name="department" placeholder="Department" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="password" placeholder="Password" onChange={handleChange} />
            <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
            <input name="age" type="number" placeholder="Age" onChange={handleChange} />
            <button type="submit">Add Faculty</button>
        </form>
    );
}

export default AddFaculty;
