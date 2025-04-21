import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";

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
      .get<User>("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        "http://localhost:5000/api/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to update password. Please try again."
      );
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
      await axios.post("http://localhost:5000/api/upload-profile-pic", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile picture updated!");
      setSelectedFile(null);

      // Refresh user data
      const res = await axios.get<User>("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload profile picture.");
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-2xl font-semibold mb-4">Profile</h3>
      <div className="flex items-center gap-6 mb-6">
      <img
        src={
            user.profilePic
            ? `http://localhost:5000/uploads/${user.profilePic}?t=${Date.now()} ` // Construct the correct URL
            : "https://via.placeholder.com/100"
        }
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover"
        
        />

        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Country:</strong> {user.country}</p>
          <p><strong>City:</strong> {user.city}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Upload New Profile Picture</h4>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button
          onClick={handleUploadProfilePic}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          disabled={!selectedFile}
        >
          Upload
        </button>
        {selectedFile && (
            <div className="mt-2">
                <p className="text-sm text-gray-600">Preview:</p>
                <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border mt-1"
                />
            </div>
            )}

      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Change Password</h4>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            className="block w-full p-2 border rounded"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="block w-full p-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
