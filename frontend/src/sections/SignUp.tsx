import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const payload = {
      ...form,
      role: form.role === "other" && form.otherRole ? form.otherRole : form.role,
    };
  
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Signup failed");
      }
  
      // ✅ Redirect on success
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("SignUp error:", errorMessage);
      alert(errorMessage);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-6">Host Signup</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />
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
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="educator">Educator</option>
          <option value="other">Other (specify)</option>
        </select>

        {form.role === "other" && (
          <input
            type="text"
            name="otherRole"
            placeholder="Specify Role"
            value={form.otherRole}
            onChange={handleChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded"
          />
        )}

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
        >
          Sign Up
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-400 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
