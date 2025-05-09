import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        credentials: "include", // important for cookie-based auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("Login success:", data);

      // Log the token received from the backend
      console.log("Received Token:", data.token); // <-- Log the token here

      // Store the token in sessionStorage
      const token = data.token;
      if (token) {
        sessionStorage.setItem("token", token);
      }

      const role = data.user.role.toLowerCase(); // Normalizing the role

      // Redirect based on the role
      if (role === "educator") {
        navigate("/dashboard/educator");
      } else if (role === "student") {
        navigate("/dashboard/student");
      }else if (role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate(`/dashboard/other`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login error:", err.message);
        alert(err.message);
      } else {
        console.error("An unknown error occurred");
        alert("An unknown error occurred");
      }
    }
  };

  return (
    <div>
    <Navbar />
    <div className="flex flex-col  items-center justify-center min-h-screen bg-blue/70 text-white px-4">
      <h2 className="text-2xl font-bold mb-6">Login Here</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 text-white py-2 rounded-md font-semibold"
        >
          Log In
        </button>

        <p className="text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <span
            className="text-green-400 underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
    </div>

  );
};

export default Login;
