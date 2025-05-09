import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "./Games/Knockout/types/User";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromStorage = sessionStorage.getItem("token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    } else {
      alert("Please log in to view your profile.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    axios
      .get<User>(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          sessionStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [token, navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await axios.post(
        `${API_BASE}/api/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update password.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile || !token) return;
    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    try {
      await axios.post(`${API_BASE}/api/upload-profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profile picture updated!");
      setSelectedFile(null);
      const res = await axios.get<User>(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload profile picture.");
    }
  };

  if (!user) return <p className="text-center text-white">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex justify-center items-center p-6">
      <div className="w-full max-w-3xl bg-blue/20 border-2 border-purple-600 rounded-2xl shadow-xl p-8 space-y-8">
        <h3 className="text-3xl font-bold text-orange-400">🎮 Gamer Profile</h3>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={
              user.profilePic
                ? `${API_BASE}/uploads/${user.profilePic}?t=${Date.now()}`
                : "https://via.placeholder.com/100"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-orange-500 shadow-md object-cover"
          />

          <div className="text-lg space-y-1">
            <p><span className="text-purple-400 font-bold">Name:</span> {user.name}</p>
            <p><span className="text-purple-400 font-bold">Email:</span> {user.email}</p>
            <p><span className="text-purple-400 font-bold">Country:</span> {user.country}</p>
            <p><span className="text-purple-400 font-bold">City:</span> {user.city}</p>
            <p><span className="text-purple-400 font-bold">Role:</span> {user.role}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-orange-300 mb-2">🖼 Upload New Profile Picture</h4>
          <input type="file" onChange={handleFileChange} accept="image/*" className="bg-black text-white border border-purple-500 p-2 rounded w-full" />
          <button
            onClick={handleUploadProfilePic}
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full shadow"
            disabled={!selectedFile}
          >
            Upload
          </button>

          {selectedFile && (
            <div className="mt-3">
              <p className="text-sm text-gray-400">Preview:</p>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-20 h-20 rounded-full border border-orange-500 mt-1 object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xl font-semibold text-orange-300 mb-2">🔐 Change Password</h4>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full bg-black text-white border border-purple-500 p-2 rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-black text-white border border-purple-500 p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold shadow">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
