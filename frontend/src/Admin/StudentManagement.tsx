import { useEffect, useState } from "react";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    city: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/students/${id}`, {
        method: "DELETE",
      });
      fetchStudents();
    } catch (err) {
      console.error("Failed to remove student:", err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "student" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add student");
      }

      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        country: "",
        city: "",
      });
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      console.error("Failed to add student:", err);
      alert("Error adding student.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowForm(true)}
      >
        Add Student
      </button>

      {showForm && (
        <form
          onSubmit={handleAddStudent}
          className="bg-gray-100 p-4 rounded mb-4 shadow"
        >
          <div className="grid grid-cols-2 gap-4 mb-2">
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="p-2 border rounded" />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-2 border rounded" />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 border rounded" />
            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="p-2 border rounded" />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="p-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <table className="w-full text-left border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Country</th>
            <th className="border px-4 py-2">City</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: any) => (
            <tr key={student._id}>
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2">{student.email}</td>
              <td className="border px-4 py-2">{student.username}</td>
              <td className="border px-4 py-2">{student.country}</td>
              <td className="border px-4 py-2">{student.city}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentManagement;
