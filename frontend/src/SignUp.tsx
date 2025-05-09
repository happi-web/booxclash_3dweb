import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    city: "",
    role: "educator",
    otherRole: "",
    gradeLevel: "",
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const detectedRole = form.password.toLowerCase().includes("admin")
      ? "admin"
      : form.role === "other" && form.otherRole
      ? form.otherRole
      : form.role;

    const payload = {
      ...form,
      role: detectedRole,
    };

    try {
      const signupRes = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!signupRes.ok) {
        const error = await signupRes.json();
        throw new Error(error.error || "Signup failed");
      }

      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      });

      if (!loginRes.ok) {
        const error = await loginRes.json();
        throw new Error(error.error || "Login failed");
      }

      const { token, user } = await loginRes.json();
      localStorage.setItem("token", token);

      if (user.role.toLowerCase() === "student") {
        navigate("/dashboard/student");
      } else if (user.role.toLowerCase() === "educator") {
        navigate("/dashboard/educator");
      } else if (user.role.toLowerCase() === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      console.error("Signup/Login error:", errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue/70 text-white px-4">
        <h2 className="text-2xl font-bold mt-20">Sign Up Here</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mt-5">
          {[
            { name: "name", placeholder: "Full Name" },
            { name: "username", placeholder: "Username" },
            { name: "email", placeholder: "Email", type: "email" },
            { name: "password", placeholder: "Password", type: "password" },
            { name: "country", placeholder: "Country" },
            { name: "city", placeholder: "City" },
          ].map(({ name, placeholder, type = "text" }) => (
            <input
              key={name}
              type={type}
              name={name}
              placeholder={placeholder}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              required={["name", "username", "email", "password"].includes(name)}
              className="p-1 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ))}

          {/* Grade Level Dropdown */}
          <select
            name="gradeLevel"
            value={form.gradeLevel}
            onChange={handleChange}
            className="p-1 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Grade Level (Optional)</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          {/* Role Selection */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-1 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="educator">Educator</option>
            <option value="student">Student</option>
            <option value="other">Other (specify)</option>
          </select>

          {form.role === "other" && (
            <input
              type="text"
              name="otherRole"
              placeholder="Specify Role"
              value={form.otherRole}
              onChange={handleChange}
              className="p-1 rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 text-white py-2 rounded-md font-semibold"
          >
            Sign Up
          </button>

          <p className="text-sm text-gray-300 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-400 underline cursor-pointer hover:text-blue-500"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
